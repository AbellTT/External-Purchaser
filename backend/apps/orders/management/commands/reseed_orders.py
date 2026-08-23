import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from apps.users.models import User
from apps.organizations.models import Organization, DeliveryAddress
from apps.products.models import Brand
from apps.orders.models import Order, OrderItem


class Command(BaseCommand):
    help = 'Clears existing orders and creates 30 orders per existing user (IDs 4, 5, 6) with 20 delivered and 10 other statuses.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Clearing existing orders..."))

        with transaction.atomic():
            OrderItem.objects.all().delete()
            Order.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Cleared existing orders successfully."))

        # Fetch existing users with IDs 4, 5, 6
        target_users = list(User.objects.filter(id__in=[4, 5, 6]))
        if not target_users:
            self.stdout.write(self.style.ERROR("No users found with IDs 4, 5, 6!"))
            return

        self.stdout.write(self.style.SUCCESS(f"Found target users: {[u.email for u in target_users]}"))

        # Brands catalog pool
        brands = list(Brand.objects.select_related('product').filter(is_active=True))
        if not brands:
            self.stdout.write(self.style.ERROR("No active brands found in database!"))
            return

        # Split catalog into 75% shared/redundant pool and 25% unique pools per user
        shared_count = max(1, int(len(brands) * 0.75))
        shared_brands = brands[:shared_count]
        remaining_brands = brands[shared_count:] or brands

        user_brand_pools = {}
        for idx, u in enumerate(target_users):
            user_unique = remaining_brands[idx::len(target_users)] if remaining_brands else []
            user_brand_pools[u.id] = shared_brands + user_unique

        # Organization & Delivery Address fallback
        org = Organization.objects.first()
        delivery_addr = DeliveryAddress.objects.filter(organization=org).first() if org else None

        statuses_other = ['accepted', 'out-for-delivery', 'pending', 'cancelled']

        created_count = 0

        for u in target_users:
            pool = user_brand_pools[u.id]
            u_org = u.organization or org

            # 1. Generate 20 DELIVERED multi-item orders
            for i in range(1, 21):
                order_num = f"ORD-DELIV-U{u.id}-{i:03d}"
                order = Order.objects.create(
                    order_number=order_num,
                    order_type="DIRECT",
                    organization=u_org,
                    placed_by=u,
                    delivery_address=delivery_addr,
                    status="delivered",
                    subtotal=Decimal("0.00"),
                    delivery_fee=Decimal("150.00"),
                    total_amount=Decimal("150.00"),
                    delivered_at=timezone.now() - timezone.timedelta(days=random.randint(1, 15)),
                )

                item_count = random.choice([2, 3, 4])
                chosen_brands = random.sample(pool, min(item_count, len(pool)))

                order_subtotal = Decimal("0.00")
                for brand in chosen_brands:
                    qty = random.randint(5, 50)
                    unit_price = brand.direct_purchase_price or Decimal("100.00")
                    line_total = unit_price * qty

                    OrderItem.objects.create(
                        order=order,
                        product=brand.product,
                        brand=brand,
                        brand_name=brand.name,
                        quantity=qty,
                        unit_price=unit_price,
                        line_total=line_total,
                    )
                    order_subtotal += line_total

                order.subtotal = order_subtotal
                order.total_amount = order_subtotal + order.delivery_fee
                order.save()
                created_count += 1

            # 2. Generate 10 orders with other statuses
            for j in range(1, 11):
                status_choice = statuses_other[(j - 1) % len(statuses_other)]
                order_num = f"ORD-MISC-U{u.id}-{j:03d}"
                order = Order.objects.create(
                    order_number=order_num,
                    order_type="DIRECT",
                    organization=u_org,
                    placed_by=u,
                    delivery_address=delivery_addr,
                    status=status_choice,
                    subtotal=Decimal("0.00"),
                    delivery_fee=Decimal("150.00"),
                    total_amount=Decimal("150.00"),
                    confirmed_at=timezone.now() if status_choice in ['accepted', 'out-for-delivery', 'delivered'] else None,
                )

                item_count = random.choice([1, 2, 3])
                chosen_brands = random.sample(pool, min(item_count, len(pool)))

                order_subtotal = Decimal("0.00")
                for brand in chosen_brands:
                    qty = random.randint(3, 30)
                    unit_price = brand.direct_purchase_price or Decimal("100.00")
                    line_total = unit_price * qty

                    OrderItem.objects.create(
                        order=order,
                        product=brand.product,
                        brand=brand,
                        brand_name=brand.name,
                        quantity=qty,
                        unit_price=unit_price,
                        line_total=line_total,
                    )
                    order_subtotal += line_total

                order.subtotal = order_subtotal
                order.total_amount = order_subtotal + order.delivery_fee
                order.save()
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully re-seeded {created_count} orders across user IDs 4, 5, and 6!"))
