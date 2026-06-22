from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.business.models import Business


class BusinessSignalTests(TestCase):
    def test_business_is_created_after_account_creation(self):
        user = get_user_model().objects.create_user(
            first_name="Sam",
            last_name="Kyama",
            phone_number="712345678",
            password="password",
        )

        self.assertTrue(Business.objects.filter(user=user).exists())
        self.assertEqual(user.business.name, "Sam Kyama's Business")

    def test_business_is_not_duplicated_when_account_is_updated(self):
        user = get_user_model().objects.create_user(
            phone_number="712345679",
            password="password",
        )

        user.first_name = "Updated"
        user.save()

        self.assertEqual(Business.objects.filter(user=user).count(), 1)
