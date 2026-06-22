import uuid

from django.db import models

from apps.users.models import UtilColumnsModel
from apps.transactions.models import Transaction


class Sale(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sub_total = models.DecimalField(max_digits=15, decimal_places=2)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2)
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Sale {self.id} | total: {self.total}"
