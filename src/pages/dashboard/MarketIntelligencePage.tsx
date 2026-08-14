import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend,
} from 'recharts'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchMarketData,
  selectMarketProducts,
  selectMarketIntelligenceLoading,
  selectCapitalLossAnalysis,
} from '@/store/slices/marketIntelligenceSlice'

export function MarketIntelligencePage() {
  const dispatch = useAppDispatch()
  const productsFromRedux = useAppSelector(selectMarketProducts)
  const capitalLossFromRedux = useAppSelector(selectCapitalLossAnalysis)
  const loading = useAppSelector(selectMarketIntelligenceLoading)
  
  const [view, setView] = useState<'main' | 'weekly'>('main')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedWeeklyProduct, setSelectedWeeklyProduct] = useState<string>('')
  const [selectedYear] = useState<number>(2026)

  // Load market intelligence data on mount
  useEffect(() => {
    dispatch(fetchMarketData())
  }, [dispatch])

  // Set selected product when data loads
  useEffect(() => {
    if (productsFromRedux.length > 0 && !selectedProduct) {
      setSelectedProduct(productsFromRedux[0].name)
    }
  }, [productsFromRedux, selectedProduct])

  // Set selected weekly product when data loads
  useEffect(() => {
    if (productsFromRedux.length > 0 && !selectedWeeklyProduct) {
      setSelectedWeeklyProduct(productsFromRedux[0].name)
    }
  }, [productsFromRedux, selectedWeeklyProduct])

  // Show loading
  if (loading && productsFromRedux.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading market intelligence...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Get selected product data
  const selectedProductData = productsFromRedux.find(p => p.name === selectedProduct) || productsFromRedux[0]
  
  if (!selectedProductData) {
    return <DashboardLayout><div>No market data available</div></DashboardLayout>
  }

  // Prepare chart data with shaded bands from Redux
  const chartData = selectedProductData.bi_monthly_metrics.map((metric) => {
    const midpoint = (metric.average_price_etb.min + metric.average_price_etb.max) / 2
    const maxVolatility = midpoint + metric.weekly_increase_etb.max
    const minVolatility = midpoint - metric.weekly_discount_etb.max

    return {
      period: metric.period,
      midpoint,
      price_lower_bound: metric.average_price_etb.min,
      price_upper_bound: metric.average_price_etb.max,
      max_volatility: maxVolatility,
      min_volatility: minVolatility,
    }
  })

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Market Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Historical Merkato retailer pricing data, trends, and market analysis.
            </p>
          </div>
          <Link to="/dashboard/company-loss-analysis">
            <Button variant="outline" size="sm" className="text-xs text-error border-error/30 hover:bg-error-bg/20 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-error" />
              Capital Loss Analysis
            </Button>
          </Link>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === 'main' ? 'default' : 'outline'}
            onClick={() => setView('main')}
            className="text-xs"
          >
            4 Main Products Analysis
          </Button>
          <Button
            size="sm"
            variant={view === 'weekly' ? 'default' : 'outline'}
            onClick={() => setView('weekly')}
            className="text-xs"
          >
            All Products Weekly Prices
          </Button>
        </div>

        {/* Weekly Prices View for All Products */}
        {view === 'weekly' && (
          <>
            {/* Product Selector for Weekly View */}
            <div className="flex flex-wrap gap-2">
              {productsFromRedux.map((product) => (
                <Button
                  key={product.name}
                  size="sm"
                  variant={selectedWeeklyProduct === product.name ? 'default' : 'outline'}
                  onClick={() => setSelectedWeeklyProduct(product.name)}
                  className="text-xs"
                >
                  {product.name}
                </Button>
              ))}
            </div>

            {(() => {
              const weeklyProduct = productsFromRedux.find(p => p.name === selectedWeeklyProduct)
              if (!weeklyProduct?.weeklyHistory) return null
              
              const week1Price = weeklyProduct.weeklyHistory[0]?.price
              const week2Price = weeklyProduct.weeklyHistory[1]?.price
              const priceChange = week1Price && week2Price ? week2Price - week1Price : 0
              const priceChangePercent = week1Price && week2Price ? ((priceChange / week1Price) * 100).toFixed(1) : '0.0'
              
              return (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">{weeklyProduct.name} — August 2026 Weekly Prices</CardTitle>
                    <CardDescription>
                      Current month platform direct prices (Week 2 of August - most recent data)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Price */}
                    <div className="bg-surface-muted border border-border rounded-lg p-6 text-center">
                      <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
                        {weeklyProduct.name} — Platform Direct Price (Week 2)
                      </p>
                      <p className="text-4xl font-bold text-primary font-mono">
                        ETB {weeklyProduct.current_pricing.merkatoRetailerPrice}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">per {weeklyProduct.unit}</p>
                      <div className="mt-2">
                        <span className={`text-sm font-semibold ${priceChange >= 0 ? 'text-error' : 'text-success'}`}>
                          {priceChange >= 0 ? '↑' : '↓'} ETB {Math.abs(priceChange)} ({priceChangePercent}%)
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">vs Week 1</span>
                      </div>
                    </div>

                    {/* Weekly Chart */}
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">
                        August 2026 Weekly Price Trend (4 weeks)
                      </p>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={weeklyProduct.weeklyHistory}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis
                            dataKey="week"
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                            domain={['dataMin - 10', 'dataMax + 10']}
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'var(--card)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontFamily: 'IBM Plex Mono',
                            }}
                            formatter={(val) => val ? [`ETB ${val}`, 'Platform Price'] : ['No data yet', '']}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="var(--primary)"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: 'var(--primary)' }}
                            activeDot={{ r: 6 }}
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Info Note */}
                    <div className="bg-info-bg border border-info/20 rounded-md p-3 text-xs text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-info inline mr-2" />
                      <strong className="text-foreground">Note:</strong> Currently showing Week 1-2 data (latest available). 
                      Week 3 and Week 4 prices will be added by admin as the month progresses. 
                      For historical analysis with 2-year data and loss calculations, select the "4 Main Products Analysis" view above.
                    </div>
                  </CardContent>
                </Card>
              )
            })()}
          </>
        )}

        {/* Main 4 Products Analysis View */}
        {view === 'main' && (
          <>
            {/* Product Selector */}
            <div className="flex flex-wrap gap-2">
              {productsFromRedux.map((product) => (
                <Button
                  key={product.name}
                  size="sm"
                  variant={selectedProduct === product.name ? 'default' : 'outline'}
                  onClick={() => setSelectedProduct(product.name)}
                  className="text-xs"
                >
                  {product.name}
                </Button>
              ))}
            </div>

        {/* Section 1: Current Week Platform Direct Price */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Current Week Platform Direct Price</CardTitle>
            <CardDescription>
              Latest direct purchase pricing from our platform — This week (August 2026)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Price Display */}
            <div className="bg-surface-muted border border-border rounded-lg p-6 text-center">
              <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
                {selectedProduct} — Platform Direct Price
              </p>
              <p className="text-4xl font-bold text-primary font-mono">
                ETB {selectedProductData.current_pricing.merkatoRetailerPrice}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per unit</p>
            </div>

            {/* Weekly Trend Chart */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                August 2026 Weekly Trend (4 weeks, Platform Direct Prices)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={selectedProductData.weeklyHistory || []}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'IBM Plex Mono',
                    }}
                    formatter={(val) => val ? [`ETB ${val}`, 'Platform Price'] : ['No data yet', '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--primary)' }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Week 3 and Week 4 data will be added by admin as they become available (currently Week 2)
              </p>
            </div>

            <div className="bg-info-bg border border-info/20 rounded-md p-3 text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 text-info inline mr-2" />
              <strong className="text-foreground">Note:</strong> These prices represent our platform's direct purchase pricing. 
              Final Basket Prices are typically even lower and shown on completed orders.
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Multi-Year Analysis */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base">Bi-Monthly Price Analysis — {selectedYear}</CardTitle>
                <CardDescription>
                  Historical Merkato retailer price ranges and volatility patterns
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs" disabled>
                  {selectedYear}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bi-Monthly Chart with Shaded Error Bands */}
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    {/* Extreme volatility band gradient */}
                    <linearGradient id="volatilityBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--error)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--error)" stopOpacity={0.05} />
                    </linearGradient>
                    {/* Normal price range gradient */}
                    <linearGradient id="priceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'IBM Plex Mono',
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-md p-3 space-y-1">
                            <p className="font-semibold text-foreground">{data.period}</p>
                            <p className="text-xs">
                              <span className="text-muted-foreground">Midpoint:</span>{' '}
                              <span className="font-bold text-primary">ETB {data.midpoint.toFixed(0)}</span>
                            </p>
                            <p className="text-xs">
                              <span className="text-muted-foreground">Normal Range:</span>{' '}
                              <span className="font-semibold">ETB {data.price_lower_bound} - {data.price_upper_bound}</span>
                            </p>
                            <p className="text-xs">
                              <span className="text-muted-foreground">Max Volatility:</span>{' '}
                              <span className="font-semibold text-error">ETB {data.max_volatility.toFixed(0)}</span>
                            </p>
                            <p className="text-xs">
                              <span className="text-muted-foreground">Min Volatility:</span>{' '}
                              <span className="font-semibold text-success">ETB {data.min_volatility.toFixed(0)}</span>
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value: string) => {
                      if (value === 'max_volatility') return 'Extreme Volatility Band'
                      if (value === 'price_upper_bound') return 'Normal Price Range'
                      if (value === 'midpoint') return 'Average Trend'
                      return value
                    }}
                  />
                  
                  {/* Extreme volatility band (lightest) */}
                  <Area
                    type="monotone"
                    dataKey="max_volatility"
                    stackId="1"
                    stroke="none"
                    fill="url(#volatilityBand)"
                  />
                  <Area
                    type="monotone"
                    dataKey="min_volatility"
                    stackId="2"
                    stroke="none"
                    fill="url(#volatilityBand)"
                  />
                  
                  {/* Normal price range (darker) */}
                  <Area
                    type="monotone"
                    dataKey="price_upper_bound"
                    stroke="var(--primary)"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    fill="url(#priceBand)"
                    fillOpacity={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="price_lower_bound"
                    stroke="var(--primary)"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    fill="var(--card)"
                  />
                  
                  {/* Midpoint trend line */}
                  <Line
                    type="monotone"
                    dataKey="midpoint"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--primary)' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Explanation */}
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-surface-muted border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <p className="font-semibold text-foreground">Average Trend</p>
                </div>
                <p className="text-muted-foreground">Midpoint of bi-monthly price range</p>
              </div>
              <div className="bg-surface-muted border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded bg-primary opacity-30"></div>
                  <p className="font-semibold text-foreground">Normal Range</p>
                </div>
                <p className="text-muted-foreground">Expected price band (min-max)</p>
              </div>
              <div className="bg-surface-muted border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded bg-error opacity-10"></div>
                  <p className="font-semibold text-foreground">Volatility Band</p>
                </div>
                <p className="text-muted-foreground">Worst-case price spikes/drops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capital Loss Analysis Callout */}
        <Card className="border-error/30 bg-error-bg/10">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                <h3 className="font-semibold text-foreground">500 Companies Capital Loss Analysis</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Discover how Ethiopian organizations lose an estimated ETB {((capitalLossFromRedux?.totalCapitalWasted || 33000000) / 1000000).toFixed(0)}M annually due to poor procurement timing and price volatility.
              </p>
            </div>
            <Link to="/dashboard/company-loss-analysis" className="shrink-0">
              <Button size="sm" className="bg-error text-white hover:bg-error/90 text-xs flex items-center gap-1.5">
                View Loss Analysis
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
