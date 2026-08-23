from rest_framework import serializers
from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    verificationStatus = serializers.CharField(source='verification_status')
    verificationNotes = serializers.CharField(source='verification_notes', required=False, allow_blank=True)
    verifiedAt = serializers.DateTimeField(source='verified_at', read_only=True)
    organizationType = serializers.CharField(source='organization_type')
    tinNumber = serializers.CharField(source='tin_number')
    phoneNumber = serializers.CharField(source='phone_number')
    addressType = serializers.CharField(source='address_type')
    addressFormatted = serializers.CharField(source='address_formatted', required=False, allow_blank=True)
    subCity = serializers.CharField(source='sub_city', required=False, allow_blank=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'organizationType', 'tinNumber',
            'phoneNumber', 'addressType', 'addressFormatted',
            'street', 'subCity', 'area', 'city', 'region',
            'verificationStatus', 'verificationNotes', 'verifiedAt',
            'createdAt',
        ]
