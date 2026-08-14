from django.db import models
from django.utils import timezone


class Organization(models.Model):
    """
    Represents an institutional buyer (school, university, NGO, government office, company).
    """
    
    class OrganizationType(models.TextChoices):
        SCHOOL = 'SCHOOL', 'School'
        UNIVERSITY = 'UNIVERSITY', 'University'
        GOVERNMENT = 'GOVERNMENT', 'Government Office'
        NGO = 'NGO', 'NGO'
        COMPANY = 'COMPANY', 'Private Company'
    
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Verification'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'
        SUSPENDED = 'SUSPENDED', 'Suspended'
    
    # Basic Information
    name = models.CharField(max_length=255, db_index=True)
    organization_type = models.CharField(
        max_length=20,
        choices=OrganizationType.choices
    )
    registration_number = models.CharField(max_length=100, unique=True, db_index=True)
    tax_id = models.CharField(max_length=100, blank=True)
    
    # Contact Information
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    
    # Verification
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    verification_notes = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_organizations'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'organizations'
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DeliveryAddress(models.Model):
    """
    Delivery addresses for organizations.
    An organization can have multiple delivery addresses.
    """
    
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='delivery_addresses'
    )
    
    # Address Details
    label = models.CharField(max_length=100)  # e.g., "Main Campus", "Branch Office"
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    sub_city = models.CharField(max_length=100, blank=True)
    woreda = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Contact Person at this address
    contact_person_name = models.CharField(max_length=200)
    contact_person_phone = models.CharField(max_length=20)
    contact_person_email = models.EmailField(blank=True)
    
    # Delivery Instructions
    delivery_instructions = models.TextField(blank=True)
    
    # Status
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'delivery_addresses'
        verbose_name = 'Delivery Address'
        verbose_name_plural = 'Delivery Addresses'
        ordering = ['-is_default', 'label']
    
    def __str__(self):
        return f"{self.organization.name} - {self.label}"
    
    def save(self, *args, **kwargs):
        """Ensure only one default address per organization."""
        if self.is_default:
            DeliveryAddress.objects.filter(
                organization=self.organization,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class ProcurementContact(models.Model):
    """
    Procurement officers/contacts for an organization.
    """
    
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='procurement_contacts'
    )
    
    # Contact Information
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=100)  # e.g., "Procurement Officer", "Finance Manager"
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    
    # Status
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'procurement_contacts'
        verbose_name = 'Procurement Contact'
        verbose_name_plural = 'Procurement Contacts'
        ordering = ['-is_primary', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.organization.name}"
    
    def save(self, *args, **kwargs):
        """Ensure only one primary contact per organization."""
        if self.is_primary:
            ProcurementContact.objects.filter(
                organization=self.organization,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
