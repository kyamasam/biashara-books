import uuid

from django.db import models

from apps.users.models import UtilColumnsModel
from apps.products.models import Inventory
from .sale import Sale


class SaleDetail(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="details")
    quantity = models.FloatField()
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=15, decimal_places=2)
    inventory = models.ForeignKey(Inventory, on_delete=models.PROTECT, related_name="sale_details")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.inventory.product.name} x{self.quantity} | {self.total_price}"
