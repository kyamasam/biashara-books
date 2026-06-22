from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, serializers, permissions
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from apps.users.constants import USER_TYPE_SYSTEM_ADMIN,USER_TYPE_WAGE_WORKER
from apps.users.models import User
from apps.users.permissions import AnonCreateAndUpdateOwnerOnly
from apps.users.serializers import ChangePasswordSerializer, CustomTokenObtainPairSerializer, RequestOTPSerializer, UserSerializer, SendPasswordResetCodeSerializer, \
    ResetPasswordSerializer, VerifyOTPSerializer, SetPinSerializer, PinLoginSerializer
from drf_spectacular.utils import extend_schema, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from apps.users.constants import USER_TYPE_SYSTEM_ADMIN, USER_TYPE_WAGE_WORKER, USER_TYPE_SITE_MANAGER
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes



# Create your views here.
class CustomObtainTokenPairView(TokenObtainPairView):
    permission_classes = (AllowAny)
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(
    description=f"""
    API endpoint for managing users.
    
    Available user types:
    USER_TYPE_WAGE_WORKER
    USER_TYPE_SITE_MANAGER
    USER_TYPE_SYSTEM_ADMIN

    """,
)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [AnonCreateAndUpdateOwnerOnly]
    # filter_backends = [DjangoFilterBackend]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["username", "email"]
    filterset_fields = ["username", ]

    def get_queryset(self):
        user = self.request.user

        # For customers, return only their account
        if user.user_type == USER_TYPE_WAGE_WORKER:
            return  User.objects.filter(pk=user.id)
        
        # For platform managers, return all accounts
        if user.user_type == USER_TYPE_SYSTEM_ADMIN:
            return User.objects.all()
        if user.is_staff or user.is_superuser:
            return User.objects.all(pk=user.id)
        
  
        return User.objects.none()

    def partial_update(self, request, pk=None):
        try:
            auth_user = self.request.user

            if  auth_user.is_staff or auth_user.is_superuser:
                user =  User.objects.get(pk=pk)
            else:
                if int(pk) != int(auth_user.id):
                    # todo: allow business managers to change other users
                    raise serializers.ValidationError('User Cannot update this user')
                user = User.objects.get(pk=pk)
            serializer = self.get_serializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    @action(detail=False, methods=["get"], url_path="get-current-user", serializer_class=UserSerializer, )
    def get_current_user(self, request):
        user_id = self.request.user.id

        user_obj = User.objects.prefetch_related("profile").get(pk=user_id)
        context = {"request": request}
        return Response(UserSerializer(user_obj, context=context).data)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='site_id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter users by site ID',
                required=False
            ),
            OpenApiParameter(
                name='site_role',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by site role',
                required=False,
                enum=['manager', 'member', 'all']
            ),
        
        ]
    )
    @action(
        detail=False,
        methods=["get"],
        url_path="site-members",
        permission_classes=[permissions.IsAuthenticated]
    )
    def get_site_members(self, request):
        """
        Get all site members.
        
        Query parameters:
        - site_id: Filter by specific site
        """
        user = request.user
        
        # Permission check
        if not (user.is_staff or user.is_superuser or user.user_type == USER_TYPE_SYSTEM_ADMIN):
            if user.user_type == USER_TYPE_SITE_MANAGER:
                # Site managers can only see members from their managed sites
                managed_sites = SiteManager.objects.filter(user=user).values_list('site', flat=True)
                if not managed_sites:
                    return Response({"members": [], "total_count": 0})
            else:
                return Response(
                    {"error": "Insufficient permissions"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        site_id = request.query_params.get('site_id')
        members_query = SiteMember.objects.select_related('user', 'site')
        
        if site_id:
            try:
                members_query = members_query.filter(site_id=int(site_id))
            except ValueError:
                return Response(
                    {"error": "Invalid site ID"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Apply site manager restrictions
        if user.user_type == USER_TYPE_SITE_MANAGER and not (user.is_staff or user.is_superuser):
            managed_sites = SiteManager.objects.filter(user=user).values_list('site', flat=True)
            members_query = members_query.filter(site__in=managed_sites)

        members_data = []
        for site_member in members_query:
            user_serializer = UserSerializer(site_member.user, context={'request': request})
            member_data = user_serializer.data
            member_data['member_site'] = {
                'id': site_member.site.id,
                'name': site_member.site.name,
                'location': site_member.site.location
            }
            members_data.append(member_data)

        return Response({
            "members": members_data,
            "total_count": len(members_data)
        })
    @action(detail=False, methods=["post"], url_path="send-reset-link", permission_classes=[permissions.AllowAny],
            serializer_class=SendPasswordResetCodeSerializer, )
    def send_reset_password_code(self, request):
        serializer = SendPasswordResetCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        else:
            raise serializers.ValidationError(serializer.errors, code=400)
        return Response({"data": "Email Sent"})

    @action(detail=False, methods=["post"], url_path="reset-password", permission_classes=[permissions.AllowAny],
            serializer_class=ResetPasswordSerializer, )
    def reset_password(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        return Response({"data": "Password Changed Successfully"})
    
    @action(
        methods=["POST"],
        permission_classes=[permissions.IsAuthenticated],
        detail=False,
        url_path="change-password",
        serializer_class=ChangePasswordSerializer
    )
    def change_password(self, request, *args, **kwargs):
        """
        Change user password.
        Request should contain:
        {
            "current_password": "oldpass123",
            "new_password": "newpass123"
        }
        """
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                raise serializers.ValidationError(serializer.errors)

            # Get validated data
            current_password = serializer.validated_data.get('current_password')
            new_password = serializer.validated_data.get('new_password')
            user = request.user

            # Check if current password is correct
            if not user.check_password(current_password):
                raise serializers.ValidationError("Current password is incorrect")


            # Set new password
            user.set_password(new_password)
            user.save()

            return Response(
                {
                    "error": False,
                    "data": None,
                    "msg": "Password changed successfully",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "error": True,
                    "data": None,
                    "msg": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    @action(
        detail=False,
        methods=["post"],
        url_path="request-otp",
        permission_classes=[permissions.AllowAny],
        serializer_class=RequestOTPSerializer,
    )
    def request_otp(self, request):
        """
        Request OTP via SMS for phone number authentication.
        
        Send a 6-digit OTP code to the provided phone number.
        The code expires in 5 minutes.
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "error": False,
                "message": "OTP sent successfully",
                "data": {
                    "phone_number": user.phone_number,
                    "expires_in": "5 minutes"
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            "error": True,
            "message": "Failed to send OTP",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


    @extend_schema(tags=["users"])
    @action(
        detail=False,
        methods=["post"],
        url_path="set-pin",
        permission_classes=[permissions.IsAuthenticated],
        serializer_class=SetPinSerializer,
    )
    def set_pin(self, request):
        """Set or update the authenticated user's 4-digit PIN."""
        serializer = SetPinSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"error": False, "message": "PIN set successfully"}, status=status.HTTP_200_OK)
        return Response({"error": True, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(tags=["users"])
    @action(
        detail=False,
        methods=["post"],
        url_path="login-with-pin",
        permission_classes=[permissions.AllowAny],
        serializer_class=PinLoginSerializer,
    )
    def login_with_pin(self, request):
        """Authenticate with phone number and 4-digit PIN, returns JWT tokens."""
        serializer = PinLoginSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            user = result['user']
            tokens = result['tokens']
            return Response({
                "error": False,
                "message": "Login successful",
                "data": {
                    "user": {
                        "id": user.id,
                        "phone_number": user.phone_number,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "email": user.email,
                        "user_type": user.user_type,
                    },
                    "tokens": tokens,
                }
            }, status=status.HTTP_200_OK)
        return Response({"error": True, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["post"],
        url_path="verify-otp",
        permission_classes=[permissions.AllowAny],
        serializer_class=VerifyOTPSerializer,
    )
    def verify_otp(self, request):
        """
        Verify OTP code and return JWT tokens.
        
        Validates the OTP code and returns access/refresh tokens
        for successful authentication.
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            result = serializer.save()
            user = result['user']
            tokens = result['tokens']
            
            return Response({
                "error": False,
                "message": "OTP verified successfully",
                "data": {
                    "user": {
                        "id": user.id,
                        "phone_number": user.phone_number,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "email": user.email,
                        "user_type": user.user_type,
                    },
                    "tokens": tokens
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            "error": True,
            "message": "OTP verification failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


