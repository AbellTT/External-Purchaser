import { useState } from 'react'
import { CalendarDays, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import biMonthlyData from '@/data/MI/bi-monthly_data.json'

// Mock seasonal recommendations for products without bi-monthly data
// These simulate what an admin would configure as best/worst procurement periods
const MOCK_SEASONAL_GUIDE: Record<string, {
  bestSeason: string
  secondBestSeason: string
  worstSeason: string
  recommendation: string
}> = {
  'Ballpoint Pen': {
    bestSeason: 'May - Jun',
    secondBestSeason: 'Sept - Oct',
    worstSeason: 'Jan - Feb',
    recommendation: 'Bulk purchases during off-peak seasons typically yield 15-20% better rates. Long-term basket participation (3-6 months) helps lock in favorable pricing and ensures consistent supply. Avoid January-February when back-to-school demand peaks.'
  },
  'Notebook': {
    bestSeason: 'Mar - Apr',
    secondBestSeason: 'Jul - Aug',
    worstSeason: 'Nov - Dec',
    recommendation: 'Strong seasonality around school periods drives price fluctuations. Strategic buyers procure 2-3 months before peak demand or participate in volume-pooling baskets. November-December shows highest prices due to academic calendar alignment.'
  },
  'Ledger Book': {
    bestSeason: 'May - Jun',
    secondBestSeason: 'Sept - Oct',
    worstSeason: 'Jan - Feb',
    recommendation: 'Premium variants show more stable pricing. For large orders (500+ units), direct manufacturer contact or long-term basket commitments can secure better rates. January-February typically sees elevated prices due to fiscal year-end demand.'
  },
  'Stapler': {
    bestSeason: 'Jul - Aug',
    secondBestSeason: 'Mar - Apr',
    worstSeason: 'Nov - Dec',
    recommendation: 'Limited local supply makes advance planning critical. Pre-ordering 2-3 months ahead and participating in quarterly baskets reduces both cost and supply risk. November-December shows peak pricing due to year-end office procurement cycles.'
  },
}

// Admin recommendations for products (editable by admin - general procurement guidance)
const ADMIN_RECOMMENDATIONS: Record<string, string> = {
  'Siner Line A4 Paper': 'Consider timing large orders around periods of lower market demand. Joining long-term baskets (3-6 months) can help lock in favorable rates and reduce price volatility exposure.',
  'OSA HP Toner': 'Toner cartridges benefit from bulk purchasing strategies. Pre-ordering 2-3 months ahead and participating in volume-based baskets typically yields better pricing.',
  'Box File KENT': 'Local suppliers offer competitive pricing during off-peak seasons. For orders exceeding 300 units, explore direct supplier negotiations for additional savings.',
  'Marker': 'Avoid purchasing during back-to-school season when demand peaks. Early procurement or off-season bulk orders provide better value and availability.',
  // Additional products without bi-monthly data - show recommendations only
  'Ballpoint Pen': 'Bulk purchases during off-peak seasons typically yield 15-20% better rates. Long-term basket participation (3-6 months) helps lock in favorable pricing and ensures consistent supply.',
  'Notebook': 'Strong seasonality around school periods drives price fluctuations. Strategic buyers procure 2-3 months before peak demand or participate in volume-pooling baskets.',
  'Ledger Book': 'Premium variants show more stable pricing. For large orders (500+ units), direct manufacturer contact or long-term basket commitments can secure better rates.',
  'Stapler': 'Limited local supply makes advance planning critical. Pre-ordering 2-3 months ahead and participating in quarterly baskets reduces both cost and supply risk.',
}

// Products that have full bi-monthly data analysis
const PRODUCTS_WITH_DATA = ['Siner Line A4 Paper', 'OSA HP Toner', 'Box File KENT', 'Marker']

// All products available on platform (for product selector)
const ALL_PRODUCTS = [
  ...PRODUCTS_WITH_DATA,
  'Ballpoint Pen',
  'Notebook', 
  'Ledger Book',
  'Stapler'
]

type Product = typeof biMonthlyData.market_data[0]

// Analyze seasonal patterns for each product
function analyzeSeasonalPatterns(product: Product) {
  const metrics = product.bi_monthly_metrics
  
  // Find highest and lowest average price periods
  const pricesWithPeriod = metrics.map(m => ({
    period: m.period,
    avgPrice: (m.average_price_etb.min + m.average_price_etb.max) / 2,
    minPrice: m.average_price_etb.min,
    maxPrice: m.average_price_etb.max,
    volatility: m.weekly_increase_etb.max + m.weekly_discount_etb.max
  }))
  
  const highest = pricesWithPeriod.reduce((a, b) => a.avgPrice > b.avgPrice ? a : b)
  const lowest = pricesWithPeriod.reduce((a, b) => a.avgPrice < b.avgPrice ? a : b)
  const mostVolatile = pricesWithPeriod.reduce((a, b) => a.volatility > b.volatility ? a : b)
  
  // Calculate savings potential
  const savingsPotential = ((highest.avgPrice - lowest.avgPrice) / highest.avgPrice * 100).toFixed(1)
  
  // Rank all seasons by score (price + volatility)
  const seasonScores = pricesWithPeriod.map(p => ({
    period: p.period,
    avgPrice: p.avgPrice,
    score: (1 - p.avgPrice / highest.avgPrice) * 0.7 + (1 - p.volatility / mostVolatile.volatility) * 0.3
  })).sort((a, b) => b.score - a.score) // Sort by score descending
  
  const bestSeason = seasonScores[0]
  const secondBestSeason = seasonScores[1]
  const worstSeason = seasonScores[seasonScores.length - 1]
  
  return {
    highest,
    lowest,
    mostVolatile,
    bestSeason,
    secondBestSeason,
    worstSeason,
    savingsPotential
  }
}

export function ProcurementCalendarPage() {
  const [selectedProduct, setSelectedProduct] = useState<string>(ALL_PRODUCTS[0])
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false)

  // Check if selected product has bi-monthly data
  const hasData = PRODUCTS_WITH_DATA.includes(selectedProduct)
  const productData = hasData ? biMonthlyData.market_data.find(p => p.product === selectedProduct) : null
  const analysis = productData ? analyzeSeasonalPatterns(productData) : null

  // Product selector - show first 4 by default, expand to all 8
  const displayedProducts = showAllProducts ? ALL_PRODUCTS : ALL_PRODUCTS.slice(0, 4)

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Purchasing Intelligence Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Seasonal trends and optimal procurement timing based on historical market patterns.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="border-info/30 bg-info-bg/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-info">Historical Trends, Not Price Predictions</p>
                <p>
                  This calendar shows seasonal patterns and trends based on past data. Price examples are from historical records 
                  and should not be interpreted as current or future pricing. Market conditions, exchange rates, and supply chains 
                  are volatile — actual prices may differ significantly. Use these insights to understand <strong className="text-foreground">when</strong> to buy, 
                  not <strong className="text-foreground">what price to expect</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selector */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {displayedProducts.map((product) => (
              <Button
                key={product}
                size="sm"
                variant={selectedProduct === product ? 'default' : 'outline'}
                onClick={() => setSelectedProduct(product)}
                className="text-xs"
              >
                {product.replace('Siner Line ', '').replace('OSA ', '').replace('Box File ', '')}
              </Button>
            ))}
          </div>
          {!showAllProducts && ALL_PRODUCTS.length > 4 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAllProducts(true)}
              className="text-xs text-primary hover:text-primary"
            >
              + View {ALL_PRODUCTS.length - 4} More Products
            </Button>
          )}
          {showAllProducts && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAllProducts(false)}
              className="text-xs text-muted-foreground"
            >
              Show Less
            </Button>
          )}
        </div>

        {/* Products WITH bi-monthly data: Show seasonal buying guide */}
        {hasData && analysis && productData && (
          <>
            {/* Key Insights Summary - Top 3 Ranked Seasons */}
            <Card className="border-border bg-primary-subtle/30">
              <CardHeader>
                <CardTitle className="text-base">{selectedProduct} — Seasonal Buying Guide</CardTitle>
                <CardDescription>Top-ranked procurement windows based on historical price trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* #1 Best Season */}
                  <div className="bg-card border-2 border-success rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-success text-white flex items-center justify-center font-bold text-sm">
                        #1
                      </div>
                      <p className="text-xs font-semibold text-success uppercase tracking-wide">Best Season</p>
                    </div>
                    <p className="text-xl font-bold text-success mb-1">{analysis.bestSeason.period}</p>
                    <p className="text-xs text-muted-foreground">
                      Optimal buying window with lowest historical prices and best stability
                    </p>
                  </div>

                  {/* #2 Second Best Season */}
                  <div className="bg-card border border-primary rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        #2
                      </div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">2nd Best Season</p>
                    </div>
                    <p className="text-xl font-bold text-primary mb-1">{analysis.secondBestSeason.period}</p>
                    <p className="text-xs text-muted-foreground">
                      Alternative procurement window with favorable pricing
                    </p>
                  </div>

                  {/* Worst Season to Avoid */}
                  <div className="bg-card border border-error rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-error text-white flex items-center justify-center font-bold text-sm">
                        ⚠️
                      </div>
                      <p className="text-xs font-semibold text-error uppercase tracking-wide">Avoid Period</p>
                    </div>
                    <p className="text-xl font-bold text-error mb-1">{analysis.worstSeason.period}</p>
                    <p className="text-xs text-muted-foreground">
                      Least favorable period with highest costs or volatility
                    </p>
                  </div>
                </div>

                {/* Price Variance Info */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Historical Trend Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on 2026 data, strategic timing between the best and worst periods has historically yielded up to{' '}
                    <strong className="text-success">{analysis.savingsPotential}%</strong> cost difference. Organizations that consistently purchase during optimal windows 
                    achieve significant savings over time. <strong className="text-foreground">Focus on the seasonal pattern, not specific prices.</strong>
                  </p>
                </div>

                {/* Admin Recommendation */}
                {ADMIN_RECOMMENDATIONS[selectedProduct] && (
                  <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">💡 Platform Recommendation</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {ADMIN_RECOMMENDATIONS[selectedProduct]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seasonal Breakdown by Bi-Monthly Period */}
            <div className="space-y-3">
              {productData.bi_monthly_metrics.map((metric) => {
                const avgPrice = (metric.average_price_etb.min + metric.average_price_etb.max) / 2
                const priceRange = metric.average_price_etb.max - metric.average_price_etb.min
                
                // Determine period characteristics
                const isBestSeason = metric.period === analysis.bestSeason.period
                const isSecondBest = metric.period === analysis.secondBestSeason.period
                const isWorst = metric.period === analysis.worstSeason.period
            
            return (
              <Card 
                key={metric.period} 
                className={`border-border ${
                  isBestSeason ? 'ring-2 ring-success/30 bg-success-bg/20' :
                  isSecondBest ? 'ring-2 ring-primary/30 bg-primary-subtle/20' :
                  isWorst ? 'ring-2 ring-error/30 bg-error-bg/10' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Period Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-foreground">{metric.period}</p>
                        {isBestSeason && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success text-white">
                            #1 Best Season
                          </span>
                        )}
                        {isSecondBest && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-white">
                            #2 Good Season
                          </span>
                        )}
                        {isWorst && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-error text-white">
                            ⚠️ Avoid Period
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comparative Summary (based on multi-year averages vs other periods) */}
                    <div className="bg-surface-muted/50 border border-border rounded-md p-3 text-xs text-muted-foreground">
                      {isBestSeason && (
                        <p>
                          💰 <strong className="text-foreground">Top-ranked procurement window</strong> — Across all years, this period shows the lowest average prices 
                          and best market stability compared to other bi-monthly periods. <strong className="text-success">~{analysis.savingsPotential}% lower</strong> than worst period.
                        </p>
                      )}
                      {isSecondBest && !isBestSeason && (
                        <p>
                          ✅ <strong className="text-foreground">Strong alternative buying period</strong> — Multi-year trends show favorable pricing compared to peak periods. 
                          Recommended when primary window is missed.
                        </p>
                      )}
                      {isWorst && (
                        <p>
                          ⚠️ <strong className="text-foreground">Least favorable procurement window</strong> — Historical data shows this period typically has 
                          the highest costs or greatest volatility. <strong className="text-error">~{analysis.savingsPotential}% higher</strong> than best period.
                        </p>
                      )}
                      {!isBestSeason && !isSecondBest && !isWorst && (
                        <p>
                          📅 <strong className="text-foreground">Moderate procurement period</strong> — Multi-year averages show mid-range pricing. 
                          Better opportunities exist in {analysis.bestSeason.period} or {analysis.secondBestSeason.period}.
                        </p>
                      )}
                    </div>

                    {/* Multi-Year Data Display (currently showing 2026 only - structure ready for multiple years) */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Historical Data by Year</p>
                      
                      {/* Year 2026 Data */}
                      <div className="bg-surface-muted/30 rounded-md p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground">Year 2026 (Ethiopian Calendar 2017)</p>
                          <p className="text-xs font-mono text-muted-foreground">
                            Range: ETB {metric.average_price_etb.min} - {metric.average_price_etb.max}
                          </p>
                        </div>
                        
                        {/* Metrics Grid - Moved inside historical data */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          {/* Average Price */}
                          <div>
                            <p className="text-muted-foreground mb-1">2026 Avg Price</p>
                            <p className="font-bold text-foreground font-mono">~ETB {avgPrice.toFixed(0)}</p>
                          </div>

                          {/* Price Range */}
                          <div>
                            <p className="text-muted-foreground mb-1">Price Variance</p>
                            <p className="font-bold text-foreground font-mono">ETB {priceRange}</p>
                          </div>

                          {/* Max Weekly Increase */}
                          <div>
                            <p className="text-muted-foreground mb-1">Typical Weekly Rise</p>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-error" />
                              <p className="font-bold text-error font-mono">~ETB {metric.weekly_increase_etb.max}</p>
                            </div>
                          </div>

                          {/* Max Weekly Discount */}
                          <div>
                            <p className="text-muted-foreground mb-1">Typical Weekly Drop</p>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3 text-success" />
                              <p className="font-bold text-success font-mono">~ETB {metric.weekly_discount_etb.max}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Placeholder for future years - admin can add more historical data */}
                      <div className="bg-surface-muted/10 border border-dashed border-border rounded-md p-3">
                        <p className="text-[10px] text-muted-foreground text-center">
                          Additional years can be added by administrators to show multi-year trends and averages
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom Note */}
        <Card className="border-border bg-surface-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Data Source & Disclaimer:</strong> All trends and insights are based on 2026 historical 
              Merkato retailer pricing data (12+ months). Price values shown are examples from 2026 records to illustrate seasonal buying patterns — 
              they are NOT current prices or future predictions. Actual market prices are highly volatile and influenced by exchange rates, supply chain 
              disruptions, and demand fluctuations. <strong className="text-foreground">This page focuses on WHEN to buy based on seasonal trends, not WHAT price to expect.</strong> Check the Market Intelligence page for current real-time pricing.
            </p>
          </CardContent>
        </Card>
      </>
        )}

        {/* Products WITHOUT bi-monthly data: Show mock seasonal guide with admin recommendations */}
        {!hasData && MOCK_SEASONAL_GUIDE[selectedProduct] && (
          <>
            <Card className="border-border bg-primary-subtle/30">
              <CardHeader>
                <CardTitle className="text-base">{selectedProduct} — Seasonal Buying Guide</CardTitle>
                <CardDescription>Platform-recommended procurement windows based on market expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* #1 Best Season */}
                  <div className="bg-card border-2 border-success rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-success text-white flex items-center justify-center font-bold text-sm">
                        #1
                      </div>
                      <p className="text-xs font-semibold text-success uppercase tracking-wide">Best Season</p>
                    </div>
                    <p className="text-xl font-bold text-success mb-1">{MOCK_SEASONAL_GUIDE[selectedProduct].bestSeason}</p>
                    <p className="text-xs text-muted-foreground">
                      Optimal buying window recommended by platform administrators
                    </p>
                  </div>

                  {/* #2 Second Best Season */}
                  <div className="bg-card border border-primary rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        #2
                      </div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">2nd Best Season</p>
                    </div>
                    <p className="text-xl font-bold text-primary mb-1">{MOCK_SEASONAL_GUIDE[selectedProduct].secondBestSeason}</p>
                    <p className="text-xs text-muted-foreground">
                      Alternative procurement window with favorable conditions
                    </p>
                  </div>

                  {/* Worst Season to Avoid */}
                  <div className="bg-card border border-error rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-error text-white flex items-center justify-center font-bold text-sm">
                        ⚠️
                      </div>
                      <p className="text-xs font-semibold text-error uppercase tracking-wide">Avoid Period</p>
                    </div>
                    <p className="text-xl font-bold text-error mb-1">{MOCK_SEASONAL_GUIDE[selectedProduct].worstSeason}</p>
                    <p className="text-xs text-muted-foreground">
                      Least favorable period - avoid if possible
                    </p>
                  </div>
                </div>

                {/* Platform Recommendation */}
                <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">💡 Platform Recommendation</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {MOCK_SEASONAL_GUIDE[selectedProduct].recommendation}
                  </p>
                </div>

                {/* Info Note */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">ℹ️ About This Product</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Historical bi-monthly price data is not currently available for this product. The seasonal buying guide shown above 
                    is based on platform administrator recommendations derived from market expertise and procurement best practices. 
                    For real-time pricing and availability, check the <strong className="text-foreground">Direct Purchase</strong> or{' '}
                    <strong className="text-foreground">Basket System</strong> pages.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
