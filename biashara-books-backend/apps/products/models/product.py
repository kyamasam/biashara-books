import uuid
import os
from datetime import datetime

from django.conf import settings
from django.db import models
from django.utils.crypto import get_random_string

from apps.users.models import UtilColumnsModel
from .product_category import ProductCategory


def product_photo_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    rand = get_random_string(length=6)
    date_str = datetime.today().strftime("%Y/%m/%d")
    return f"products/{date_str}/{instance.id}_{rand}{ext}"


class Product(UtilColumnsModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    photo = models.ImageField(upload_to=product_photo_upload_to, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    product_category = models.ForeignKey(
        ProductCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
