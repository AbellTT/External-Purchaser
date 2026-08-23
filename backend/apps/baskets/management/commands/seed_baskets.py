import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.products.models import Product, Brand
from apps.baskets.models import Basket, BasketParticipant


class Command(BaseCommand):
    help = 'Seeds sample procurement baskets across WEEKLY, MONTHLY, and SIX_MONTH duration types.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding sample baskets..."))

        users = list(User.objects.filter(is_staff=False))
        if not users:
            self.stdout.write(self.style.ERROR("No users found to attach as participants."))
            return

        brands = list(Brand.objects.select_related('product', 'product__category').filter(is_in_stock=True))
        if not brands:
            self.stdout.write(self.style.ERROR("No brands found in database. Run seed_products first."))
            return

        sample_basket_configs = [
            # Open Baskets
            {"name": "Q3 Bulk Paper Ream Procurement", "duration": "MONTHLY", "target": 500, "status": "OPEN", "current": 340},
            {"name": "Weekly Ballpoint Pen Pool", "duration": "WEEKLY", "target": 200, "status": "OPEN", "current": 185},
            {"name": "Heavy Duty Staplers Consortium", "duration": "MONTHLY", "target": 150, "status": "OPEN", "current": 90},
            {"name": "6-Month Office Breakroom Supplies Pool", "duration": "SIX_MONTH", "target": 1000, "status": "OPEN", "current": 720},
            {"name": "High-Volume Printer Cartridge Basket", "duration": "WEEKLY", "target": 100, "status": "OPEN", "current": 45},

            # Completed Baskets
            {"name": "Q2 Standard A4 Paper Ream Pool", "duration": "MONTHLY", "target": 400, "status": "COMPLETED", "current": 400, "babi_price": Decimal("245.00"), "supplier_cost": Decimal("220.00")},
            {"name": "May Premium Gel Pen Bulk Procurement", "duration": "WEEKLY", "target": 250, "status": "COMPLETED", "current": 250, "babi_price": Decimal("18.50"), "supplier_cost": Decimal("15.00")},
            {"name": "6-Month Archival Box File Consortium", "duration": "SIX_MONTH", "target": 800, "status": "COMPLETED", "current": 800, "babi_price": Decimal("85.00"), "supplier_cost": Decimal("72.00")},
            {"name": "April Desktop Puncher Consolidated Basket", "duration": "MONTHLY", "target": 300, "status": "COMPLETED", "current": 300, "babi_price": Decimal("140.00"), "supplier_cost": Decimal("125.00")},
        ]

        created_count = 0
        for config in sample_basket_configs:
            brand = random.choice(brands)
            product = brand.product

            # Avoid duplicates if name already exists
            basket, created = Basket.objects.get_or_create(
                name=config["name"],
                defaults={
                    "duration_type": config["duration"],
                    "product": product,
                    "brand": brand,
                    "merkato_retailer_price": brand.merkato_retailer_price,
                    "regular_market_price": brand.regular_market_price,
                    "target_quantity": config["target"],
                    "current_quantity": config["current"],
                    "status": config["status"],
                    "babi_platform_price": config.get("babi_price"),
                    "supplier_cost": config.get("supplier_cost"),
                    "published_at": timezone.now(),
                    "closed_at": timezone.now() if config["status"] == "COMPLETED" else None,
                }
            )

            if created:
                created_count += 1
                # Add participants
                num_participants = min(len(users), random.randint(2, 4))
                participating_users = random.sample(users, num_participants)
                remaining_qty = config["current"]

                for i, u in enumerate(participating_users):
                    if i == len(participating_users) - 1:
                        qty = remaining_qty
                    else:
                        qty = max(10, remaining_qty // num_participants)
                        remaining_qty -= qty

                    if qty > 0:
                        BasketParticipant.objects.get_or_create(
                            basket=basket,
                            user=u,
                            defaults={
                                "organization": u.organization if hasattr(u, "organization") else None,
                                "committed_quantity": qty,
                            }
                        )

        total_baskets = Basket.objects.count()
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded baskets! Total baskets in database: {total_baskets} ({created_count} newly created)."))
