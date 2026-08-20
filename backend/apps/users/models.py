from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for the procurement platform.
    Supports multiple user roles: Admin, Procurement Officer, Delivery Staff.
    """
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        PROCUREMENT_OFFICER = 'PROCUREMENT_OFFICER', 'Procurement Officer'
        DELIVERY_STAFF = 'DELIVERY_STAFF', 'Delivery Staff'
    
    # Basic Information
    email = models.EmailField(unique=True, db_index=True)
    
    # Role and Organization
    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.PROCUREMENT_OFFICER
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        if self.organization:
            return f"{self.organization.name} ({self.email})"
        return self.email
    
    def get_full_name(self):
        """Return the user's full name."""
        if self.organization:
            return self.organization.name
        return self.email
    
    def get_short_name(self):
        """Return the user's short name."""
        return self.email


class PasswordResetToken(models.Model):
    """Store password reset tokens."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset token for {self.user.email}"
    
    def is_valid(self):
        """Check if the token is still valid."""
        return not self.used and timezone.now() < self.expires_at

class UserSession(models.Model):
    """
    Represents one login session for a user.
    The session has a fixed expiration time. Refreshing the access token
    does NOT extend this expiration time.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    session_expires_at = models.DateTimeField()
    remember_me = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.created_at}"
