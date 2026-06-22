import uuid

from django.db import models

from apps.users.models import UtilColumnsModel
from apps.transactions.constants import (
    TransactionType,
    TransactionMethod,
    TransactionPurpose,
    PaymentChannel,
    TransactionStatus,
)


class Transaction(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    transaction_method = models.CharField(max_length=20, choices=TransactionMethod.choices)
    transaction_purpose = models.CharField(max_length=50, choices=TransactionPurpose.choices, null=True, blank=True)
    confirmation_code = models.CharField(max_length=100, null=True, blank=True)
    transaction_amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_channel = models.CharField(max_length=20, choices=PaymentChannel.choices, null=True, blank=True)
    receiver_number = models.CharField(max_length=50, null=True, blank=True)
    receiver_account = models.CharField(max_length=100, null=True, blank=True)
    transaction_status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.INITIATED)
    transaction_status_details = models.TextField(null=True, blank=True)
    sender_number = models.CharField(max_length=50, null=True, blank=True)
    reconciliation_id = models.CharField(max_length=100, null=True, blank=True)
    callback_resp = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} | {self.transaction_amount} | {self.transaction_status}"
