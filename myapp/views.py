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
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=False, methods=['get'])
    def daily_status(self, request):
        today = timezone.now().date()
        orders_today = Order.objects.filter(created_at__date=today)
        
        total_revenue = orders_today.filter(status='COMPLETED').aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = orders_today.count()
        pending_orders = orders_today.filter(status='PENDING').count()
        completed_orders = orders_today.filter(status='COMPLETED').count()

        return Response({
            'date': today,
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders
        })

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'status': 'updated'})
        return Response({'error': 'invalid status'}, status=status.HTTP_400_BAD_REQUEST)

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
