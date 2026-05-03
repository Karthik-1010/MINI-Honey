from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from django.db.models import Sum, Count
from django.utils import timezone
from django.core.files.storage import default_storage
from django.conf import settings
import os
from .models import Category, MenuItem, Order, OrderItem, InventoryItem, StockItem
from .serializers import CategorySerializer, MenuItemSerializer, OrderSerializer, InventoryItemSerializer, StockItemSerializer

@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_image(request):
    file = request.FILES.get('image')
    if not file:
        return Response({'error': 'No image provided'}, status=400)
    # Use forward slash explicitly — os.path.join uses backslash on Windows
    save_path = f'menu_images/{file.name}'
    path = default_storage.save(save_path, file)
    # Normalize to forward slashes for URL
    url_path = path.replace('\\', '/')
    url = request.build_absolute_uri(settings.MEDIA_URL + url_path)
    return Response({'url': url})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        """Auto-calculate total_amount from items if not explicitly provided."""
        order = serializer.save()
        if not order.total_amount:
            total = sum(
                item.menu_item.price * item.quantity
                for item in order.items.all()
            )
            order.total_amount = total
            order.save(update_fields=['total_amount'])

    @action(detail=False, methods=['get'])
    def daily_status(self, request):
        today = timezone.now().date()
        orders_today = Order.objects.filter(created_at__date=today)

        total_revenue = orders_today.filter(status='COMPLETED').aggregate(
            total=Sum('total_amount'))['total'] or 0
        total_orders = orders_today.count()
        pending_orders = orders_today.filter(status='PENDING').count()
        completed_orders = orders_today.filter(status='COMPLETED').count()
        cancelled_orders = orders_today.filter(status='CANCELLED').count()

        return Response({
            'date': today,
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'cancelled_orders': cancelled_orders,
        })

    @action(detail=False, methods=['get'])
    def weekly_report(self, request):
        from datetime import timedelta
        today = timezone.now().date()
        week_start = today - timedelta(days=6)
        days = []
        for i in range(7):
            day = week_start + timedelta(days=i)
            day_orders = Order.objects.filter(created_at__date=day)
            revenue = day_orders.filter(status='COMPLETED').aggregate(
                total=Sum('total_amount'))['total'] or 0
            days.append({
                'date': day.strftime('%a'),
                'full_date': str(day),
                'orders': day_orders.count(),
                'revenue': float(revenue),
                'completed': day_orders.filter(status='COMPLETED').count(),
                'cancelled': day_orders.filter(status='CANCELLED').count(),
            })
        total_revenue = sum(d['revenue'] for d in days)
        total_orders = sum(d['orders'] for d in days)
        return Response({
            'week_start': str(week_start),
            'week_end': str(today),
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'days': days,
        })

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        return Response({'error': 'Invalid status. Use: PENDING, PREPARING, COMPLETED, CANCELLED'},
                        status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_order(self, request, pk=None):
        order = self.get_object()
        order.delete()
        return Response({'status': 'deleted'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def clear_all(self, request):
        deleted_count, _ = Order.objects.all().delete()
        return Response({'status': 'cleared', 'deleted': deleted_count})

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

    @action(detail=False, methods=['post'])
    def clear_all(self, request):
        InventoryItem.objects.all().delete()
        return Response({'status': 'all items cleared'})

class StockViewSet(viewsets.ModelViewSet):
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer
