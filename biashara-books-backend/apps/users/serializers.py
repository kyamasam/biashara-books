import os
from datetime import timedelta
from django.core.validators import RegexValidator
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import EmailMessage
from django.db import transaction
from django.template.loader import get_template
from django.utils import timezone
from django.utils.crypto import get_random_string
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.constants import USER_TYPE_WAGE_WORKER, USER_TYPE_SITE_MANAGER,USER_TYPE_SYSTEM_ADMIN
from apps.users.models import User, Profile
import random
from datetime import timedelta
from django.utils import timezone
import africastalking
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["is_superuser"] = user.is_superuser
        return token
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        """
        Validate the new password.
        Add any password validation rules here.
        """
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long")

        return value

class GroupSerializer(serializers.ModelSerializer):
    value = serializers.SerializerMethodField("get_value", read_only=True)
    label = serializers.SerializerMethodField("get_label", read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "value", "label"]

    def get_value(self, obj):
        return obj.id

    def get_label(self, obj):
        return obj.name


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "tagline", "suite_number", "address",
                  "latitude","longitude","description", "profile_photo", 
                  "user_id", "cover_photo", "created_at", "updated_at"]
        read_only_fields = ["user_id", ]

    def create(self, validated_data):
        user = self.context["request"].user
        prof = Profile.objects.filter(user_id=user.id)
        if prof.count() > 0:
            new_prof = prof[0]
            new_prof.tagline = validated_data["tagline"]
            new_prof.description = validated_data["description"]
            new_prof.save()
            return new_prof
        else:
            Profile.objects.create(user=user, **validated_data)
        return Profile

    def update(self, instance, validated_data):
        profile = super().update(instance, validated_data)
        return profile


