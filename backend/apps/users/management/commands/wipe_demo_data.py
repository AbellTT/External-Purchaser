"""
Wipe all demo/seed data from the database, keeping only admin users.

Intended for resetting the stakeholder-demo environment. Deletes, in
reverse-dependency order (though Django CASCADE handles most relations):

  token blacklist -> sessions -> notifications -> deliveries -> orders
  -> baskets -> pricing -> products -> suppliers -> organizations -> non-admin users

Usage:
    python manage.py wipe_demo_data            # report only (dry run)
    python manage.py wipe_demo_data --delete   # actually delete
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

DELETE_ORDER = [
    # (app_label, model_name)
    ('token_blacklist', 'BlacklistedToken'),
    ('token_blacklist', 'OutstandingToken'),
    ('users', 'UserSession'),
    ('users', 'PasswordResetToken'),
    ('notifications', 'Notification'),
    ('notifications', 'Announcement'),
    ('notifications', 'EmailLog'),
    ('deliveries', 'DeliveryStatusHistory'),
    ('deliveries', 'DeliveryOrder'),
    ('deliveries', 'Delivery'),
    ('orders', 'OrderStatusHistory'),
    ('orders', 'OrderItem'),
    ('orders', 'Order'),
    ('baskets', 'BasketParticipant'),
    ('baskets', 'Basket'),
    ('pricing', 'WeeklySpotPrice'),
    ('pricing', 'BiMonthlyMarketData'),
    ('pricing', 'FinancialLossAnalysis'),
    ('pricing', 'ProcurementGuidance'),
    ('products', 'ProductAvailability'),
    ('products', 'ProductImage'),
    ('products', 'Brand'),
    ('products', 'Product'),
    ('products', 'Category'),
    ('suppliers', 'SupplierContact'),
    ('suppliers', 'SupplierProduct'),
    ('suppliers', 'Supplier'),
    ('organizations', 'ProcurementContact'),
    ('organizations', 'DeliveryAddress'),
    ('organizations', 'Organization'),
]


class Command(BaseCommand):
    help = 'Delete all demo data, keeping only admin (staff/superuser) users.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Actually delete rows (default is a dry-run report).',
        )

    def handle(self, *args, **options):
        from django.apps import apps

        User = get_user_model()
        total = 0

        self.stdout.write('Row counts before wipe:')
        for app_label, model_name in DELETE_ORDER:
            model = apps.get_model(app_label, model_name)
            count = model.objects.count()
            if count:
                self.stdout.write(f'  {app_label}.{model_name}: {count}')
            total += count

        non_admin_users = User.objects.filter(is_staff=False, is_superuser=False)
        user_count = non_admin_users.count()
        if user_count:
            self.stdout.write(f'  users (non-admin): {user_count}')
        total += user_count

        admins = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
        self.stdout.write(self.style.MIGRATE_HEADING(f'\nTotal rows to delete: {total}'))
        self.stdout.write('Admins kept:')
        for a in admins:
            self.stdout.write(f'  - {a.email}')

        if not options['delete']:
            self.stdout.write(self.style.WARNING('\nDRY RUN — re-run with --delete to wipe.'))
            return

        self.stdout.write(self.style.MIGRATE_HEADING('\nDeleting...'))
        for app_label, model_name in DELETE_ORDER:
            model = apps.get_model(app_label, model_name)
            deleted, _ = model.objects.all().delete()
            if deleted:
                self.stdout.write(f'  deleted {app_label}.{model_name}: {deleted} row(s)')
        for u in non_admin_users:
            self.stdout.write(f'  deleting user: {u.email}')
        deleted_users, _ = non_admin_users.delete()
        self.stdout.write(f'  deleted non-admin users: {deleted_users}')

        # Reset PK sequences so new records start from clean IDs.
        from django.core.management import call_command
        call_command('sqlsequencereset', chatty=False, stdout=self.stdout)

        self.stdout.write(self.style.SUCCESS('\nWipe complete. Only admin accounts remain.'))
