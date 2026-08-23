import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, AlertTriangle, Calendar, Clock, Info, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchMarketIntelligence,
  selectMarketIntelligenceProducts,
  selectMarketIntelligenceLoading,
} from '@/store/slices/marketIntelligenceSlice'
import { useOrgWebSocket } from '@/lib/useOrgWebSocket'

// Correct sequential ordering of bi-monthly periods
const PERIOD_ORDER: Record<string, number> = {
  'Sept - Oct': 1,
  'Nov - Dec': 2,
  'Jan - Feb': 3,
  'Mar - Apr': 4,
  'May - Jun': 5,
  'Jul - Aug': 6,
}

export function MarketIntelligencePage() {
  useOrgWebSocket()
  const dispatch = useAppDispatch()
  const allProducts = useAppSelector(selectMarketIntelligenceProducts)
  const loading = useAppSelector(selectMarketIntelligenceLoading)

  // Filter products to ONLY include products that have at least one entered current month spot price
  const productsWithSpotPrices = allProducts.filter(
    (p) => p.weeklyHistory && p.weeklyHistory.some((w) => w.price !== null && w.price !== undefined)
  )

  // Use filtered products if available, fallback to all products if data is initializing
  const displayProducts = productsWithSpotPrices.length > 0 ? productsWithSpotPrices : allProducts

  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(2026)

  useEffect(() => {
    dispatch(fetchMarketIntelligence())
  }, [dispatch])

  useEffect(() => {
    if (displayProducts.length > 0 && (!selectedProductId || !displayProducts.some(p => p.id === selectedProductId))) {
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
            <p className="text-sm font-semibold text-muted-foreground">Loading market intelligence...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Extract years available for selected product
  const availableYears = selectedProduct?.biMonthlyDataByYear
    ? Object.keys(selectedProduct.biMonthlyDataByYear).map(Number).sort((a, b) => b - a)
    : []

  const rawBiMonthlyForYear = selectedProduct?.biMonthlyDataByYear?.[selectedYear] || []

  // Sort bi-monthly periods strictly starting from Sept - Oct to Jul - Aug
  const biMonthlyForYear = [...rawBiMonthlyForYear].sort((a, b) => {
    const orderA = PERIOD_ORDER[a.period] || 99
    const orderB = PERIOD_ORDER[b.period] || 99
    return orderA - orderB
  })

  // Check if selected product has VALID bi-monthly historical data (must have non-zero prices!)
  const hasBiMonthlyData =
    selectedProduct?.hasBiMonthlyData &&
    biMonthlyForYear.length > 0 &&
    biMonthlyForYear.some(
      (bm) => bm.average_price_etb.max > 0 || bm.average_price_etb.min > 0
    )

  // Chart data for bi-monthly range analysis
  const biMonthlyChartData = biMonthlyForYear.map((bm) => ({
    period: bm.period,
    minPrice: bm.average_price_etb.min,
    maxPrice: bm.average_price_etb.max,
    avgPrice: Math.round((bm.average_price_etb.min + bm.average_price_etb.max) / 2),
    minIncrease: bm.weekly_increase_etb.min,
    maxIncrease: bm.weekly_increase_etb.max,
    minDiscount: bm.weekly_discount_etb.min,
    maxDiscount: bm.weekly_discount_etb.max,
  }))

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto">
        {/* Header Bar */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <TrendingUp className="w-8 h-8 text-primary" />
            Historical Market Intelligence
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">
            Real-time platform spot prices, bi-monthly historical range analysis, and purchasing insights.
          </p>
        </div>

        {/* General Informational Context Description Box */}
        <div className="bg-primary-subtle/20 border border-primary/20 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground leading-relaxed">
            <h2 className="text-base font-bold text-foreground">Understanding Market Pricing & Volatility</h2>
            <p>
              This dashboard provides institutional buyers with transparent price tracking across local stationery and supply markets. 
              By tracking live weekly spot prices alongside bi-monthly historical price ranges, procurement teams can anticipate seasonal price surges and optimize bulk purchasing timing.
            </p>
          </div>
        </div>

        {/* Product Dropdown Selector Bar */}
        <div className="bg-card p-4 sm:p-5 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs sm:text-sm font-mono font-bold text-muted-foreground uppercase tracking-wider">
            Select Product & Brand:
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-4 py-2.5 bg-background border border-border rounded-lg text-sm sm:text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[280px]"
          >
            {displayProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.brandName ? `(${p.brandName})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 1. Top Section — Current / Recent Week Price */}
        {selectedProduct && (() => {
          const info = selectedProduct.currentMonthInfo
          if (!info || !info.isCurrentMonth || !info.latestAvailableWeekNumber) {
            return (
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-5 sm:p-6 text-center space-y-1">
                  <p className="text-xs sm:text-sm font-mono font-bold text-muted-foreground uppercase tracking-wide">
                    Current Month Spot Price — {selectedProduct.name} {selectedProduct.brandName ? `(${selectedProduct.brandName})` : ''}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground italic pt-1">
                    No spot prices published for the current month yet.
                  </p>
                </CardContent>
              </Card>
            )
          }

          const isCurrentWeek = info.hasCurrentWeekPrice
          const weekNum = isCurrentWeek ? info.currentWeekNumber : info.latestAvailableWeekNumber
          const weekItem = selectedProduct.weeklyHistory.find((w: any) => w.weekNumber === weekNum)
          const displayPrice = weekItem?.price ?? selectedProduct.current_pricing.platformDirectPrice

          const labelText = isCurrentWeek
            ? `This Week's Price (Week ${weekNum})`
            : `Recent Week Price (Week ${weekNum})`

          return (
            <Card className="border-primary/40 bg-primary-subtle/20 shadow-sm">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-mono font-bold text-primary uppercase tracking-wide">
                    {labelText} — {selectedProduct.name} {selectedProduct.brandName ? `(${selectedProduct.brandName})` : ''}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-primary font-mono mt-1">
                    ETB {displayPrice ? Number(displayPrice).toLocaleString() : 'N/A'}
                  </p>
                  {!isCurrentWeek && (
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      Week {info.currentWeekNumber} price not published yet. Displaying latest available price from Week {weekNum}.
                    </p>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                  Per {selectedProduct.unit || 'unit'}
                </span>
              </CardContent>
            </Card>
          )
        })()}

        {/* 2. Current Month Spot Prices Card */}
        {selectedProduct && (
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Current Month Spot Prices — {selectedProduct.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground font-medium">
                Weekly spot prices entered by admin (real-time platform direct prices).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={selectedProduct.weeklyHistory} margin={{ top: 10, right: 35, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }} />
                  <YAxis
                    tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                    domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin - 2)), (dataMax: number) => Math.ceil(dataMax + 2)]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'IBM Plex Mono',
                    }}
                    formatter={(val) => (val ? [`ETB ${val}`, "This Week's Direct Price"] : ['Not entered yet', ''])}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 6, fill: 'var(--primary)' }}
                    activeDot={{ r: 8, fill: 'var(--primary)' }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 3. Bi-Monthly Historical Analysis Section — Scrollable & Responsive */}
        {selectedProduct && hasBiMonthlyData ? (
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Bi-Monthly Price Analysis — {selectedYear}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                  Historical price ranges starting from September–October through July–August.
                </CardDescription>
              </div>

              {/* Year Switcher Dropdown */}
              {availableYears.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-mono font-bold text-muted-foreground">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs sm:text-sm font-mono font-bold text-foreground focus:outline-none"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Range Chart - Horizontally Scrollable on Mobile to Prevent Squishing */}
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[620px]">
                  <p className="text-xs sm:text-sm font-mono font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                    Average Price Range (ETB {selectedYear})
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={biMonthlyChartData} margin={{ top: 10, right: 35, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="period" tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }} domain={['dataMin - 20', 'dataMax + 20']} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: 'IBM Plex Mono',
                        }}
                        formatter={(val: any, name: string) => [
                          `ETB ${val}`,
                          name === 'minPrice' ? 'Min Price' : name === 'maxPrice' ? 'Max Price' : 'Avg Price',
                        ]}
                      />
                      <Area type="monotone" dataKey="maxPrice" stroke="var(--primary)" fill="var(--primary-subtle)" fillOpacity={0.4} />
                      <Area type="monotone" dataKey="minPrice" stroke="var(--primary)" fill="#ffffff" fillOpacity={0.8} />
                      <Line type="monotone" dataKey="avgPrice" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Range Table - Horizontally Scrollable on Small Screens */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm font-mono border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Period</th>
                      <th className="py-3 px-3">Avg Price Range</th>
                      <th className="py-3 px-3">Weekly Increase Range</th>
                      <th className="py-3 px-3">Weekly Discount Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {biMonthlyForYear.map((bm) => (
                      <tr key={bm.period} className="hover:bg-surface-muted/50">
                        <td className="py-3.5 px-3 font-bold text-foreground">{bm.period}</td>
                        <td className="py-3.5 px-3 text-primary font-bold">
                          ETB {bm.average_price_etb.min} → ETB {bm.average_price_etb.max}
                        </td>
                        <td className="py-3.5 px-3 text-error font-bold">
                          ETB {bm.weekly_increase_etb.min} → ETB {bm.weekly_increase_etb.max}
                        </td>
                        <td className="py-3.5 px-3 text-success font-bold">
                          ETB {bm.weekly_discount_etb.min} → ETB {bm.weekly_discount_etb.max}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Clean Empty Notice if No Bi-Monthly Historical Data Exists */
          <div className="bg-surface-muted/60 border border-border rounded-xl p-6 text-center">
            <p className="text-xs sm:text-sm font-bold text-muted-foreground font-mono">
              There is no bi-monthly historical price data available for {selectedProduct?.name || 'this product'}.
            </p>
          </div>
        )}

        {/* 4. Capital Loss Analysis Dedicated Section (Moved to Bottom) */}
        <Card className="border-error/30 bg-error-bg/5 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                <h3 className="text-base sm:text-lg font-bold text-foreground">Capital Loss & Procurement Waste Analysis</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-medium">
                Discover how poor procurement timing and purchasing during market peaks leads to an estimated 
                <strong className="text-foreground font-bold"> ETB 33M+ in annual financial loss</strong> across 500 Ethiopian organizations.
              </p>
            </div>

            <Link to="/dashboard/company-loss-analysis" className="shrink-0">
              <Button size="sm" className="bg-error text-white hover:bg-error/90 text-xs sm:text-sm font-bold gap-2">
                View Capital Loss Breakdown
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
