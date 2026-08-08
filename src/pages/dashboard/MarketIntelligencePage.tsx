import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, AlertCircle, Building2, DollarSign, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
  BarChart, Bar, Legend,
} from 'recharts'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import biMonthlyData from '@/data/MI/bi-monthly_data.json'
import lossAnalysisData from '@/data/MI/500_companies_badSalesAndLoss.json'

// Current week prices (Merkato Retailer prices - August 2026, Week 2)
const CURRENT_WEEK_PRICES = {
  'Siner Line A4 Paper': 675,
  'OSA HP Toner': 865,
  'Box File KENT': 163,
  'Marker': 280,
}

// All products with weekly price history for August 2026 (4 weeks total, only first 2 weeks have data)
// Weeks 3 and 4 are empty - will be filled by super admin as they become available
const ALL_PRODUCTS_WEEKLY = [
  {
    name: 'Siner Line A4 Paper',
    unit: 'ream',
    currentPrice: 675, // Week 2 price
    category: 'Paper Products',
    weeklyHistory: [
      { week: 'Aug W1', price: 670 },
      { week: 'Aug W2', price: 675 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
  {
    name: 'OSA HP Toner',
    unit: 'cartridge',
    currentPrice: 865, // Week 2 price
    category: 'Printer Supplies',
    weeklyHistory: [
      { week: 'Aug W1', price: 860 },
      { week: 'Aug W2', price: 865 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
  {
    name: 'Box File KENT',
    unit: 'piece',
    currentPrice: 163, // Week 2 price
    category: 'Filing & Storage',
    weeklyHistory: [
      { week: 'Aug W1', price: 162 },
      { week: 'Aug W2', price: 163 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
  {
    name: 'Marker',
    unit: 'piece',
    currentPrice: 280, // Week 2 price
    category: 'Writing Instruments',
    weeklyHistory: [
      { week: 'Aug W1', price: 278 },
      { week: 'Aug W2', price: 280 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
  {
    name: 'Ballpoint Pen',
    unit: 'box',
    currentPrice: 215, // Week 2 price
    category: 'Writing Instruments',
    weeklyHistory: [
      { week: 'Aug W1', price: 212 },
      { week: 'Aug W2', price: 215 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
  {
    name: 'Notebook',
    unit: 'piece',
    currentPrice: 73, // Week 2 price
    category: 'Books & Notebooks',
    weeklyHistory: [
      { week: 'Aug W1', price: 72 },
      { week: 'Aug W2', price: 73 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
  {
    name: 'Ledger Book',
    unit: 'piece',
    currentPrice: 390, // Week 2 price
    category: 'Books & Notebooks',
    weeklyHistory: [
      { week: 'Aug W1', price: 385 },
      { week: 'Aug W2', price: 390 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
  {
    name: 'Stapler',
    unit: 'piece',
    currentPrice: 640, // Week 2 price
    category: 'Office Equipment',
    weeklyHistory: [
      { week: 'Aug W1', price: 635 },
      { week: 'Aug W2', price: 640 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ]
  },
]

// Weekly historical trend (4 weeks of August 2026, only first 2 have data - Merkato Retailer prices) for 4 main products
const WEEKLY_TRENDS: Record<string, Array<{week: string, price: number | null}>> = {
  'Siner Line A4 Paper': ALL_PRODUCTS_WEEKLY.find(p => p.name === 'Siner Line A4 Paper')!.weeklyHistory,
  'OSA HP Toner': ALL_PRODUCTS_WEEKLY.find(p => p.name === 'OSA HP Toner')!.weeklyHistory,
  'Box File KENT': ALL_PRODUCTS_WEEKLY.find(p => p.name === 'Box File KENT')!.weeklyHistory,
  'Marker': ALL_PRODUCTS_WEEKLY.find(p => p.name === 'Marker')!.weeklyHistory,
}

export function MarketIntelligencePage() {
  const [view, setView] = useState<'main' | 'weekly'>('main') // Toggle between main 4 products and all products weekly view
  const [selectedProduct, setSelectedProduct] = useState<string>(biMonthlyData.market_data[0].product)
  const [selectedWeeklyProduct, setSelectedWeeklyProduct] = useState<string>(ALL_PRODUCTS_WEEKLY[0].name)
  const [selectedYear] = useState<number>(2026) // Only 2026 data available currently

  const productData = biMonthlyData.market_data.find(p => p.product === selectedProduct)!

  // Prepare chart data with shaded bands
  const chartData = productData.bi_monthly_metrics.map((metric) => {
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

  // Total loss across all products
  const totalLoss = lossAnalysisData.financial_loss_analysis.reduce(
    (sum, item) => sum + item.estimated_annual_loss_etb.aggregate_500_companies_loss,
    0
  )

  // Prepare bar chart data for product losses
  const productLossData = lossAnalysisData.financial_loss_analysis.map(item => ({
    product: item.product.replace('Siner Line ', '').replace('OSA ', '').replace('Box File ', ''),
    loss: item.estimated_annual_loss_etb.aggregate_500_companies_loss / 1000000, // Convert to millions
  }))

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Market Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Historical Merkato retailer pricing data, trends, and market analysis.
          </p>
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
              {ALL_PRODUCTS_WEEKLY.map((product) => (
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
              const weeklyProduct = ALL_PRODUCTS_WEEKLY.find(p => p.name === selectedWeeklyProduct)!
              const week1Price = weeklyProduct.weeklyHistory[0].price
              const week2Price = weeklyProduct.weeklyHistory[1].price
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
                        ETB {weeklyProduct.currentPrice}
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
              {biMonthlyData.market_data.map((product) => (
                <Button
                  key={product.product}
                  size="sm"
                  variant={selectedProduct === product.product ? 'default' : 'outline'}
                  onClick={() => setSelectedProduct(product.product)}
                  className="text-xs"
                >
                  {product.product}
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
                ETB {CURRENT_WEEK_PRICES[selectedProduct as keyof typeof CURRENT_WEEK_PRICES]}
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
                  data={WEEKLY_TRENDS[selectedProduct as keyof typeof WEEKLY_TRENDS]}
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
                    formatter={(value) => {
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

        {/* Section 3: 500 Companies Loss Analysis */}
        <Card className="border-border border-error/30 bg-error-bg/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error" />
              500 Companies Capital Loss Analysis
            </CardTitle>
            <CardDescription>
              Annual financial losses due to poor procurement timing and price volatility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* KPI Cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Card className="border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-error-bg text-error flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">Total Capital Wasted</p>
                  <p className="text-2xl font-bold text-error font-mono">ETB {(totalLoss / 1000000).toFixed(0)}M</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">annually across 500 organizations</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-2">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">Organizations Analyzed</p>
                  <p className="text-2xl font-bold text-foreground font-mono">500</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">companies nationwide</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-2">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">Avg. Loss Per Company</p>
                  <p className="text-2xl font-bold text-foreground font-mono">ETB {(totalLoss / 500 / 1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">annually per organization</p>
                </CardContent>
              </Card>
            </div>

            {/* Product Loss Bar Chart */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Capital Lost by Product Category</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={productLossData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="product"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                    label={{ value: 'ETB (Millions)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--muted-foreground)' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'IBM Plex Mono',
                    }}
                    formatter={(val) => [`ETB ${val}M`, 'Total Loss']}
                  />
                  <Bar dataKey="loss" fill="var(--error)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation */}
            <div className="bg-card border border-border rounded-md p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground uppercase tracking-wide">Why Organizations Lose Money</p>
              <ul className="space-y-1.5">
                <li>• <strong className="text-foreground">Poor timing:</strong> Purchasing during seasonal price spikes (Sept-Oct) instead of optimal periods</li>
                <li>• <strong className="text-foreground">Small quantities:</strong> Missing volume discounts by ordering individually instead of pooling demand</li>
                <li>• <strong className="text-foreground">Price volatility:</strong> Unpredictable weekly price swings of 5-20% in Merkato retail market</li>
                <li>• <strong className="text-foreground">Lack of intelligence:</strong> No access to historical pricing data to inform procurement decisions</li>
              </ul>
            </div>

            {/* View Detailed Analysis Button */}
            <div className="flex justify-center pt-2">
              <Button
                asChild
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Link to="/dashboard/company-loss-analysis">
                  <AlertTriangle className="w-4 h-4" />
                  View Detailed Loss Analysis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
