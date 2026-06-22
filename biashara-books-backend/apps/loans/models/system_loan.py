import uuid

from django.db import models

from apps.users.models import UtilColumnsModel
from apps.loans.constants import InstitutionType


class SystemLoan(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution_name = models.CharField(max_length=255)
    institution_type = models.CharField(max_length=20, choices=InstitutionType.choices)
    loan_balance = models.DecimalField(max_digits=15, decimal_places=2)
    monthly_repayment_amount = models.DecimalField(max_digits=15, decimal_places=2)
    end_date = models.DateField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.institution_name} | {self.loan_balance}"
