from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

class BaseFoodModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Menu(BaseFoodModel):
    name = models.CharField(max_length=255, default="Default Menu")
    def __str__(self):
        return f"Menu {self.pk}"


class Dish(BaseFoodModel):
    name = models.CharField(max_length=255)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='dish_images/', null=True, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class FoodPurchase(BaseFoodModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name="food_purchases")
    total_purchased = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    is_paid = models.BooleanField(default=False)
    served_by = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name='served_food_purchases')

    def __str__(self):
        return f"Food Purchase {self.pk} - {self.user.email} - ${self.total_purchased}"

    @property
    def amount_unpaid(self):
        """Calculate remaining unpaid amount"""
        return self.total_purchased - self.amount_paid
    @property
    def remaining_balance(self):
        """Calculate remaining balance"""
        return self.total_purchased - self.amount_paid

    def add_payment(self, amount):
        """Add payment and update paid status"""
        payment_amount = min(Decimal(str(amount)), self.amount_unpaid)
        self.amount_paid += payment_amount
        
        # Mark as paid if fully paid
        if self.amount_paid >= self.total_purchased:
            self.is_paid = True
            
        self.save()
        return payment_amount

    class Meta:
        ordering = ['created_at']  # For FIFO processing


class FoodPurchaseItem(BaseFoodModel):
    food_purchase = models.ForeignKey(FoodPurchase, on_delete=models.CASCADE, null=False, related_name='items')
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, null=False)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    number_of_units = models.DecimalField(max_digits=8, decimal_places=2, null=False)
    total_charged = models.DecimalField(max_digits=10, decimal_places=2, null=False)

    def __str__(self):
        return f"Item {self.pk} - {self.dish.name} x{self.number_of_units}"

    def save(self, *args, **kwargs):
        """Auto-calculate total_charged on save"""
        if not self.total_charged:
            self.total_charged = self.price_per_unit * self.number_of_units
        super().save(*args, **kwargs)



class FoodPurchasePayment(BaseFoodModel):
    """Track individual payments made towards food purchases"""
    food_purchase = models.ForeignKey(FoodPurchase, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    payment_date = models.DateTimeField(auto_now_add=True)
    transaction = models.ForeignKey('transactions.Transaction', on_delete=models.CASCADE, null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Optional payment notes")
    
    def __str__(self):
        return f"Payment {self.pk} - ${self.amount_paid} for Purchase {self.food_purchase.id}"

    class Meta:
        ordering = ['payment_date']
        
