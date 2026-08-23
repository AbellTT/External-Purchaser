import json
import os
import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from apps.products.models import Product, Brand, Category
from apps.pricing.models import (
    BiMonthlyMarketData,
    WeeklySpotPrice,
    FinancialLossAnalysis,
    ProcurementGuidance
)


class Command(BaseCommand):
    help = "Seeds database with real market data, bi-monthly metrics, and financial loss analysis."

    def handle(self, *args, **options):
        self.stdout.write("Seeding Market Data into database...")

        project_root = settings.BASE_DIR.parent
        mi_dir = os.path.join(project_root, "frontend", "src", "data", "MI")

        file_mi = os.path.join(mi_dir, "marketIntelligence.json")
        file_bi = os.path.join(mi_dir, "bi-monthly_data.json")
        file_loss = os.path.join(mi_dir, "500_companies_badSalesAndLoss.json")

        with open(file_mi, "r", encoding="utf-8") as f:
            mi_raw = json.load(f)

        with open(file_bi, "r", encoding="utf-8") as f:
            bi_raw = json.load(f)

        with open(file_loss, "r", encoding="utf-8") as f:
            loss_raw = json.load(f)

        now = timezone.now()
        current_year = now.year

        # Default Category
        category, _ = Category.objects.get_or_create(
            name="Office Supplies & Equipment",
            defaults={"slug": "office-supplies", "description": "Standard office supplies"}
        )

        # Helper function to get or create product safely
        def get_or_create_product(name, unit="piece"):
            prod = Product.objects.filter(name=name).first()
            if not prod:
                p_slug = slugify(name)
                p_sku = f"SKU-{p_slug.upper()[:15]}-{uuid.uuid4().hex[:4].upper()}"
                prod = Product.objects.create(
                    name=name,
                    slug=p_slug,
                    sku=p_sku,
                    category=category,
                    unit_of_measure=unit,
                    description=f"{name} procurement product"
                )
            return prod

        # 1. Process marketIntelligence.json
        mi_products = mi_raw.get("data", {}).get("products", [])
        for item in mi_products:
            prod_name = item.get("name", "Unknown Product")
            unit = item.get("unit", "ream")
            pricing = item.get("current_pricing", {})

            product = get_or_create_product(prod_name, unit)

            # Find or Create Brand
            brand_name = prod_name.split()[0] if len(prod_name.split()) > 0 else "Standard"
            brand, _ = Brand.objects.get_or_create(
                product=product,
                name=brand_name,
                defaults={
                    "regular_market_price": Decimal(str(pricing.get("regularMarketPrice", 700))),
                    "merkato_retailer_price": Decimal(str(pricing.get("merkatoRetailerPrice", 675))),
                    "direct_purchase_price": Decimal(str(pricing.get("platformDirectPrice", 650))),
                    "babi_platform_price": Decimal(str(pricing.get("platformDirectPrice", 650))),
                    "is_in_stock": True,
                    "is_active": True,
                }
            )

            # Seed Weekly Spot Prices
            weekly_hist = item.get("weeklyHistory", [])
            for idx, w in enumerate(weekly_hist, start=1):
                w_price = w.get("price")
                WeeklySpotPrice.objects.update_or_create(
                    product=product,
                    brand=brand,
                    year=current_year,
                    month=now.month,
                    week_number=idx,
                    defaults={
                        "week_label": w.get("week", f"W{idx}"),
                        "direct_purchase_price": Decimal(str(w_price)) if w_price is not None else None,
                    }
                )

            # Seed Bi-monthly metrics from marketIntelligence for current_year
            bi_metrics = item.get("bi_monthly_metrics", [])
            for bm in bi_metrics:
                period = bm.get("period")
                avg_p = bm.get("average_price_etb", {})
                inc_p = bm.get("weekly_increase_etb", {})
                disc_p = bm.get("weekly_discount_etb", {})

                BiMonthlyMarketData.objects.update_or_create(
                    product=product,
                    brand=brand,
                    year=current_year,
                    period=period,
                    defaults={
                        "min_average_price": Decimal(str(avg_p.get("min", 0))),
                        "max_average_price": Decimal(str(avg_p.get("max", 0))),
                        "min_weekly_increase": Decimal(str(inc_p.get("min", 0))),
                        "max_weekly_increase": Decimal(str(inc_p.get("max", 0))),
                        "min_weekly_discount": Decimal(str(disc_p.get("min", 0))),
                        "max_weekly_discount": Decimal(str(disc_p.get("max", 0))),
                    }
                )

            # Seed Procurement Guidance
            ProcurementGuidance.objects.update_or_create(
                product=product,
                defaults={
                    "brand": brand,
                    "first_best_season": "Sept - Oct",
                    "second_best_season": "May - Jun",
                    "third_best_season": "Jan - Feb",
                    "seasonal_buying_guide_notes": f"Optimal procurement period for {product.name} is during low demand cycles.",
                    "recommendation_summary": f"Procure {product.name} in bulk during Sept - Oct to save up to 25% versus market peaks.",
                }
            )

        # 2. Process bi-monthly_data.json for Previous Year (e.g. 2025)
        bi_products = bi_raw.get("market_data", [])
        prev_year = current_year - 1
        for item in bi_products:
            prod_name = item.get("product")
            product = get_or_create_product(prod_name, "piece")
            brand = product.brands.first()

            bi_metrics = item.get("bi_monthly_metrics", [])
            for bm in bi_metrics:
                period = bm.get("period")
                avg_p = bm.get("average_price_etb", {})
                inc_p = bm.get("weekly_increase_etb", {})
                disc_p = bm.get("weekly_discount_etb", {})

                BiMonthlyMarketData.objects.update_or_create(
                    product=product,
                    brand=brand,
                    year=prev_year,
                    period=period,
                    defaults={
                        "min_average_price": Decimal(str(avg_p.get("min", 0))),
                        "max_average_price": Decimal(str(avg_p.get("max", 0))),
                        "min_weekly_increase": Decimal(str(inc_p.get("min", 0))),
                        "max_weekly_increase": Decimal(str(inc_p.get("max", 0))),
                        "min_weekly_discount": Decimal(str(disc_p.get("min", 0))),
                        "max_weekly_discount": Decimal(str(disc_p.get("max", 0))),
                    }
                )

        # 3. Process 500_companies_badSalesAndLoss.json
        loss_items = loss_raw.get("financial_loss_analysis", [])
        for item in loss_items:
            prod_name = item.get("product")
            product = get_or_create_product(prod_name, "piece")
            brand = product.brands.first()

            ex_price = item.get("price_fluctuation_example_etb", {})
            ex_loss = item.get("estimated_annual_loss_etb", {})

            FinancialLossAnalysis.objects.update_or_create(
                product=product,
                defaults={
                    "brand": brand,
                    "base_price": Decimal(str(ex_price.get("base_price", 650))),
                    "peak_surge_price": Decimal(str(ex_price.get("peak_surge_price", 720))),
                    "discounted_optimal_price": Decimal(str(ex_price.get("discounted_optimal_price", 690))),
                    "single_company_loss": Decimal(str(ex_loss.get("single_company_loss", 20000))),
                    "aggregate_500_companies_loss": Decimal(str(ex_loss.get("aggregate_500_companies_loss", 10000000))),
                }
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded real Market Data, Bi-Monthly Metrics & Financial Loss Analysis into database!"))
