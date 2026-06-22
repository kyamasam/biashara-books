
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MenuViewSet, DishViewSet,FoodPurchaseViewSet

router = DefaultRouter()
router.register(r'menus', MenuViewSet, basename='menu')
router.register(r'dishes', DishViewSet, basename='dish')
router.register(r'food-purchases', FoodPurchaseViewSet, basename='food-purchase')

url_patterns = router.urls