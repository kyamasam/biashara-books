from rest_framework import serializers
from decimal import Decimal
from .models import Menu, Dish, FoodPurchase, FoodPurchaseItem, FoodPurchasePayment
from apps.users.models import User


class DishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dish
        fields = ['id','image', 'name', 'cost', 'is_available']


class MenuSerializer(serializers.ModelSerializer):
    dishes = DishSerializer(many=True, read_only=True, source='dish_set')
    
    class Meta:
        model = Menu
        fields = ['id','name', 'created_at', 'dishes']


class FoodPurchaseItemSerializer(serializers.ModelSerializer):
    dish_name = serializers.CharField(source='dish.name', read_only=True)
    
    class Meta:
        model = FoodPurchaseItem
        fields = [
            'id', 'dish', 'dish_name', 'price_per_unit', 
            'number_of_units', 'total_charged'
        ]
        read_only_fields = ['price_per_unit', 'total_charged']


class FoodPurchaseItemCreateSerializer(serializers.Serializer):
    """Serializer for creating food purchase items"""
    dish_id = serializers.IntegerField()
    number_of_units = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0.01)
    
    def validate_dish_id(self, value):
        """Validate dish exists and is available"""
        try:
            dish = Dish.objects.get(id=value)
            if not dish.is_available:
                raise serializers.ValidationError("This dish is not available")
            return value
        except Dish.DoesNotExist:
            raise serializers.ValidationError("Dish does not exist")


class FoodPurchasePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodPurchasePayment
        fields = ['id', 'amount_paid', 'payment_date', 'notes']
        read_only_fields = ['payment_date']


class FoodPurchaseSerializer(serializers.ModelSerializer):
    items = FoodPurchaseItemSerializer(many=True, read_only=True)
    payments = FoodPurchasePaymentSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    served_by_email = serializers.EmailField(source='served_by.email', read_only=True)
    served_by_name = serializers.SerializerMethodField()
    amount_unpaid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = FoodPurchase
        fields = [
            'id', 'user', 'user_email', 'user_name', 'served_by', 
            'served_by_email', 'served_by_name', 'total_purchased', 
            'amount_paid', 'amount_unpaid', 'is_paid', 'created_at', 
            'updated_at', 'items', 'payments'
        ]
        read_only_fields = [
            'served_by', 'total_purchased', 'amount_paid', 'is_paid',
            'created_at', 'updated_at'
        ]
    
    def get_user_name(self, obj):
        """Get user's full name or fallback"""
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.email
    
    def get_served_by_name(self, obj):
        """Get served_by user's full name or fallback"""
        if obj.served_by.first_name or obj.served_by.last_name:
            return f"{obj.served_by.first_name} {obj.served_by.last_name}".strip()
        return obj.served_by.email


class CreateFoodPurchaseSerializer(serializers.Serializer):
    """Serializer for creating a food purchase"""
    user_id = serializers.IntegerField()
    items = FoodPurchaseItemCreateSerializer(many=True, min_length=1)
    
    def validate_user_id(self, value):
        """Validate user exists"""
        try:
            user = User.objects.get(id=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
    
    def validate_items(self, value):
        """Validate items list is not empty and dishes exist"""
        if not value:
            raise serializers.ValidationError("At least one item is required")
        
        dish_ids = [item['dish_id'] for item in value]
        existing_dishes = Dish.objects.filter(id__in=dish_ids, is_available=True)
        
        if len(existing_dishes) != len(dish_ids):
            raise serializers.ValidationError("Some dishes are not available or don't exist")
        
        return value