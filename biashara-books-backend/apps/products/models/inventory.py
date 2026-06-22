import uuid

from django.conf import settings
from django.db import models

from apps.users.models import UtilColumnsModel
from apps.products.constants import InventoryType, UnitMetric
from .product import Product


class Inventory(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventory_items",
    )
    quantity = models.FloatField(default=0)
    inventory_type = models.CharField(max_length=10, choices=InventoryType.choices)
    unit_metric = models.CharField(max_length=10, choices=UnitMetric.choices, null=True, blank=True)
    unit_purchase_price = models.FloatField()
    unit_sale_price = models.DecimalField(max_digits=15, decimal_places=2)
    price_includes_tax = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="inventory_items",
    )

    class Meta:
        verbose_name_plural = "Inventory"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} | qty: {self.quantity}"
