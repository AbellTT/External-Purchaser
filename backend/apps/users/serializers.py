from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction

User = get_user_model()

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'organization_type', 'tin_number', 'phone_number',
            'address_type', 'address_formatted', 'street', 'sub_city', 'area',
            'city', 'region', 'verification_status'
        ]

class UserSerializer(serializers.ModelSerializer):
    organizationName = serializers.SerializerMethodField()
    organizationType = serializers.SerializerMethodField()
    phoneNumber = serializers.SerializerMethodField()
    tinNumber = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    verificationStatus = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'organizationName', 'organizationType', 
            'phoneNumber', 'tinNumber', 'address', 'role', 'verificationStatus'
        ]
        
    def get_organizationName(self, obj):
        return obj.organization.name if obj.organization else ('Admin' if obj.is_superuser else '')
        
    def get_organizationType(self, obj):
        return obj.organization.organization_type if obj.organization else ''
        
    def get_phoneNumber(self, obj):
        return obj.organization.phone_number if obj.organization else ''
        
    def get_tinNumber(self, obj):
        return obj.organization.tin_number if obj.organization else ''
        
    def get_role(self, obj):
        return 'admin' if obj.role == 'ADMIN' or obj.is_superuser else 'user'
        
    def get_verificationStatus(self, obj):
        if not obj.organization:
            return 'approved'
        status = obj.organization.verification_status
        if status == Organization.VerificationStatus.VERIFIED:
            return 'approved'
        elif status == Organization.VerificationStatus.REJECTED:
            return 'suspended'
        return 'pending'
        
    def get_address(self, obj):
        if not obj.organization:
            return {
                'addressType': 'manual',
                'addressFormatted': None,
                'street': None,
                'subCity': None,
                'area': None,
                'city': 'Addis Ababa',
                'region': 'Addis Ababa City Administration'
            }
        org = obj.organization
        return {
            'addressType': org.address_type,
            'addressFormatted': org.address_formatted,
            'street': org.street,
            'subCity': org.sub_city,
            'area': org.area,
            'city': org.city,
            'region': org.region
        }

class RegisterSerializer(serializers.Serializer):
    organizationName = serializers.CharField(max_length=255)
    organizationType = serializers.ChoiceField(choices=Organization.OrganizationType.choices)
    phoneNumber = serializers.CharField(max_length=10)
    tinNumber = serializers.CharField(max_length=10)
    
    addressType = serializers.ChoiceField(choices=Organization.AddressType.choices)
    addressFormatted = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    street = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    subCity = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    area = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(default="Addis Ababa")
    region = serializers.CharField(default="Addis Ababa City Administration")
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    
    def validate(self, data):
        # Validate uniqueness
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
        if Organization.objects.filter(tin_number=data['tinNumber']).exists():
            raise serializers.ValidationError({"tinNumber": "This TIN number is already registered."})
            
        # Address validation based on address type
        if data['addressType'] == Organization.AddressType.AUTOCOMPLETE:
            if not data.get('addressFormatted'):
                raise serializers.ValidationError({"addressFormatted": "Required for autocomplete address type."})
        else:
            if not data.get('street') or not data.get('subCity'):
                raise serializers.ValidationError({"address": "Street and sub-city are required for manual address type."})
                
        return data
        
    def create(self, validated_data):
        with transaction.atomic():
            # Create organization
            org = Organization.objects.create(
                name=validated_data['organizationName'],
                organization_type=validated_data['organizationType'],
                phone_number=validated_data['phoneNumber'],
                tin_number=validated_data['tinNumber'],
                address_type=validated_data['addressType'],
                address_formatted=validated_data.get('addressFormatted', ''),
                street=validated_data.get('street', ''),
                sub_city=validated_data.get('subCity', ''),
                area=validated_data.get('area', ''),
                city=validated_data.get('city', 'Addis Ababa'),
                region=validated_data.get('region', 'Addis Ababa City Administration'),
                verification_status=Organization.VerificationStatus.PENDING
            )
            
            # Create user
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                organization=org
            )
            
            return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return data