class UserSerializer(serializers.ModelSerializer):

    
    password = serializers.CharField(write_only=True, required=False,
                                     style={"input_type": "password", "placeholder": "Password"}, )
    groups_objects = serializers.SerializerMethodField("get_groups_objects", read_only=True)
    groups = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), many=True, required=False)
    profile = ProfileSerializer(required=False)

    is_admin = serializers.SerializerMethodField()

    def get_is_admin(self, obj):
        return obj.is_superuser

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "password", "phone_code", "phone_number", "groups",
                  "groups_objects","avatar", "staff_number", "is_admin", "email", "profile", "user_type"]


    def validate(self, attrs):
        valid_user_types = [
            USER_TYPE_WAGE_WORKER,
            USER_TYPE_SITE_MANAGER,
            USER_TYPE_SYSTEM_ADMIN
        ]
        user_type = attrs.get("user_type", None)
        if user_type is not None:
            if user_type not in valid_user_types:
                raise serializers.ValidationError("Invalid user type")
        
        return super().validate(attrs)




    def get_groups_objects(self, obj) -> list:
        return GroupSerializer(obj.groups, many=True).data

    @transaction.atomic
    def create(self, validated_data):
        # todo : prevent user from sending groups if they are not an admin user
        user_type = validated_data.pop("user_type", None)
        if user_type is None:
            user_type = USER_TYPE_WAGE_WORKER
        groups = validated_data.pop("groups", None)
        if not self.context["request"].user.is_staff:
            # cannot add groups since user is not admin
            groups = []
            staff_number = ""

        profile_data = validated_data.pop("profile", None)
        user = User.objects.create_user(user_type=user_type, **validated_data)

        if groups is not None:
            for group in groups:
                user.groups.add(group)
        # create the user Profile
        if profile_data is not None:
            Profile.objects.create(user=user, **profile_data)
        else:
            Profile.objects.create(user=user)
        user_type =  validated_data.pop("user_type", None)
        
        # also return token
        return user

    def update(self, instance, validated_data):
        # discard user type during update
        user_type = validated_data.pop("user_type", None)
        groups = validated_data.pop("groups", None)
        password = validated_data.pop("password", None)

        try:
            staff_number = validated_data.pop("staff_number")
        except KeyError:
            pass
        if not self.context["request"].user.is_staff:
            # cannot add groups since user is not admin
            groups = None
        profile_data = validated_data.pop("profile", None)

        user = super().update(instance, validated_data)
        if password:
            hashed_password = make_password(password)
            user.password = hashed_password
            user.save()

        if groups is not None:
            user.groups.clear()
            for group in groups:
                user.groups.add(group)
        user.save()
        if profile_data is not None:
            # check if the user has a profile
            try:
                prof = user.profile
                profile_serializer = ProfileSerializer(prof, data=profile_data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
            except ObjectDoesNotExist:
                prof = Profile.objects.create(user=user, **profile_data)
                user.profile = prof
                user.save()

        return user


class MiniUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class ResetPasswordSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["email", "password_reset_code", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        try:
            user = User.objects.get(email=validated_data.get("email"),
                                    password_reset_code=validated_data.get("password_reset_code"), )
            now = timezone.now()
            if user.password_reset_code_expires_at < now:
                raise serializers.ValidationError("Password reset code is expired")
            if user.password_reset_code_used:
                raise serializers.ValidationError("Password reset code has already been used")

        except User.DoesNotExist:
            raise serializers.ValidationError("Code is invalid or user with that email does not exist")

        if password:
            hashed_password = make_password(password)
            user.password = hashed_password
            user.password_reset_code_used = True
            user.save()
            message = get_template("emails/passwordChangeSuccess.html").render(
                {"project_name": os.environ.get("PROJECT_NAME")})
            mail = EmailMessage(subject="Password Changed Successfully", body=message,
                                from_email=os.environ.get("EMAIL_HOST_USER"), to=[user.email], )
            mail.content_subtype = "html"
            mail.send()
        return User


class SendPasswordResetCodeSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    class Meta:
        fields = ["email"]

    def create(self, validated_data):
        email = validated_data.pop("email")
        # send this code via email
        try:
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return validated_data  # raise serializers.ValidationError("That Email does not exist")
        password_reset_code = get_random_string(length=12)
        user.password_reset_code = password_reset_code
        user.password_reset_code_used = False

        # now

        now = timezone.now()
        future_date = now + timedelta(hours=settings.PASSWORD_RESET_TIMEOUT["hours"],
                                      days=settings.PASSWORD_RESET_TIMEOUT["days"], )
        user.password_reset_code_expires_at = future_date
        user.save()
        fe_link = os.environ.get('FRONT_END_LINK')
        if fe_link[-1] != '/':
            fe_link += '/'
        message = get_template("emails/passwordReset.html").render(
            {"expiry_date": future_date, "front_end_link": os.environ.get("FRONT_END_LINK"),
             "password_reset_code": password_reset_code, "action_url": f"{fe_link}renew-password/{password_reset_code}",
             "project_name": os.environ.get("PROJECT_NAME"), })
        mail = EmailMessage(subject="Password Reset Request", body=message,
                            from_email=os.environ.get("EMAIL_HOST_USER"), to=[email], )
        mail.content_subtype = "html"
        mail.send()

        return user



phone_validator = RegexValidator(
    regex=r"^\d{9,10}$",
    message="Enter a valid phone number (9-10 digits)",
)

phone_code_validator = RegexValidator(
    regex=r"^\+\d{1,3}$",
    message="Enter a valid country code (e.g. +254)",
)

class RequestOTPSerializer(serializers.Serializer):
    """Serializer for requesting OTP via SMS"""
    phone_code = serializers.CharField(
        max_length=4,
        validators=[phone_code_validator],
        required=True,
        help_text="Country code e.g. +254"
    )
    phone_number = serializers.CharField(
        max_length=10,
        validators=[phone_validator],
        required=True,
        help_text="Phone number without country code"
    )

    class Meta:
        fields = ["phone_code", "phone_number"]

    def validate(self, attrs):
        """Validate that the phone number exists in the system"""
        phone_number = attrs.get('phone_number')
        
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise serializers.ValidationError("No account found with this phone number")
        
        return attrs

    def save(self):
        """Generate and send OTP to the user's phone"""
        phone_number = self.validated_data['phone_number']
        phone_code = self.validated_data['phone_code']
        
        # Get user
        user = User.objects.get(phone_number=phone_number)
        
        # Generate 6-digit OTP
        otp_code = f"{random.randint(100000, 999999)}"
        
        # Set OTP expiry time (5 minutes from now)
        expiry_time = timezone.now() + timedelta(minutes=5)
        
        # Update user with OTP details
        user.otp_code = otp_code
        user.otp_code_used = False
        user.otp_code_expires_at = expiry_time
        user.save()
        
        self._send_sms(phone_code, phone_number, otp_code)

        return user

    def _send_sms(self, phone_code, phone_number, otp_code):
        import logging
        logger = logging.getLogger(__name__)
        try:
            africastalking.initialize(
                settings.AFRICAS_TALKING_USERNAME,
                settings.AFRICAS_TALKING_API_KEY,
            )
            sms = africastalking.SMS
            full_phone_number = f"{phone_code}{phone_number}"
            kwargs = {
                "message": f"Your Biashara Books verification code is: {otp_code}. It expires in 5 minutes.",
                "recipients": [full_phone_number],
            }
            if settings.AFRICAS_TALKING_SENDER_ID:
                kwargs["sender_id"] = settings.AFRICAS_TALKING_SENDER_ID
            sms.send(**kwargs)
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            raise serializers.ValidationError("Failed to send SMS. Please try again.")


class SetPinSerializer(serializers.Serializer):
    pin = serializers.CharField(min_length=4, max_length=4)
    confirm_pin = serializers.CharField(min_length=4, max_length=4)

    def validate_pin(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("PIN must contain only digits")
        return value

    def validate(self, attrs):
        if attrs['pin'] != attrs['confirm_pin']:
            raise serializers.ValidationError("PINs do not match")
        return attrs

    def save(self, user):
        from django.contrib.auth.hashers import make_password
        user.pin = make_password(self.validated_data['pin'])
        user.save(update_fields=['pin'])
        return user


class PinLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(
        max_length=10,
        validators=[phone_validator],
    )
    pin = serializers.CharField(min_length=4, max_length=4)

    def validate_pin(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("PIN must contain only digits")
        return value

    def validate(self, attrs):
        from django.contrib.auth.hashers import check_password
        phone_number = attrs.get('phone_number')
        pin = attrs.get('pin')

        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid phone number or PIN")

        if not user.pin:
            raise serializers.ValidationError("No PIN set for this account. Please login with your password first.")

        if not check_password(pin, user.pin):
            raise serializers.ValidationError("Invalid phone number or PIN")

        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for verifying OTP and returning JWT tokens"""
    phone_number = serializers.CharField(
        max_length=10,
        validators=[phone_validator],
        required=True,
        help_text="Phone number without country code"
    )
    otp_code = serializers.CharField(
        max_length=6,
        min_length=6,
        required=True,
        help_text="6-digit OTP code"
    )

    class Meta:
        fields = ["phone_number", "otp_code"]

    def validate(self, attrs):
        """Validate OTP code and phone number"""
        phone_number = attrs.get('phone_number')
        otp_code = attrs.get('otp_code')
        
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid phone number")
        
        # Check if OTP code matches
        if user.otp_code != otp_code:
            raise serializers.ValidationError("Invalid OTP code")
        
        # Check if OTP has expired
        if user.otp_code_expires_at < timezone.now():
            raise serializers.ValidationError("OTP code has expired")
        
        # Check if OTP has already been used
        if user.otp_code_used:
            raise serializers.ValidationError("OTP code has already been used")
        
        # Store user in validated data for use in save method
        attrs['user'] = user
        return attrs

    def save(self):
        """Mark OTP as used and return JWT tokens"""
        user = self.validated_data['user']
        
        # Mark OTP as used
        user.otp_code_used = True
        user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return {
            'user': user,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }

