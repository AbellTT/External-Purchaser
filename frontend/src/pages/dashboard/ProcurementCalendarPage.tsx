import { useState, useEffect } from 'react'
import { PageMeta } from '@/components/PageMeta'
import { CalendarDays, Sparkles, Info, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProcurementCalendar,
  selectCalendarProducts,
  selectCalendarLoading,
} from '@/store/slices/marketIntelligenceSlice'
import { useOrgWebSocket } from '@/lib/useOrgWebSocket'

export function ProcurementCalendarPage() {
  useOrgWebSocket()
  const dispatch = useAppDispatch()
  const allProducts = useAppSelector(selectCalendarProducts)
  const loading = useAppSelector(selectCalendarLoading)

  // Filter products to ONLY include products/brands that have bi-monthly data or fallback guidance
  const displayProducts = allProducts.filter((p: any) => p.hasCalendarData || p.hasBiMonthlyData)

  const [selectedProductId, setSelectedProductId] = useState<string>('')

  useEffect(() => {
    dispatch(fetchProcurementCalendar())
  }, [dispatch])

  useEffect(() => {
    if (displayProducts.length > 0 && (!selectedProductId || !displayProducts.some((p) => p.id === selectedProductId))) {
      setSelectedProductId(displayProducts[0].id)
    }
  }, [displayProducts, selectedProductId])

  const selectedProduct = displayProducts.find((p) => p.id === selectedProductId) || displayProducts[0]

  if (loading && allProducts.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-muted-foreground">Loading procurement calendar...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const rankings = selectedProduct?.seasonalRankings
  const recommendation = selectedProduct?.platformRecommendation
  const biMonthlyPeriods = selectedProduct?.biMonthlyPeriods || []

  return (
    <DashboardLayout>
      <PageMeta
        title="Procurement Calendar"
        description="Bi-monthly pricing data and seasonal recommendations to plan your procurement cycles."
        path="/dashboard/calendar"
      />
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Header Bar */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarDays className="w-8 h-8 text-primary" />
            Procurement Calendar & Seasonal Guidance
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">
            Risk-adjusted purchasing recommendations and multi-year seasonal price breakdown.
          </p>
        </div>

        {/* Product & Brand Selector Bar */}
        <div className="bg-card p-4 sm:p-5 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs sm:text-sm font-mono font-bold text-muted-foreground uppercase tracking-wider">
            Select Product & Brand:
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full sm:w-auto sm:min-w-[280px] px-4 py-2.5 bg-background border border-border rounded-lg text-sm sm:text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {displayProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.brandName ? `(${p.brandName})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 1. Seasonal Buying Guide Card */}
        {selectedProduct && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Seasonal Buying Guide — {selectedProduct.name} {selectedProduct.brandName ? `(${selectedProduct.brandName})` : ''}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground font-medium">
                {selectedProduct.calculationRationale || 'Dynamic risk-adjusted purchasing recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1st Best Season */}
                <div className="p-4 bg-success-bg/30 border border-success/30 rounded-xl space-y-1">
                  <span className="text-xs font-mono font-bold text-success uppercase tracking-wider block">
                    🟢 1st Best Season to Buy
                  </span>
                  <p className="text-xl font-black text-foreground font-mono">
                    {rankings?.firstBestSeason || 'Sept - Oct'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">Lowest risk-adjusted procurement cost window.</p>
                </div>

                {/* 2nd Best Season */}
                <div className="p-4 bg-info-bg/30 border border-info/30 rounded-xl space-y-1">
                  <span className="text-xs font-mono font-bold text-info uppercase tracking-wider block">
                    🔵 2nd Best Season to Buy
                  </span>
                  <p className="text-xl font-black text-foreground font-mono">
                    {rankings?.secondBestSeason || 'May - Jun'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">Favorable baseline prices with strong savings potential.</p>
                </div>

                {/* Worst Season */}
                <div className="p-4 bg-error-bg/30 border border-error/30 rounded-xl space-y-1">
                  <span className="text-xs font-mono font-bold text-error uppercase tracking-wider block">
                    🔴 Worst Season to Buy
                  </span>
                  <p className="text-xl font-black text-foreground font-mono">
                    {rankings?.worstSeason || 'Jul - Aug'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">High market peak costs & severe surge risk.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. Platform Recommendation Section */}
        {selectedProduct && recommendation && (
          <Card className="border-primary/30 bg-primary-subtle/15 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-primary">
                <ShieldCheck className="w-5 h-5" />
                Platform Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              {recommendation.summary && (
                <div className="p-3.5 bg-background border border-border rounded-lg text-foreground font-medium leading-relaxed">
                  <strong className="text-primary font-bold">Summary:</strong> {recommendation.summary}
                </div>
              )}

              {recommendation.buyingGuideNotes && (
                <div className="p-3.5 bg-background/60 border border-border/80 rounded-lg text-muted-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold">Guidance Notes:</strong> {recommendation.buyingGuideNotes}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 3. Historical Bi-Monthly Breakdown (Single-Column Vertical Flow) */}
        {selectedProduct && biMonthlyPeriods.some((p: any) => p.yearlyHistory && p.yearlyHistory.length > 0) && (
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Historical Bi-Monthly Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                Multi-year historical price data aggregated for every bi-monthly period across all recorded years.
              </p>
            </div>

            {/* Vertical Flow of All 6 Bi-Monthly Periods */}
            <div className="space-y-4">
              {biMonthlyPeriods.map((periodItem: any) => {
                const { period, classification, yearlyHistory } = periodItem

                // Harmonious Theme-Consistent Styling
                let cardBorderStyle = 'border border-border bg-card'
                let badgeText = '⚪ Normal'
                let badgeStyle = 'bg-surface-muted text-muted-foreground border-border'

                if (classification === '1st Best') {
                  cardBorderStyle = 'border-2 border-success/40 bg-card'
                  badgeText = '🟢 1st Best Season'
                  badgeStyle = 'bg-success-bg text-success border-success/30 font-bold'
                } else if (classification === '2nd Best') {
                  cardBorderStyle = 'border-2 border-info/40 bg-card'
                  badgeText = '🔵 2nd Best Season'
                  badgeStyle = 'bg-info-bg text-info border-info/30 font-bold'
                } else if (classification === 'Worst') {
                  cardBorderStyle = 'border-2 border-error/40 bg-card'
                  badgeText = '🔴 Worst Season'
                  badgeStyle = 'bg-error-bg text-error border-error/30 font-bold'
                }

                return (
                  <Card key={period} className={`shadow-sm transition-all ${cardBorderStyle}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg font-bold font-mono">{period}</CardTitle>
                        <Badge variant="outline" className={`text-xs font-mono ${badgeStyle}`}>
                          {badgeText}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        Multi-year price movement trends for {period}.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {yearlyHistory && yearlyHistory.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                            Historical Data by Year
                          </p>
                          {/* Vertical Stack for Multi-Year Records */}
                          <div className="flex flex-col space-y-3 w-full font-mono text-xs">
                            {yearlyHistory.map((yItem: any) => (
                              <div key={yItem.year} className="p-3.5 bg-surface-muted/50 border border-border/80 rounded-xl space-y-2 w-full">
                                <div className="flex items-center justify-between pb-1 border-b border-border/60">
                                  <span className="font-extrabold text-foreground text-sm">
                                    {yItem.year} <span className="text-muted-foreground font-normal text-xs">(EC {yItem.ethiopianYear})</span>
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-bold">Recorded Year</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-1">
                                  <div>
                                    <span className="text-muted-foreground block text-[10px]">Price Range:</span>
                                    <span className="font-bold text-primary">ETB {yItem.minPrice} – {yItem.maxPrice}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-[10px]">Average Price:</span>
                                    <span className="font-bold text-foreground">~ETB {yItem.avgPrice}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-[10px]">Price Variance:</span>
                                    <span className="font-bold text-warning">ETB {yItem.variance}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-[10px]">Typical Weekly Rise:</span>
                                    <span className="font-bold text-error">
                                      ~ETB {yItem.minWeeklyIncrease} – {yItem.maxWeeklyIncrease}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-[10px]">Typical Weekly Drop:</span>
                                    <span className="font-bold text-success">
                                      ~ETB {yItem.minWeeklyDiscount} – {yItem.maxWeeklyDiscount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-muted-foreground italic p-2 bg-surface-muted/30 rounded-lg">
                          No multi-year historical records entered for {period} yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
