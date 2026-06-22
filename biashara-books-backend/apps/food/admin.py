# apps/food_app/admin.py
from django.contrib import admin
from .models import Menu, Dish, FoodPurchase, FoodPurchaseItem


class DishInline(admin.TabularInline):
    """Inline admin for dishes within a menu"""
    model = Dish
    extra = 1
    fields = ['name', 'cost']
    show_change_link = True


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'dish_count']
    list_filter = ['created_at']
    search_fields = ['dish__name']
    ordering = ['-created_at']
    inlines = [DishInline]
    
    def dish_count(self, obj):
        """Display number of dishes in the menu"""
        return obj.dish_set.count()
    dish_count.short_description = 'Number of Dishes'


@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'cost', 'menu', 'created_date']
    list_filter = ['menu', 'cost']
    search_fields = ['name']
    ordering = ['name']
    list_editable = ['cost']
    list_select_related = ['menu']
    
    def created_date(self, obj):
        """Display menu creation date"""
        return obj.menu.created_at if obj.menu else None
    created_date.short_description = 'Menu Date'
    created_date.admin_order_field = 'menu__created_at'


class FoodPurchaseItemInline(admin.TabularInline):
    """Inline admin for food purchase items"""
    model = FoodPurchaseItem
    extra = 0
    fields = ['dish', 'price_per_unit', 'number_of_units', 'total_charged']
    readonly_fields = ['total_charged']
    autocomplete_fields = ['dish']


@admin.register(FoodPurchase)
class FoodPurchaseAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'user', 
        'total_purchased', 
        'is_paid', 
        'served_by',
        'item_count',
        'created_date'
    ]
    list_filter = ['is_paid','user', 'served_by']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'served_by__email']
    ordering = ['-id']
    list_editable = ['is_paid']
    autocomplete_fields = ['user', 'served_by']
    inlines = [FoodPurchaseItemInline]
    
    fieldsets = (
        ('Purchase Information', {
            'fields': ('user', 'served_by')
        }),
        ('Payment Details', {
            'fields': ('total_purchased', 'is_paid')
        }),
    )
    
    def item_count(self, obj):
        """Display number of items in the purchase"""
        return obj.items.count()
    item_count.short_description = 'Items'
    
    def created_date(self, obj):
        """Display creation date (you might want to add this field to the model)"""
        return "N/A"  # Add created_at field to model if needed
    created_date.short_description = 'Purchase Date'


@admin.register(FoodPurchaseItem)
class FoodPurchaseItemAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'food_purchase',
        'dish',
        'price_per_unit',
        'number_of_units', 
        'total_charged',
        'purchase_user',
        'is_paid'
    ]
    list_filter = ['dish', 'food_purchase__is_paid']
    search_fields = [
        'dish__name', 
        'food_purchase__user__email',
        'food_purchase__user__first_name',
        'food_purchase__user__last_name'
    ]
    ordering = ['-food_purchase__id']
    autocomplete_fields = ['food_purchase', 'dish']
    readonly_fields = ['total_charged']
    
    fieldsets = (
        ('Item Details', {
            'fields': ('food_purchase', 'dish')
        }),
        ('Pricing', {
            'fields': ('price_per_unit', 'number_of_units', 'total_charged')
        }),
    )
    
    def purchase_user(self, obj):
        """Display the user who made the purchase"""
        return obj.food_purchase.user.email
    purchase_user.short_description = 'Customer'
    purchase_user.admin_order_field = 'food_purchase__user__email'
    
    def is_paid(self, obj):
        """Display payment status"""
        return obj.food_purchase.is_paid
    is_paid.short_description = 'Paid'
    is_paid.boolean = True
    is_paid.admin_order_field = 'food_purchase__is_paid'


# Customize admin site headers
admin.site.site_header = "My Pay - Food Management"
admin.site.site_title = "Food Admin"
admin.site.index_title = "Food Management Administration"