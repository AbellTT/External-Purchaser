from config import settings
import logging
from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from rest_framework import status, views, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserSession
from .serializers import RegisterSerializer, UserSerializer
from apps.notifications.models import Notification
from apps.notifications.utils import send_user_notification


logger = logging.getLogger(__name__)

User = get_user_model()


# ============================================================
# TOKEN HELPERS
# ============================================================

def get_tokens_for_user(user, session):
    """
    Create access + refresh tokens for a user.

    The refresh token's expiration is tied to the existing
    UserSession expiration. Rotation therefore never extends
    the overall login session.
    """

    refresh = RefreshToken.for_user(user)

    # How much time remains in this login session?
    remaining_time = session.session_expires_at - timezone.now()

    # The session should already have been checked before this
    # function is called, but protect against an expired session.
    if remaining_time.total_seconds() <= 0:
        raise ValueError("Session has already expired")

    # Make the refresh token expire at the same time as
    # the database session.
    refresh.set_exp(lifetime=remaining_time)

    # Connect this JWT to the database session.
    refresh['session_id'] = session.id

    return {
        'accessToken': str(refresh.access_token),
        'refreshToken': str(refresh),
    }


def set_refresh_cookie(response, refresh_token, remember_me=False):
    """
    Store refresh token in an HttpOnly cookie.

    The cookie lifetime matches the session lifetime.
    """

    max_age = (
        30 * 24 * 60 * 60
        if remember_me
        else 7 * 24 * 60 * 60
    )

    response.set_cookie(
        'refreshToken',
        refresh_token,
        max_age=max_age,
        httponly=True,
        # Cross-site (Vercel → Railway) cookies require SameSite=None + Secure.
        samesite='None' if settings.COOKIE_SECURE else 'Lax',
        secure=settings.COOKIE_SECURE,
        path='/',
    )


def set_admin_refresh_cookie(response, refresh_token, remember_me=False):
    """
    Store admin refresh token in a separate HttpOnly cookie.
    """
    max_age = 30 * 24 * 60 * 60 if remember_me else 7 * 24 * 60 * 60
    response.set_cookie(
        'adminRefreshToken',
        refresh_token,
        max_age=max_age,
        httponly=True,
        samesite='None' if settings.COOKIE_SECURE else 'Lax',
        secure=settings.COOKIE_SECURE,
        path='/',
    )


# ============================================================
# REGISTER
# ============================================================

class RegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():

                # Register the user and organization.
                user = serializer.save()

                # Send welcome notification (no action_url needed)
                send_user_notification(
                    user=user,
                    title='Welcome to MBE External Purchaser!',
                    message=(
                        'Your account has been created successfully. '
                        'Your organization registration is now pending admin verification. '
                        'Once approved, you will have full access to procurement baskets and direct purchases.'
                    ),
                    notification_type=Notification.NotificationType.ANNOUNCEMENT,
                    action_url='',
                )

                # Registration automatically logs the user in.
                # Registration always gets a 7-day session.
                session = UserSession.objects.create(
                    user=user,
                    session_expires_at=(
                        timezone.now() + timedelta(days=7)
                    ),
                    remember_me=False,
                    is_active=True,
                )

                # Generate tokens tied to this session.
                tokens = get_tokens_for_user(
                    user,
                    session
                )

                response_data = {
                    'success': True,
                    'message': (
                        'Account created successfully. '
                        'Welcome to the platform!'
                    ),
                    'data': {
                        'accessToken': tokens['accessToken'],
                        'refreshToken': tokens['refreshToken'],
                        'user': UserSerializer(user).data
                    }
                }

                response = Response(
                    response_data,
                    status=status.HTTP_201_CREATED
                )

                set_refresh_cookie(
                    response,
                    tokens['refreshToken'],
                    remember_me=False
                )

                return response

        except Exception:
            logger.exception(
                "Failed to create registration session for user: %s",
                request.data.get('email')
            )

            return Response({
                'success': False,
                'error': (
                    'Unable to complete registration. '
                    'Please try again.'
                )
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================
# LOGIN
# ============================================================

class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')
        password = request.data.get('password')
        remember_me = request.data.get('rememberMe', False)

        # Handle "true"/"false" strings safely.
        if isinstance(remember_me, str):
            remember_me = remember_me.lower() == 'true'

        # Authenticate user.
        user = authenticate(
            email=email,
            password=password
        )

        if not user or user.role == 'ADMIN' or user.is_superuser:
            return Response({
                'success': False,
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            with transaction.atomic():

                # Determine the fixed lifetime of THIS login session.
                session_lifetime = timedelta(
                    days=30 if remember_me else 7
                )

                # Create the database session.
                session = UserSession.objects.create(
                    user=user,
                    session_expires_at=(
                        timezone.now() + session_lifetime
                    ),
                    remember_me=remember_me,
                    is_active=True,
                )

                # Create JWTs tied to this session.
                tokens = get_tokens_for_user(
                    user,
                    session
                )

                response_data = {
                    'success': True,
                    'data': {
                        'accessToken': tokens['accessToken'],
                        'refreshToken': tokens['refreshToken'],
                        'user': UserSerializer(user).data
                    }
                }

                response = Response(
                    response_data,
                    status=status.HTTP_200_OK
                )

                set_refresh_cookie(
                    response,
                    tokens['refreshToken'],
                    remember_me=remember_me
                )

                return response

        except Exception:
            logger.exception(
                "Failed to create login session for user: %s",
                email
            )

            return Response({
                'success': False,
                'error': (
                    'Unable to create login session. '
                    'Please try again.'
                )
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================
# REFRESH TOKEN
# ============================================================

class RefreshView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = (
            request.COOKIES.get('refreshToken')
            or request.data.get('refreshToken')
        )

        if not refresh_token:
            return Response({
                'success': False,
                'error': 'Refresh token is required'
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # ---------------------------------------------
            # 1. Read the JWT payload without checking exp
            # ---------------------------------------------
            from rest_framework_simplejwt.backends import TokenBackend

            token_backend = TokenBackend(
                algorithm='HS256',
                signing_key=settings.SECRET_KEY,
            )

            payload = token_backend.decode(
                refresh_token,
                verify=False
            )

            # Make sure this is a refresh token
            if payload.get('token_type') != 'refresh':
                return Response({
                    'success': False,
                    'error': 'Invalid token type'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # ---------------------------------------------
            # 2. Get session ID from the token
            # ---------------------------------------------
            session_id = payload.get('session_id')

            if not session_id:
                return Response({
                    'success': False,
                    'error': 'Invalid refresh token: session not found'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # ---------------------------------------------
            # 3. Find the database session
            # ---------------------------------------------
            try:
                session = UserSession.objects.get(
                    id=session_id
                )
            except UserSession.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid refresh token: session not found'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # ---------------------------------------------
            # 4. Check if the user logged out
            # ---------------------------------------------
            if not session.is_active:
                return Response({
                    'success': False,
                    'error': (
                        'Session is no longer active. '
                        'Please log in again.'
                    )
                }, status=status.HTTP_401_UNAUTHORIZED)

            # ---------------------------------------------
            # 5. Check the fixed session expiration
            # ---------------------------------------------
            if timezone.now() >= session.session_expires_at:

                session.is_active = False
                session.save(
                    update_fields=['is_active']
                )

                return Response({
                    'success': False,
                    'error': (
                        'Session has expired. '
                        'Please log in again.'
                    )
                }, status=status.HTTP_401_UNAUTHORIZED)

            # ---------------------------------------------
            # 6. Now perform normal JWT validation
            # ---------------------------------------------
            refresh = RefreshToken(refresh_token)

            # ---------------------------------------------
            # 7. Get the user
            # ---------------------------------------------
            user_id = payload.get('user_id')

            ##
            ##User = get_user_model()

            user = User.objects.get(id=user_id)

            # ---------------------------------------------
            # 8. Generate new tokens
            #
            # get_tokens_for_user() only takes:
            #     user
            #     session
            #
            # It calculates the remaining session lifetime
            # itself.
            # ---------------------------------------------
            tokens = get_tokens_for_user(
                user,
                session
            )

            # ---------------------------------------------
            # 9. Return the new tokens
            # ---------------------------------------------
            response_data = {
                'success': True,
                'data': {
                    'accessToken': tokens['accessToken'],
                    'refreshToken': tokens['refreshToken'],
                    'user': UserSerializer(user).data
                }
            }

            response = Response(
                response_data,
                status=status.HTTP_200_OK
            )

            set_refresh_cookie(
                response,
                tokens['refreshToken'],
                remember_me=session.remember_me
            )

            return response

        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User associated with session was not found'
            }, status=status.HTTP_401_UNAUTHORIZED)

        except TokenError:
            return Response({
                'success': False,
                'error': 'Invalid or blacklisted refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)

        except Exception:
            logger.exception(
                'Unexpected error while refreshing token'
            )

            return Response({
                'success': False,
                'error': 'Refresh token is expired or invalid'
            }, status=status.HTTP_401_UNAUTHORIZED)
# ============================================================
# LOGOUT
# ============================================================

class LogoutView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        refresh_token = (
            request.COOKIES.get('refreshToken')
            or request.data.get('refreshToken')
        )

        # Even if there is no token, the UI can still log out.
        if not refresh_token:
            response = Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)

            response.delete_cookie('refreshToken')
            return response

        try:
            # ------------------------------------------------
            # 1. Decode the token WITHOUT checking expiration
            # ------------------------------------------------
            from rest_framework_simplejwt.backends import TokenBackend

            token_backend = TokenBackend(
                algorithm='HS256',
                signing_key=settings.SECRET_KEY,
            )

            payload = token_backend.decode(
                refresh_token,
                verify=False
            )

            # ------------------------------------------------
            # 2. Make sure this is a refresh token
            # ------------------------------------------------
            if payload.get('token_type') != 'refresh':
                response = Response({
                    'success': False,
                    'error': 'Invalid token type'
                }, status=status.HTTP_400_BAD_REQUEST)

                response.delete_cookie('refreshToken')
                return response

            # ------------------------------------------------
            # 3. Get the session ID
            # ------------------------------------------------
            session_id = payload.get('session_id')

            # ------------------------------------------------
            # 4. Deactivate the database session
            # ------------------------------------------------
            if session_id:

                try:
                    session = UserSession.objects.get(
                        id=session_id
                    )

                    if session.is_active:
                        session.is_active = False
                        session.save(
                            update_fields=['is_active']
                        )

                except UserSession.DoesNotExist:
                    logger.warning(
                        "Logout session not found: %s",
                        session_id
                    )

            # ------------------------------------------------
            # 5. Try to blacklist the token
            # ------------------------------------------------
            #
            # If the token is already expired, this may fail.
            # That's okay because the database session has
            # already been deactivated above.
            #
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except TokenError:
                pass

            # ------------------------------------------------
            # 6. Delete the refresh-token cookie
            # ------------------------------------------------
            response = Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)

            response.delete_cookie('refreshToken')

            return response

        except Exception:
            logger.exception(
                "Unexpected error during logout"
            )

            # Even if something unexpected happens, remove
            # the browser cookie.
            response = Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)

            response.delete_cookie('refreshToken')

            return response

# ============================================================
# CHANGE PASSWORD
# ============================================================

class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')

        if not current_password or not new_password:
            return Response({
                'success': False,
                'error': 'Current password and new password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        if not user.check_password(current_password):
            return Response({
                'success': False,
                'error': 'Your current password is incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as error:
            return Response({
                'success': False,
                'error': ' '.join(error.messages)
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return Response({
            'success': True,
            'message': 'Password updated successfully.'
        }, status=status.HTTP_200_OK)

# ============================================================
# USER PROFILE
# ============================================================

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return User.objects.get(pk=self.request.user.pk)

    def retrieve(self, request, *args, **kwargs):

        instance = self.get_object()

        serializer = self.get_serializer(instance)

        return Response({
            'success': True,
            'data': serializer.data
        })

    def partial_update(self, request, *args, **kwargs):
        """
        PATCH /api/auth/me
        Accepts camelCase fields from the frontend and updates the
        related Organization row. Returns the updated user object.
        """
        user = self.get_object()

        if not user.organization:
            return Response(
                {'success': False, 'error': 'No organization linked to this account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        org = user.organization
        data = request.data

        # ── Address nested object ─────────────────────────────
        address = data.get('address', {})

        # Map camelCase → snake_case Organization fields
        field_map = {
            'organizationName': ('name', str),
            'organizationType': ('organization_type', str),
            'phoneNumber': ('phone_number', str),
            'tinNumber': ('tin_number', str),
        }

        update_fields = []

        for frontend_key, (db_field, cast) in field_map.items():
            if frontend_key in data:
                setattr(org, db_field, cast(data[frontend_key]))
                update_fields.append(db_field)

        if address:
            addr_map = {
                'addressType': ('address_type', str),
                'addressFormatted': ('address_formatted', lambda v: v),
                'street': ('street', lambda v: v),
                'subCity': ('sub_city', lambda v: v),
                'area': ('area', lambda v: v),
                'city': ('city', str),
                'region': ('region', str),
            }
            for frontend_key, (db_field, cast) in addr_map.items():
                if frontend_key in address:
                    setattr(org, db_field, cast(address[frontend_key]) if address[frontend_key] is not None else None)
                    update_fields.append(db_field)

        if update_fields:
            org.save(update_fields=list(set(update_fields)))

        # Also update user email if provided (user table field)
        if 'email' in data and data['email'] != user.email:
            if User.objects.filter(email=data['email']).exclude(pk=user.pk).exists():
                return Response(
                    {'success': False, 'error': 'This email is already in use.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = data['email']
            user.save(update_fields=['email'])

        serializer = self.get_serializer(user)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def update(self, request, *args, **kwargs):
        # Route PUT to partial_update for convenience
        return self.partial_update(request, *args, **kwargs)


# ============================================================
# ADMIN AUTHENTICATION VIEWS
# ============================================================

class AdminLoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        remember_me = request.data.get('rememberMe', False)

        if isinstance(remember_me, str):
            remember_me = remember_me.lower() == 'true'

        user = authenticate(email=email, password=password)

        if not user or (user.role != 'ADMIN' and not user.is_superuser):
            return Response({
                'success': False,
                'error': 'Invalid admin email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            with transaction.atomic():
                session_lifetime = timedelta(days=30 if remember_me else 7)
                session = UserSession.objects.create(
                    user=user,
                    session_expires_at=timezone.now() + session_lifetime,
                    remember_me=remember_me,
                    is_active=True,
                )

                tokens = get_tokens_for_user(user, session)

                response_data = {
                    'success': True,
                    'data': {
                        'accessToken': tokens['accessToken'],
                        'refreshToken': tokens['refreshToken'],
                        'user': UserSerializer(user).data
                    }
                }

                response = Response(response_data, status=status.HTTP_200_OK)
                set_admin_refresh_cookie(response, tokens['refreshToken'], remember_me=remember_me)
                return response

        except Exception:
            logger.exception("Failed to create admin login session for user: %s", email)
            return Response({
                'success': False,
                'error': 'Unable to create admin session. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminRefreshView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = (
            request.COOKIES.get('adminRefreshToken')
            or request.data.get('refreshToken')
        )

        if not refresh_token:
            return Response({
                'success': False,
                'error': 'Admin refresh token is required'
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            from rest_framework_simplejwt.backends import TokenBackend

            token_backend = TokenBackend(
                algorithm='HS256',
                signing_key=settings.SECRET_KEY,
            )

            payload = token_backend.decode(refresh_token, verify=False)

            if payload.get('token_type') != 'refresh':
                return Response({
                    'success': False,
                    'error': 'Invalid token type'
                }, status=status.HTTP_401_UNAUTHORIZED)

            session_id = payload.get('session_id')
            if not session_id:
                return Response({
                    'success': False,
                    'error': 'Invalid refresh token: session not found'
                }, status=status.HTTP_401_UNAUTHORIZED)

            try:
                session = UserSession.objects.get(id=session_id)
            except UserSession.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Session not found'
                }, status=status.HTTP_401_UNAUTHORIZED)

            if not session.is_active or timezone.now() >= session.session_expires_at:
                session.is_active = False
                session.save(update_fields=['is_active'])
                return Response({
                    'success': False,
                    'error': 'Session has expired'
                }, status=status.HTTP_401_UNAUTHORIZED)

            user = User.objects.get(id=payload.get('user_id'))
            if user.role != 'ADMIN' and not user.is_superuser:
                return Response({
                    'success': False,
                    'error': 'Not authorized as admin'
                }, status=status.HTTP_403_FORBIDDEN)

            tokens = get_tokens_for_user(user, session)
            response_data = {
                'success': True,
                'data': {
                    'accessToken': tokens['accessToken'],
                    'refreshToken': tokens['refreshToken'],
                    'user': UserSerializer(user).data
                }
            }

            response = Response(response_data, status=status.HTTP_200_OK)
            set_admin_refresh_cookie(response, tokens['refreshToken'], remember_me=session.remember_me)
            return response

        except Exception:
            return Response({
                'success': False,
                'error': 'Refresh token is expired or invalid'
            }, status=status.HTTP_401_UNAUTHORIZED)


class AdminLogoutView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = (
            request.COOKIES.get('adminRefreshToken')
            or request.data.get('refreshToken')
        )

        response = Response({
            'success': True,
            'message': 'Admin logged out successfully'
        }, status=status.HTTP_200_OK)

        response.delete_cookie('adminRefreshToken')

        if refresh_token:
            try:
                from rest_framework_simplejwt.backends import TokenBackend

                token_backend = TokenBackend(
                    algorithm='HS256',
                    signing_key=settings.SECRET_KEY,
                )

                payload = token_backend.decode(refresh_token, verify=False)
                session_id = payload.get('session_id')
                if session_id:
                    UserSession.objects.filter(id=session_id).update(is_active=False)
            except Exception:
                pass

        return response

