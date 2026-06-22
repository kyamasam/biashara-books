import uuid

from django.db import models

from apps.users.models import UtilColumnsModel
from apps.transactions.models import Transaction
from .expense_type import ExpenseType


class Expense(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense_type = models.ForeignKey(ExpenseType, on_delete=models.PROTECT, related_name="expenses")
    other_name = models.CharField(max_length=255, null=True, blank=True)
    expense_amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        label = self.other_name or self.expense_type.name
        return f"{label} | {self.expense_amount}"
