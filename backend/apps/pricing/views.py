import json
import urllib.request
import threading
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from decimal import Decimal

from apps.products.models import Product, Brand
from .models import BiMonthlyMarketData, WeeklySpotPrice, FinancialLossAnalysis, ProcurementGuidance
from .serializers import (
    BiMonthlyMarketDataSerializer,
    WeeklySpotPriceSerializer,
    FinancialLossAnalysisSerializer,
    ProcurementGuidanceSerializer,
)
from apps.notifications.models import Notification
from apps.notifications.utils import send_user_notification


def _send_notification(event_data):
    try:
        req = urllib.request.Request(
            'http://127.0.0.1:8003/',
            data=json.dumps(event_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=1)
    except Exception:
        pass


def _notify_websocket(event_data):
    """Fire-and-forget async notification thread."""
    threading.Thread(target=_send_notification, args=(event_data,), daemon=True).start()


def _sync_brand_direct_price(brand, price):
    """
    Synchronize the weekly spot price as the brand's Direct Purchase Price.
    Only updates direct_purchase_price — NOT babi_platform_price, which is
    reserved for basket fulfillment wholesale prices set by the admin separately.
    """
    if brand and price is not None:
        brand.direct_purchase_price = price
        brand.save(update_fields=['direct_purchase_price'])


class AdminMarketDataView(views.APIView):
    """
    GET /api/pricing/admin/market-data/?product_id=1&brand_id=2&year=2026&month=8
    POST /api/pricing/admin/market-data/
    Admin save & fetch bi-monthly metrics and weekly spot prices.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        product_id = request.query_params.get('product_id')
        brand_id = request.query_params.get('brand_id')
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))

        if not product_id:
            return Response({'success': False, 'error': 'product_id parameter is required.'}, status=400)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': 'Product not found.'}, status=404)

        brand = None
        if brand_id and brand_id != 'null':
            try:
                brand = Brand.objects.get(pk=brand_id)
            except Brand.DoesNotExist:
                pass

        # Bi-monthly metrics for specified year
        bi_monthly_qs = BiMonthlyMarketData.objects.filter(product=product, year=year)
        if brand:
            bi_monthly_qs = bi_monthly_qs.filter(brand=brand)
        bi_monthly_data = BiMonthlyMarketDataSerializer(bi_monthly_qs, many=True).data

        # Weekly spot prices for specified year and month
        weekly_qs = WeeklySpotPrice.objects.filter(product=product, year=year, month=month)
        if brand:
            weekly_qs = weekly_qs.filter(brand=brand)
        weekly_data = WeeklySpotPriceSerializer(weekly_qs.order_by('week_number'), many=True).data

        # Financial Loss Analysis
        loss_obj = FinancialLossAnalysis.objects.filter(product=product, brand=brand).first()
        loss_data = FinancialLossAnalysisSerializer(loss_obj).data if loss_obj else None

        # Procurement Guidance
        guidance_obj = ProcurementGuidance.objects.filter(product=product, brand=brand).first()
        guidance_data = ProcurementGuidanceSerializer(guidance_obj).data if guidance_obj else None

        return Response({
            'success': True,
            'data': {
                'productId': product.id,
                'productName': product.name,
                'brandId': brand.id if brand else None,
                'brandName': brand.name if brand else None,
                'year': year,
                'month': month,
                'biMonthlyMetrics': bi_monthly_data,
                'weeklySpotPrices': weekly_data,
                'financialLossAnalysis': loss_data,
                'procurementGuidance': guidance_data,
            }
        })

    def post(self, request):
        data = request.data
        product_id = data.get('productId')
        brand_id = data.get('brandId')
        year = int(data.get('year', timezone.now().year))
        month = int(data.get('month', timezone.now().month))

        if not product_id:
            return Response({'success': False, 'error': 'productId is required.'}, status=400)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': 'Product not found.'}, status=404)

        brand = None
        if brand_id and brand_id != 'null':
            try:
                brand = Brand.objects.get(pk=brand_id)
            except Brand.DoesNotExist:
                pass

        with transaction.atomic():
            # 1. Save Bi-Monthly Metrics
            bi_monthly_inputs = data.get('biMonthlyMetrics', [])
            for item in bi_monthly_inputs:
                period = item.get('period')
                if not period:
                    continue

                BiMonthlyMarketData.objects.update_or_create(
                    product=product,
                    brand=brand,
                    year=year,
                    period=period,
                    defaults={
                        'min_average_price': item.get('minAveragePrice', 0),
                        'max_average_price': item.get('maxAveragePrice', 0),
                        'min_weekly_increase': item.get('minWeeklyIncrease', 0),
                        'max_weekly_increase': item.get('maxWeeklyIncrease', 0),
                        'min_weekly_discount': item.get('minWeeklyDiscount', 0),
                        'max_weekly_discount': item.get('maxWeeklyDiscount', 0),
                    }
                )

            # 2. Save Weekly Spot Prices & Two-Way Sync
            weekly_inputs = data.get('weeklySpotPrices', [])
            now = timezone.now()
            current_week_num = min((now.day - 1) // 7 + 1, 4)

            for w_item in weekly_inputs:
                w_num = int(w_item.get('weekNumber', 1))
                price_val = w_item.get('directPurchasePrice')

                spot_obj, _ = WeeklySpotPrice.objects.update_or_create(
                    product=product,
                    brand=brand,
                    year=year,
                    month=month,
                    week_number=w_num,
                    defaults={
                        'week_label': w_item.get('weekLabel', f"W{w_num}"),
                        'direct_purchase_price': price_val if price_val is not None and str(price_val).strip() != '' else None,
                    }
                )

                # Two-Way Sync: Update Brand.babi_platform_price if this matches current month/week
                if brand and year == now.year and month == now.month and w_num == current_week_num and price_val is not None:
                    _sync_brand_direct_price(brand, price_val)

        # Notify via WebSocket broadcast
        _notify_websocket({
            'type': 'MARKET_DATA_UPDATED',
            'productId': product.id,
            'brandId': brand.id if brand else None,
            'year': year,
            'month': month,
        })

        # Price alert: notify users who previously ordered this product/brand
        if weekly_inputs:
            # Import here to avoid circular import
            from apps.orders.models import Order, OrderItem
            now_ref = timezone.now()
            current_week_num = min((now_ref.day - 1) // 7 + 1, 4)
            # Find the current week's price being saved
            current_week_entry = next(
                (w for w in weekly_inputs if int(w.get('weekNumber', 0)) == current_week_num and w.get('directPurchasePrice') is not None),
                None
            )
            if current_week_entry and brand:
                new_price = current_week_entry.get('directPurchasePrice')
                # Find all users who have ordered this product/brand
                user_ids_ordered = OrderItem.objects.filter(
                    product=product,
                    brand=brand,
                ).values_list('order__placed_by', flat=True).distinct()
                from django.contrib.auth import get_user_model
                User = get_user_model()
                notified_users = User.objects.filter(id__in=user_ids_ordered, is_active=True)
                for u in notified_users:
                    send_user_notification(
                        user=u,
                        title=f'Price Update: {product.name} ({brand.name})',
                        message=(
                            f'The current week price for {product.name} ({brand.name}) '
                            f'has been updated to ETB {new_price} on MBE External Purchaser. '
                            f'Check market intelligence for full trend data.'
                        ),
                        notification_type=Notification.NotificationType.PRICE_ALERT,
                        action_url='/dashboard/market-intelligence',
                    )

        return Response({
            'success': True,
            'message': 'Market data saved and synchronized successfully.',
        })


class AdminFinancialLossView(views.APIView):
    """
    GET/POST /api/pricing/admin/financial-loss/
    Save/fetch financial loss analysis for a product.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        product_id = data.get('productId')
        if not product_id:
            return Response({'success': False, 'error': 'productId is required.'}, status=400)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': 'Product not found.'}, status=404)

        brand_id = data.get('brandId')
        brand = Brand.objects.filter(pk=brand_id).first() if brand_id else None

        loss_obj, _ = FinancialLossAnalysis.objects.update_or_create(
            product=product,
            brand=brand,
            defaults={
                'base_price': data.get('basePrice', 0),
                'peak_surge_price': data.get('peakSurgePrice', 0),
                'discounted_optimal_price': data.get('discountedOptimalPrice', 0),
                'single_company_loss': data.get('singleCompanyLoss', 0),
                'aggregate_500_companies_loss': data.get('aggregate500CompaniesLoss', 0),
            }
        )

        _notify_websocket({'type': 'MARKET_DATA_UPDATED', 'productId': product.id})
        return Response({'success': True, 'data': FinancialLossAnalysisSerializer(loss_obj).data})


class AdminProcurementGuidanceView(views.APIView):
    """
    GET/POST /api/pricing/admin/guidance/
    Save/fetch procurement guidance & recommendations for a product.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        product_id = data.get('productId')
        if not product_id:
            return Response({'success': False, 'error': 'productId is required.'}, status=400)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': 'Product not found.'}, status=404)

        brand_id = data.get('brandId')
        brand = Brand.objects.filter(pk=brand_id).first() if brand_id else None

        guidance_obj, _ = ProcurementGuidance.objects.update_or_create(
            product=product,
            brand=brand,
            defaults={
                'first_best_season': data.get('firstBestSeason', 'Sept - Oct'),
                'second_best_season': data.get('secondBestSeason', 'May - Jun'),
                'third_best_season': data.get('thirdBestSeason', 'Jan - Feb'),
                'seasonal_buying_guide_notes': data.get('seasonalBuyingGuideNotes', ''),
                'recommendation_summary': data.get('recommendationSummary', ''),
            }
        )

        _notify_websocket({'type': 'MARKET_DATA_UPDATED', 'productId': product.id})
        return Response({'success': True, 'data': ProcurementGuidanceSerializer(guidance_obj).data})


class UserMarketIntelligenceView(views.APIView):
    """
    GET /api/pricing/market-intelligence/
    Returns full database payload for Market Intelligence page.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.prefetch_related(
            'brands', 'bi_monthly_data', 'weekly_spot_prices', 'financial_loss_analyses'
        ).filter(is_available=True).order_by('id')

        product_list = []
        for p in products:
            brands = p.brands.all()
            if not brands.exists():
                continue

            for active_brand in brands:
                # Pricing — use direct_purchase_price as the platform direct price
                reg_price = active_brand.regular_market_price or Decimal('0.00')
                merk_price = active_brand.merkato_retailer_price or Decimal('0.00')
                plat_price = active_brand.direct_purchase_price or Decimal('0.00')

                # Weekly spot prices for this product AND active_brand (prefer brand-specific, fallback to general)
                weekly_qs = WeeklySpotPrice.objects.filter(product=p).filter(
                    Q(brand=active_brand) | Q(brand__isnull=True)
                )

                # Current real-world date context
                now = timezone.now()
                current_year = now.year
                current_month = now.month
                current_week_num = min((now.day - 1) // 7 + 1, 4)
                MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                month_name = MONTH_NAMES[current_month - 1]

                # Weekly spot prices strictly for current year and month
                spot_prices = weekly_qs.filter(year=current_year, month=current_month).order_by('week_number')
                is_current_month = spot_prices.exists()

                weekly_map = {w.week_number: float(w.direct_purchase_price) for w in spot_prices if w.direct_purchase_price is not None}
                has_spot_prices = len(weekly_map) > 0

                latest_avail_week = max(weekly_map.keys()) if weekly_map else None
                has_current_week_price = current_week_num in weekly_map

                weekly_history = [
                    {
                        'week': f"{month_name} W{w_num}",
                        'weekNumber': w_num,
                        'price': weekly_map.get(w_num, None)
                    }
                    for w_num in range(1, 5)
                ]

                # Group Bi-monthly metrics by year for this product/brand (filter out zero records)
                bi_monthly_qs = BiMonthlyMarketData.objects.filter(product=p).filter(
                    Q(brand=active_brand) | Q(brand__isnull=True)
                )

                valid_bm_qs = [
                    bm for bm in bi_monthly_qs
                    if (float(bm.min_average_price or 0) > 0 or float(bm.max_average_price or 0) > 0)
                ]
                has_bimonthly = len(valid_bm_qs) > 0

                # Strictly skip brands that have NO current month spot prices AND NO bi-monthly data
                if not has_spot_prices and not has_bimonthly:
                    continue

                years_dict = {}
                for bm in valid_bm_qs:
                    y = bm.year
                    if y not in years_dict:
                        years_dict[y] = []
                    years_dict[y].append({
                        'period': bm.period,
                        'average_price_etb': {'min': float(bm.min_average_price), 'max': float(bm.max_average_price)},
                        'weekly_increase_etb': {'min': float(bm.min_weekly_increase), 'max': float(bm.max_weekly_increase)},
                        'weekly_discount_etb': {'min': float(bm.min_weekly_discount), 'max': float(bm.max_weekly_discount)},
                    })

                product_list.append({
                    'id': f"{p.id}_{active_brand.id}",
                    'productId': str(p.id),
                    'name': p.name,
                    'category': p.category.name if p.category else 'General',
                    'unit': p.unit_of_measure or 'unit',
                    'brandId': str(active_brand.id),
                    'brandName': active_brand.name,
                    'current_pricing': {
                        'regularMarketPrice': float(reg_price),
                        'merkatoRetailerPrice': float(merk_price),
                        'platformDirectPrice': float(plat_price),
                    },
                    'currentMonthInfo': {
                        'isCurrentMonth': is_current_month,
                        'currentYear': current_year,
                        'currentMonth': current_month,
                        'currentWeekNumber': current_week_num,
                        'hasCurrentWeekPrice': has_current_week_price,
                        'latestAvailableWeekNumber': latest_avail_week,
                    },
                    'weeklyHistory': weekly_history,
                    'biMonthlyDataByYear': years_dict,
                    'hasBiMonthlyData': len(years_dict) > 0,
                })

        # Capital loss summary calculation
        all_losses = FinancialLossAnalysis.objects.all()
        total_wasted = sum(float(l.aggregate_500_companies_loss) for l in all_losses)
        avg_loss = sum(float(l.single_company_loss) for l in all_losses) / max(len(all_losses), 1)

        loss_breakdown = [
            {
                'product': l.product.name,
                'lossAmount': float(l.aggregate_500_companies_loss)
            }
            for l in all_losses
        ]

        return Response({
            'success': True,
            'data': {
                'products': product_list,
                'capitalLossAnalysis': {
                    'totalCapitalWasted': total_wasted,
                    'organizationsAnalyzed': 500,
                    'avgLossPerCompany': avg_loss,
                    'lossBreakdown': loss_breakdown,
                }
            }
        })


class UserProcurementCalendarView(views.APIView):
    """
    GET /api/pricing/procurement-calendar/
    Returns multi-year risk-adjusted recommendations, dynamic season classifications,
    and year-unbound historical breakdowns for Procurement Calendar page.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.prefetch_related(
            'brands', 'bi_monthly_data', 'procurement_guidances'
        ).filter(is_available=True).order_by('id')

        BI_MONTHLY_PERIODS = [
            'Sept - Oct',
            'Nov - Dec',
            'Jan - Feb',
            'Mar - Apr',
            'May - Jun',
            'Jul - Aug',
        ]

        calendar_products = []
        for p in products:
            brands = p.brands.all()
            if not brands.exists():
                continue

            for active_brand in brands:
                guidance = ProcurementGuidance.objects.filter(product=p, brand=active_brand).first()

                # Query all bi-monthly data for this product and brand (or brand-less)
                bi_monthly_qs = BiMonthlyMarketData.objects.filter(product=p).filter(
                    Q(brand=active_brand) | Q(brand__isnull=True)
                )

                # Robust filter out zero / empty records where min_average_price <= 0 and max_average_price <= 0
                valid_bi_monthly = [
                    bm for bm in bi_monthly_qs
                    if (float(bm.min_average_price or 0) > 0 or float(bm.max_average_price or 0) > 0)
                ]

                # Group by period -> list of yearly records
                period_records = {period: [] for period in BI_MONTHLY_PERIODS}
                years_set = set()

                for bm in valid_bi_monthly:
                    if bm.period in period_records:
                        period_records[bm.period].append(bm)
                        years_set.add(bm.year)

                has_data = len(years_set) > 0 and any(len(recs) > 0 for recs in period_records.values())

                # Calculate Risk-Adjusted Procurement Score for each period
                period_scores = []
                for period in BI_MONTHLY_PERIODS:
                    recs = period_records[period]
                    if not recs:
                        continue

                    # Step 1: Midpoints per year
                    mid_prices = [float((r.min_average_price + r.max_average_price) / Decimal('2.0')) for r in recs]
                    mid_increases = [float((r.min_weekly_increase + r.max_weekly_increase) / Decimal('2.0')) for r in recs]
                    mid_discounts = [float((r.min_weekly_discount + r.max_weekly_discount) / Decimal('2.0')) for r in recs]

                    n = len(recs)
                    avg_price = sum(mid_prices) / n
                    avg_increase = sum(mid_increases) / n
                    avg_discount = sum(mid_discounts) / n

                    if avg_price > 0:
                        surge_ratio = avg_increase / avg_price
                        discount_ratio = avg_discount / avg_price
                        score = avg_price * (1.0 + (0.6 * surge_ratio) - (0.3 * discount_ratio))
                    else:
                        score = 0.0

                    period_scores.append({
                        'period': period,
                        'score': score,
                        'avgPrice': avg_price,
                        'avgIncrease': avg_increase,
                        'avgDiscount': avg_discount,
                    })

                # Determine season rankings if data exists
                classification_map = {}
                first_best = None
                second_best = None
                worst = None

                if has_data and len(period_scores) >= 3:
                    # Sort by score ascending (lowest score = best procurement window)
                    sorted_scores = sorted(period_scores, key=lambda x: x['score'])
                    first_best = sorted_scores[0]['period']
                    second_best = sorted_scores[1]['period']
                    worst = sorted_scores[-1]['period']

                    for item in period_scores:
                        p_name = item['period']
                        if p_name == first_best:
                            classification_map[p_name] = '1st Best'
                        elif p_name == second_best:
                            classification_map[p_name] = '2nd Best'
                        elif p_name == worst:
                            classification_map[p_name] = 'Worst'
                        else:
                            classification_map[p_name] = 'Normal'

                # Check if admin guidance exists
                has_guidance = guidance is not None and bool(guidance.recommendation_summary or guidance.seasonal_buying_guide_notes)
                has_calendar_data = has_data or has_guidance

                if not has_calendar_data:
                    platform_rec = None
                    seasonal_rankings = None
                else:
                    if has_data:
                        rec_summary = guidance.recommendation_summary if (guidance and guidance.recommendation_summary) else (
                            f"Optimal procurement window for {p.name} ({active_brand.name}) is {first_best} (lowest risk-adjusted cost) "
                            f"and {second_best}. Avoid {worst} due to seasonal market price surges."
                        )

                        rec_notes = guidance.seasonal_buying_guide_notes if (guidance and guidance.seasonal_buying_guide_notes) else (
                            f"Risk-adjusted pricing analysis evaluates baseline prices alongside weekly upward volatility (0.6x surge penalty) "
                            f"and discount opportunities (0.3x discount credit) across recorded years."
                        )
                    else:
                        first_best = guidance.first_best_season if guidance else 'Sept - Oct'
                        second_best = guidance.second_best_season if guidance else 'May - Jun'
                        worst = guidance.third_best_season if guidance else 'Jul - Aug'
                        rec_summary = guidance.recommendation_summary if guidance else None
                        rec_notes = guidance.seasonal_buying_guide_notes if guidance else None

                    platform_rec = {
                        'summary': rec_summary,
                        'buyingGuideNotes': rec_notes,
                    }
                    seasonal_rankings = {
                        'firstBestSeason': first_best,
                        'secondBestSeason': second_best,
                        'worstSeason': worst,
                    }

                # Format bi-monthly period breakdown with all years
                bi_monthly_periods_payload = []
                for period in BI_MONTHLY_PERIODS:
                    recs = period_records[period]
                    yearly_history = []
                    for r in sorted(recs, key=lambda x: x.year, reverse=True):
                        min_p = float(r.min_average_price)
                        max_p = float(r.max_average_price)
                        avg_p = round((min_p + max_p) / 2.0, 2)
                        variance = round(max_p - min_p, 2)

                        yearly_history.append({
                            'year': r.year,
                            'ethiopianYear': r.year - 9,
                            'minPrice': min_p,
                            'maxPrice': max_p,
                            'avgPrice': avg_p,
                            'variance': variance,
                            'minWeeklyIncrease': float(r.min_weekly_increase),
                            'maxWeeklyIncrease': float(r.max_weekly_increase),
                            'minWeeklyDiscount': float(r.min_weekly_discount),
                            'maxWeeklyDiscount': float(r.max_weekly_discount),
                        })

                    bi_monthly_periods_payload.append({
                        'period': period,
                        'classification': classification_map.get(period, 'Normal'),
                        'yearlyHistory': yearly_history,
                    })

                calendar_products.append({
                    'id': f"{p.id}_{active_brand.id}",
                    'productId': str(p.id),
                    'name': p.name,
                    'category': p.category.name if p.category else 'General',
                    'unit': p.unit_of_measure or 'unit',
                    'brandId': str(active_brand.id),
                    'brandName': active_brand.name,
                    'hasBiMonthlyData': has_data,
                    'hasCalendarData': has_calendar_data,
                    'calculationRationale': 'Ranked using multi-year price averages and risk-adjusted volatility multipliers (0.6x surge risk / 0.3x discount opportunity).' if has_data else 'Based on admin procurement recommendations.',
                    'seasonalRankings': seasonal_rankings,
                    'platformRecommendation': platform_rec,
                    'biMonthlyPeriods': bi_monthly_periods_payload,
                })

        return Response({
            'success': True,
            'data': {
                'products': calendar_products
            }
        })
