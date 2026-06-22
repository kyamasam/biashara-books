from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.business.models import Business


def get_default_business_name(user):
    full_name = user.get_full_name().strip()
    if full_name:
        return f"{full_name}'s Business"[:255]

    identifier = user.username or f"{user.phone_code}{user.phone_number}" or f"User {user.pk}"
    return f"{identifier}'s Business"[:255]


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_business_after_account_creation(sender, instance, created, **kwargs):
    if not created:
        return

    Business.objects.get_or_create(
        user=instance,
        defaults={"name": get_default_business_name(instance)},
    )
