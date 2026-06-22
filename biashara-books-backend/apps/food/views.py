from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from drf_spectacular.utils import extend_schema

from .models import Menu, Dish, FoodPurchase
from .serializers import MenuSerializer, DishSerializer, FoodPurchaseSerializer


@extend_schema(tags=["Menu"])
class MenuViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=["Dishes"])
class DishViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dish.objects.filter(is_available=True)
    serializer_class = DishSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['menu']
    search_fields = ['name']


@extend_schema(tags=["Food Purchases"])
class FoodPurchaseViewSet(viewsets.ModelViewSet):
    queryset = FoodPurchase.objects.select_related('user', 'served_by').all()
    serializer_class = FoodPurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['user', 'is_paid', 'served_by']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
