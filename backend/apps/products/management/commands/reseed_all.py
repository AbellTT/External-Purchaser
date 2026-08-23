import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.utils import timezone
from apps.users.models import User
from apps.organizations.models import Organization, DeliveryAddress
from apps.products.models import Category, Product, Brand
from apps.orders.models import Order, OrderItem
from apps.baskets.models import Basket, BasketParticipant


class Command(BaseCommand):
    help = 'Wipes existing orders, baskets, products/brands, and seeds 20 products, 20 open baskets, and 20 multi-item orders across 3 buyers.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Clearing existing orders, baskets, and products..."))

        with transaction.atomic():
            OrderItem.objects.all().delete()
            Order.objects.all().delete()
            BasketParticipant.objects.all().delete()
            Basket.objects.all().delete()
            Brand.objects.all().delete()
            Product.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Cleared existing data successfully."))

        # Create/Ensure Organization
        org = Organization.objects.first()
        if not org:
            org = Organization.objects.create(
                name='St. Mary University',
                tin_number='1000200030',
                phone_number='0911223344',
                organization_type='Higher Education',
                city='Addis Ababa',
                region='Addis Ababa City Administration',
            )

        delivery_addr, _ = DeliveryAddress.objects.get_or_create(
            organization=org,
            defaults={
                'label': 'Main Campus HQ',
                'street_address': 'Mexico Campus Road',
                'city': 'Addis Ababa',
                'contact_person_name': 'Abebe Bikila',
                'contact_person_phone': '0911223344',
                'is_default': True,
            }
        )

        # Ensure Admin User
        admin_user, _ = User.objects.get_or_create(
            email='admin@babi.et',
            defaults={
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'is_verified': True,
            }
        )
        admin_user.set_password('password123')
        admin_user.save()

        # Ensure 3 Buyer Users
        buyer_emails = ['buyer4@babi.et', 'buyer5@babi.et', 'buyer6@babi.et']
        buyers = []
        for email in buyer_emails:
            u, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'role': 'PROCUREMENT_OFFICER',
                    'organization': org,
                    'is_active': True,
                    'is_verified': True,
                }
            )
            u.set_password('password123')
            u.organization = org
            u.save()
            buyers.append(u)

        # Default fallback buyer
        buyer_babi, _ = User.objects.get_or_create(
            email='buyer@babi.et',
            defaults={'role': 'PROCUREMENT_OFFICER', 'organization': org, 'is_active': True, 'is_verified': True}
        )
        buyer_babi.set_password('password123')
        buyer_babi.save()

        # 20 Realistic Stationery Products with Categories & Brands
        products_data = [
            {"name": "A4 Multipurpose Copy Paper 80gsm", "category": "Paper Products", "unit": "ream", "specs": {"pages": 500},
             "brands": [
                 {"name": "Double A 80gsm", "market": Decimal("480.00"), "merkato": Decimal("450.00"), "direct": Decimal("420.00")},
                 {"name": "Chamex Premium", "market": Decimal("450.00"), "merkato": Decimal("420.00"), "direct": Decimal("395.00")},
                 {"name": "PaperOne All-Purpose", "market": Decimal("460.00"), "merkato": Decimal("430.00"), "direct": Decimal("405.00")},
             ]},
            {"name": "Executive A5 Hardcover Spiral Notebook", "category": "Paper Products", "unit": "piece", "specs": {"sheets": 200},
             "brands": [
                 {"name": "Deli Executive Grid", "market": Decimal("180.00"), "merkato": Decimal("165.00"), "direct": Decimal("150.00")},
                 {"name": "M&G Classic Linen", "market": Decimal("165.00"), "merkato": Decimal("150.00"), "direct": Decimal("135.00")},
             ]},
            {"name": "Blue Ballpoint Pens 0.7mm (Box of 50)", "category": "Writing & Markers", "unit": "box", "specs": {"count": 50},
             "brands": [
                 {"name": "BIC Cristal Medium", "market": Decimal("420.00"), "merkato": Decimal("390.00"), "direct": Decimal("360.00")},
                 {"name": "Schneider Slider 755", "market": Decimal("480.00"), "merkato": Decimal("440.00"), "direct": Decimal("400.00")},
             ]},
            {"name": "Black Gel Ink Pens 0.5mm (Box of 12)", "category": "Writing & Markers", "unit": "box", "specs": {"count": 12},
             "brands": [
                 {"name": "Pilot G2 Gel 0.5mm", "market": Decimal("350.00"), "merkato": Decimal("320.00"), "direct": Decimal("290.00")},
                 {"name": "Pentel EnerGel 0.5", "market": Decimal("380.00"), "merkato": Decimal("350.00"), "direct": Decimal("315.00")},
             ]},
            {"name": "Dry Erase Whiteboard Markers Set (Pack of 4)", "category": "Writing & Markers", "unit": "pack", "specs": {"colors": 4},
             "brands": [
                 {"name": "Expo Low Odor Chisel", "market": Decimal("220.00"), "merkato": Decimal("200.00"), "direct": Decimal("180.00")},
                 {"name": "Edding 360 Bullet", "market": Decimal("240.00"), "merkato": Decimal("215.00"), "direct": Decimal("195.00")},
             ]},
            {"name": "Fluorescent Highlighters Assorted (Pack of 6)", "category": "Writing & Markers", "unit": "pack", "specs": {"count": 6},
             "brands": [
                 {"name": "Stabilo Boss Original", "market": Decimal("320.00"), "merkato": Decimal("290.00"), "direct": Decimal("260.00")},
                 {"name": "Faber-Castell Textliner", "market": Decimal("290.00"), "merkato": Decimal("260.00"), "direct": Decimal("235.00")},
             ]},
            {"name": "Heavy Duty Arch Lever Box File 75mm", "category": "Filing & Storage", "unit": "piece", "specs": {"capacity": "500 sheets"},
             "brands": [
                 {"name": "Bantu Lever Arch Heavy", "market": Decimal("195.00"), "merkato": Decimal("175.00"), "direct": Decimal("155.00")},
                 {"name": "Leitz 180 Durable", "market": Decimal("240.00"), "merkato": Decimal("210.00"), "direct": Decimal("185.00")},
             ]},
            {"name": "Plastic Suspension File Folders (Box of 25)", "category": "Filing & Storage", "unit": "box", "specs": {"count": 25},
             "brands": [
                 {"name": "Rexel Foolscap Hanging", "market": Decimal("850.00"), "merkato": Decimal("780.00"), "direct": Decimal("710.00")},
                 {"name": "Deli Color Filing", "market": Decimal("760.00"), "merkato": Decimal("700.00"), "direct": Decimal("630.00")},
             ]},
            {"name": "Desktop Full Strip Metal Stapler 24/6", "category": "Staplers & Organization", "unit": "piece", "specs": {"sheet_capacity": 30},
             "brands": [
                 {"name": "Kangaroo HD-45 Steel", "market": Decimal("280.00"), "merkato": Decimal("250.00"), "direct": Decimal("220.00")},
                 {"name": "Max HD-10D Heavy", "market": Decimal("340.00"), "merkato": Decimal("310.00"), "direct": Decimal("275.00")},
             ]},
            {"name": "Staple Pins 24/6 (Box of 20 Packs)", "category": "Staplers & Organization", "unit": "box", "specs": {"packs": 20},
             "brands": [
                 {"name": "Kangaroo No. 10 Pins", "market": Decimal("320.00"), "merkato": Decimal("290.00"), "direct": Decimal("260.00")},
                 {"name": "Deli High Tensile Pins", "market": Decimal("290.00"), "merkato": Decimal("260.00"), "direct": Decimal("230.00")},
             ]},
            {"name": "Sticky Notes 3x3 Inch Yellow (Pack of 12 Pads)", "category": "Desk Accessories", "unit": "pack", "specs": {"pads": 12},
             "brands": [
                 {"name": "3M Post-it Yellow", "market": Decimal("360.00"), "merkato": Decimal("330.00"), "direct": Decimal("295.00")},
                 {"name": "Deli Neon Sticky Pads", "market": Decimal("280.00"), "merkato": Decimal("250.00"), "direct": Decimal("220.00")},
             ]},
            {"name": "Heavy Duty Office Scissors 8-Inch", "category": "Desk Accessories", "unit": "piece", "specs": {"length": "8 inch"},
             "brands": [
                 {"name": "Fiskars Stainless Ergonomic", "market": Decimal("210.00"), "merkato": Decimal("190.00"), "direct": Decimal("165.00")},
                 {"name": "Maped Essential 21cm", "market": Decimal("180.00"), "merkato": Decimal("160.00"), "direct": Decimal("140.00")},
             ]},
            {"name": "Clear Packaging Tape 48mm x 100m (Pack of 6)", "category": "Packaging & Shipping", "unit": "pack", "specs": {"rolls": 6},
             "brands": [
                 {"name": "Sellotape Strong Heavy", "market": Decimal("440.00"), "merkato": Decimal("400.00"), "direct": Decimal("360.00")},
                 {"name": "3M Scotch Heavy Duty", "market": Decimal("490.00"), "merkato": Decimal("445.00"), "direct": Decimal("400.00")},
             ]},
            {"name": "Correction Tape 5mm x 12m (Pack of 10)", "category": "Desk Accessories", "unit": "pack", "specs": {"count": 10},
             "brands": [
                 {"name": "Tipp-Ex Micro Tape", "market": Decimal("390.00"), "merkato": Decimal("350.00"), "direct": Decimal("310.00")},
                 {"name": "Tombow MONO Correction", "market": Decimal("430.00"), "merkato": Decimal("390.00"), "direct": Decimal("345.00")},
             ]},
            {"name": "Steel Paper Clips 33mm (Box of 10 Packs)", "category": "Staplers & Organization", "unit": "box", "specs": {"packs": 10},
             "brands": [
                 {"name": "Deli Smooth Nickel Clips", "market": Decimal("150.00"), "merkato": Decimal("130.00"), "direct": Decimal("110.00")},
             ]},
            {"name": "Clear Pocket Sleeves A4 50 Micron (Pack of 100)", "category": "Filing & Storage", "unit": "pack", "specs": {"sheets": 100},
             "brands": [
                 {"name": "Esselte Sheet Protectors", "market": Decimal("340.00"), "merkato": Decimal("300.00"), "direct": Decimal("265.00")},
                 {"name": "Deli Clear Plastic Sleeves", "market": Decimal("290.00"), "merkato": Decimal("260.00"), "direct": Decimal("230.00")},
             ]},
            {"name": "LaserJet Black Toner Cartridge 85A", "category": "Office Electronics", "unit": "piece", "specs": {"yield": "1600 pages"},
             "brands": [
                 {"name": "HP Original CE285A", "market": Decimal("3800.00"), "merkato": Decimal("3500.00"), "direct": Decimal("3200.00")},
                 {"name": "PrintRite Compatible 85A", "market": Decimal("1400.00"), "merkato": Decimal("1250.00"), "direct": Decimal("1100.00")},
             ]},
            {"name": "Aluminum Ruler 30cm Metric", "category": "Desk Accessories", "unit": "piece", "specs": {"length": "30cm"},
             "brands": [
                 {"name": "Deli Aluminum Metal Scale", "market": Decimal("95.00"), "merkato": Decimal("85.00"), "direct": Decimal("75.00")},
             ]},
            {"name": "Desk Mesh File & Document Tray 3-Tier", "category": "Desk Accessories", "unit": "piece", "specs": {"tiers": 3},
             "brands": [
                 {"name": "Deli Wire Mesh 3-Tier", "market": Decimal("520.00"), "merkato": Decimal("470.00"), "direct": Decimal("420.00")},
                 {"name": "M&G Steel Desk Organizer", "market": Decimal("480.00"), "merkato": Decimal("430.00"), "direct": Decimal("385.00")},
             ]},
            {"name": "Self-Adhesive Address Labels A4 (Pack of 100 Sheets)", "category": "Paper Products", "unit": "pack", "specs": {"sheets": 100},
             "brands": [
                 {"name": "Avery Zweckform Labels", "market": Decimal("680.00"), "merkato": Decimal("620.00"), "direct": Decimal("560.00")},
                 {"name": "Deli Sticker Printable", "market": Decimal("540.00"), "merkato": Decimal("490.00"), "direct": Decimal("430.00")},
             ]},
        ]

        created_products = []
        created_brands = []

        for idx, pdata in enumerate(products_data, 1):
            cat_obj, _ = Category.objects.get_or_create(
                name=pdata["category"],
                defaults={"slug": pdata["category"].lower().replace(' ', '-').replace('&', 'and')}
            )

            product = Product.objects.create(
                name=pdata["name"],
                slug=pdata["name"].lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', ''),
                sku=f"STAT-2026-{idx:03d}",
                description=f"High quality {pdata['name']} for commercial and educational institutional procurement.",
                category=cat_obj,
                unit_of_measure=pdata["unit"],
                specifications=pdata["specs"],
                minimum_order_quantity=1,
                is_available=True,
            )
            created_products.append(product)

            for bdata in pdata["brands"]:
                brand = Brand.objects.create(
                    product=product,
                    name=bdata["name"],
                    stock_quantity=random.randint(100, 5000),
                    is_in_stock=True,
                    regular_market_price=bdata["market"],
                    merkato_retailer_price=bdata["merkato"],
                    direct_purchase_price=bdata["direct"],
                    is_active=True,
                )
                created_brands.append(brand)

        self.stdout.write(self.style.SUCCESS(f"Created {len(created_products)} products and {len(created_brands)} brands."))

        # Create 20 OPEN Baskets (No participants joined yet)
        duration_types = ['WEEKLY', 'MONTHLY', 'SIX_MONTH']
        created_baskets = []

        basket_titles = [
            "Q3 High-Volume Paper Ream Pool",
            "Monthly Gel & Ballpoint Pen Consortium",
            "Institutional Archival Box File Basket",
            "University Semester Exam Paper Procurement",
            "Desktop Stapler & Pins Bulk Basket",
            "6-Month Breakroom & Desk Supplies Pool",
            "Dry Erase Whiteboard Marker Bulk Order",
            "Printer LaserJet Cartridge Consolidated Basket",
            "Sticky Notes & Desk Organizer Consortium",
            "Clear Packaging Tape Wholesale Pool",
            "Office Scissors & Cutting Tools Basket",
            "Suspension File Folders Quarterly Procurement",
            "Self-Adhesive Printable Label Roll Pool",
            "Fluorescent Highlighter Pack Bulk Basket",
            "Correction Tape & Eraser Pool",
            "Clear Pocket Sleeves A4 Bulk Consortium",
            "Steel Paper Clip & Fastener Basket",
            "Metric Aluminum Ruler Consolidated Order",
            "Executive Notebook & Planner Pool",
            "Annual Desk Mesh Tray Procurement"
        ]

        for i, title in enumerate(basket_titles):
            brand = created_brands[i % len(created_brands)]
            dur = duration_types[i % len(duration_types)]
            target = random.choice([150, 300, 500, 1000, 2000])

            basket = Basket.objects.create(
                name=title,
                duration_type=dur,
                product=brand.product,
                brand=brand,
                merkato_retailer_price=brand.merkato_retailer_price,
                regular_market_price=brand.regular_market_price,
                target_quantity=target,
                current_quantity=0,
                status='OPEN',
                published_at=timezone.now(),
                created_by=admin_user,
            )
            created_baskets.append(basket)

        self.stdout.write(self.style.SUCCESS(f"Created {len(created_baskets)} OPEN procurement baskets."))

        # Create 20 Orders across buyers (IDs 4, 5, 6 / 3 buyers), some with multiple items
        statuses = ['pending', 'accepted', 'processing', 'delivered']
        created_orders = 0

        for i in range(1, 21):
            buyer = buyers[(i - 1) % len(buyers)]
            status = statuses[i % len(statuses)]
            item_count = random.choice([1, 2, 3])

            order = Order.objects.create(
                order_number=f"ORD-2026-{i:04d}",
                order_type="DIRECT",
                organization=org,
                placed_by=buyer,
                delivery_address=delivery_addr,
                status=status,
                subtotal=Decimal("0.00"),
                delivery_fee=Decimal("150.00"),
                total_amount=Decimal("150.00"),
            )

            order_subtotal = Decimal("0.00")
            chosen_brands = random.sample(created_brands, item_count)

            for brand in chosen_brands:
                qty = random.randint(5, 50)
                unit_price = brand.direct_purchase_price
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
            created_orders += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created_orders} multi-item orders assigned across 3 buyers!"))
        self.stdout.write(self.style.SUCCESS("All data re-seeding completed cleanly!"))
