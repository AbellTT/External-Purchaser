from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.organizations.models import Organization
from apps.orders.models import Order


class Command(BaseCommand):
    help = 'Assigns all existing orders in the database to all buyer organizations so user and admin see all 147 orders.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Re-assigning sample orders..."))

        users = list(User.objects.filter(is_staff=False))
        if not users:
            u, _ = User.objects.get_or_create(
                email='buyer@babi.et',
                defaults={'role': 'PROCUREMENT_OFFICER'}
            )
            u.set_password('password123')
            u.save()
            users = [u]

        primary_user = users[0]
        org = primary_user.organization
        if not org:
            org, _ = Organization.objects.get_or_create(
                name='Babi Procurement Ltd',
                defaults={
                    'tin_number': '1234567890',
                    'phone_number': '0911234567',
                    'organization_type': 'Private Company',
                    'city': 'Addis Ababa',
                    'region': 'Addis Ababa City Administration',
                }
            )
            primary_user.organization = org
            primary_user.save()

        # Update all existing orders to be attached to primary_user and org
        updated = Order.objects.all().update(placed_by=primary_user, organization=org)

        # Also assign org to all other non-staff users
        for u in users:
            u.organization = org
            u.save()

        total = Order.objects.count()
        self.stdout.write(self.style.SUCCESS(f"Successfully assigned all {total} orders to {primary_user.email} & organization {org.name}!"))
