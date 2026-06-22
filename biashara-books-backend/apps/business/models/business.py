import uuid

from django.conf import settings
from django.db import models

from apps.users.models import UtilColumnsModel


class Business(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="business",
    )
    paybill_number= models.CharField(max_length=10, null=True, blank=True)
    

    class Meta:
        verbose_name_plural = "Businesses"

    def __str__(self):
        return self.name
