from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.organizations.models import Organization, DeliveryAddress


class Command(BaseCommand):
    help = 'Seeds initial admin and buyer user accounts.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding default user accounts..."))

        # Create organization
        org = Organization.objects.first()
        if not org:
            org = Organization.objects.create(
                name='St. Mary University',
                tin_number='1234567890',
                phone_number='0911234567',
                organization_type='Higher Education',
                city='Addis Ababa',
                region='Addis Ababa City Administration',
            )

        DeliveryAddress.objects.get_or_create(
            organization=org,
            defaults={
                'label': 'Main Campus HQ',
                'street_address': 'Mexico Campus Road',
                'city': 'Addis Ababa',
                'contact_person_name': 'Abebe Bikila',
                'contact_person_phone': '0911234567',
                'is_default': True,
            }
        )

        # 1. Admin User: admin@babi.et / password123
        admin_user, admin_created = User.objects.get_or_create(
            email='admin@babi.et',
            defaults={
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'is_verified': True,
            }
        )
        if admin_created:
            admin_user.set_password('password123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created Admin: admin@babi.et / password123"))
        else:
            admin_user.set_password('password123')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.role = 'ADMIN'
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Updated Admin password: admin@babi.et / password123"))

        # 2. Buyer User 1: buyer@babi.et / password123
        buyer_user, buyer_created = User.objects.get_or_create(
            email='buyer@babi.et',
            defaults={
                'role': 'PROCUREMENT_OFFICER',
                'organization': org,
                'is_active': True,
                'is_verified': True,
            }
        )
        buyer_user.set_password('password123')
        buyer_user.organization = org
        buyer_user.save()
        self.stdout.write(self.style.SUCCESS("Created/Updated Buyer: buyer@babi.et / password123"))

        # 3. Buyer User 2: procurement@stmary.edu.et / password123
        stmary_user, stmary_created = User.objects.get_or_create(
            email='procurement@stmary.edu.et',
            defaults={
                'role': 'PROCUREMENT_OFFICER',
                'organization': org,
                'is_active': True,
                'is_verified': True,
            }
        )
        stmary_user.set_password('password123')
        stmary_user.organization = org
        stmary_user.save()
        self.stdout.write(self.style.SUCCESS("Created/Updated Buyer: procurement@stmary.edu.et / password123"))

        self.stdout.write(self.style.SUCCESS("User seeding complete!"))
