import os
from datetime import datetime
import uuid
import django
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser, UserManager
from django.core.validators import RegexValidator
from django.db import models
from django.utils.crypto import get_random_string
from .constants import USER_TYPE_WAGE_WORKER, user_types
from django.db.models import Sum, F

# Create your models here.
class UtilColumnsModel(models.Model):
    """Abstract model for created_at & updated_at fields."""

    created_at = models.DateTimeField(default=django.utils.timezone.now, null=True, blank=True)
    updated_at = models.DateTimeField(blank=True, null=True, default=django.utils.timezone.now)
    is_active = models.BooleanField(default=True)

    class Meta:
        """Meta definition for TimeStampedModel."""
        abstract = True



# Create validator instances that handle None values by setting allow_blank=True
phone_validator = RegexValidator(
    regex=r"^\d{9,10}$",
    message="Enter a valid phone number (9-10 digits)",
)

phone_code_validator = RegexValidator(
    regex=r"^\+\d{1,3}$",
    message="Enter a valid country code (e.g. +254)",
)

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, email=None, **extra_fields):
        """Create a new user"""
        if not phone_number:
            raise ValueError('User must have a phone number')
        
        # Normalize email if provided
        if email:
            email = self.normalize_email(email)
        
        user = self.model(phone_number=phone_number, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        """Create a new superuser"""
        # Set default values for required fields
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('phone_code', '+254')  # Default Kenya code
        
        # Validate superuser flags
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=False, blank=True, null=True)
    username = models.CharField(max_length=255, blank=True, null=True, unique=False )
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    phone_code = models.CharField(
        max_length=4, 
        validators=[phone_code_validator],
        default="+254"
    )
    phone_number = models.CharField(
        max_length=10,
        validators=[phone_validator],
     
        unique=True
    )
    staff_number = models.CharField(max_length=30, unique=True, null=True)
    password_reset_code = models.CharField(max_length=300, blank=True, )
    avatar = models.ImageField(blank=True)
    password_reset_code_expires_at = models.DateTimeField(blank=True, null=True)
    password_reset_code_used = models.BooleanField(default=False)
    last_withdrawal_transaction_complete = models.BooleanField(default=True)
    last_withdrawal_time = models.DateTimeField(blank=True, null=True)
    otp_code = models.CharField(max_length=255, blank=True)
    otp_code_used = models.BooleanField(default=False)
    otp_code_expires_at = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []

    user_type = models.CharField(max_length=255, default =USER_TYPE_WAGE_WORKER, choices= user_types)
    pin = models.CharField(max_length=128, blank=True, null=True)
    objects = CustomUserManager()
    

    def clean(self):
        super().clean()

    def save(self, *args, **kwargs):
        self.username = f"{self.phone_code}{self.phone_number}"
        
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.get_full_name()} {self.phone_number}"
    


def custom_profile_photo_upload_to(instance, file):
    file_extension = os.path.splitext(str(file))[1]
    random_string = get_random_string(length=6)
    file_name = f"profile_{random_string}"
    today = datetime.today()
    date_str = today.strftime("%Y/%m/%d")  # Format: year/month/day
    return (f"profile_photo/cover/{date_str}/{instance.user.id}{file_name}{file_extension}")


def custom_profile_cover_photo_upload_to(instance, file):
    file_extension = os.path.splitext(str(file))[1]
    random_string = get_random_string(length=6)
    file_name = f"profile_cover_{random_string}"
    today = datetime.today()
    date_str = today.strftime("%Y/%m/%d")  # Format: year/month/day
    return (f"profile_cover_photo/{date_str}/{instance.user.id}{file_name}{file_extension}")


class Profile(UtilColumnsModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    cover_photo = models.ImageField(null=True, blank=True, upload_to=custom_profile_cover_photo_upload_to)
    tagline = models.CharField(max_length=400, null=True, blank=True)
    profile_photo = models.FileField(null=True, blank=True, upload_to=custom_profile_photo_upload_to)
    description = models.TextField(max_length=5000, null=True, blank=True)
    address = models.CharField(max_length=255, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    suite_number = models.CharField(max_length=255, null=True, blank=True)


    def __str__(self):
        return f"{self.user.get_full_name()}'s profile"
