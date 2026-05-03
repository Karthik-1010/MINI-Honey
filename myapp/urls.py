from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, MenuItemViewSet, OrderViewSet, InventoryViewSet, StockViewSet, upload_image

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'stock', StockViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload-image/', upload_image, name='upload-image'),
]
