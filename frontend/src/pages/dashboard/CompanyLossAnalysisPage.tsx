import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingDown, DollarSign, Building2, Package, Calendar, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchMarketIntelligence,
  selectCapitalLossAnalysis,
  selectMarketIntelligenceLoading,
} from '@/store/slices/marketIntelligenceSlice'
import { useOrgWebSocket } from '@/lib/useOrgWebSocket'

export function CompanyLossAnalysisPage() {
  useOrgWebSocket()
  const dispatch = useAppDispatch()
  const capitalLossAnalysis = useAppSelector(selectCapitalLossAnalysis)
  const loading = useAppSelector(selectMarketIntelligenceLoading)

  useEffect(() => {
    dispatch(fetchMarketIntelligence())
  }, [dispatch])

  // Fallback defaults if state is initializing
  const totalLoss = capitalLossAnalysis?.totalCapitalWasted ?? 33000000
  const organizationsCount = capitalLossAnalysis?.organizationsAnalyzed ?? 500
  const avgLossPerCompany = capitalLossAnalysis?.avgLossPerCompany ?? (totalLoss / organizationsCount)
  
  const lossBreakdown = capitalLossAnalysis?.lossBreakdown ?? [
    { product: 'Siner Line A4 Paper', lossAmount: 10000000 },
    { product: 'OSA HP Toner', lossAmount: 15000000 },
    { product: 'Box File KENT', lossAmount: 5000000 },
    { product: 'Marker', lossAmount: 3000000 },
  ]

  const chartData = lossBreakdown.map((item) => ({
    product: item.product,
    totalLoss: Math.round(item.lossAmount / 1000000), // Convert to millions for chart readability
  }))

  if (loading && !capitalLossAnalysis) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading capital loss analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            to="/dashboard/market-intelligence"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Market Intelligence
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-error" />
            Capital Loss Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Understanding the financial impact of poor procurement timing and price volatility across {organizationsCount} organizations
          </p>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-error/30 bg-error-bg/10">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-error-bg text-error flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wide">Total Capital Wasted</p>
              <p className="text-3xl font-bold text-error font-mono">ETB {(totalLoss / 1000000).toFixed(0)}M</p>
              <p className="text-xs text-muted-foreground mt-1">annually across {organizationsCount} organizations</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wide">Organizations Analyzed</p>
              <p className="text-3xl font-bold text-foreground font-mono">{organizationsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">nationwide sample</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wide">Avg. Loss Per Organization</p>
              <p className="text-3xl font-bold text-foreground font-mono">ETB {(avgLossPerCompany / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-1">annually per organization</p>
            </CardContent>
          </Card>
        </div>

        {/* Product-Level Loss Breakdown */}
        <Card className="border-border border-error/30 bg-error-bg/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error" />
              {organizationsCount} Companies Capital Loss Analysis
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
                  <p className="text-[10px] text-muted-foreground mt-0.5">annually across {organizationsCount} organizations</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-2">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">Organizations Analyzed</p>
                  <p className="text-2xl font-bold text-foreground font-mono">{organizationsCount}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">companies nationwide</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-2">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">Avg. Loss Per Company</p>
                  <p className="text-2xl font-bold text-foreground font-mono">ETB {(avgLossPerCompany / 1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">annually per organization</p>
                </CardContent>
              </Card>
            </div>

            {/* Product Loss Bar Chart */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Capital Lost by Product Category</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                  <Bar dataKey="totalLoss" fill="var(--error)" radius={[6, 6, 0, 0]} />
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
          </CardContent>
        </Card>

        {/* Why Organizations Lose Money */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Why Organizations Waste Capital on Stationery</CardTitle>
            <CardDescription>Common procurement inefficiencies that lead to financial losses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-surface-muted border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error-bg text-error flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Poor Timing</p>
                    <p className="text-xs text-muted-foreground">
                      Purchasing during seasonal price spikes (September-October) instead of optimal low-price periods. 
                      Lack of planning and forecasting leads to emergency purchases at premium prices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-muted border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error-bg text-error flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Small Order Quantities</p>
                    <p className="text-xs text-muted-foreground">
                      Organizations purchase individually in small quantities, missing out on volume discounts. 
                      Failing to pool demand with other organizations results in paying retail prices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-muted border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error-bg text-error flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Price Volatility</p>
                    <p className="text-xs text-muted-foreground">
                      Unpredictable weekly price swings of 5-20% in the Merkato retail market make it difficult to budget. 
                      Organizations lack visibility into price trends and optimal purchase windows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-muted border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error-bg text-error flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Lack of Market Intelligence</p>
                    <p className="text-xs text-muted-foreground">
                      No access to historical pricing data or market trends to inform procurement decisions. 
                      Procurement officers operate blindly without benchmark data on fair pricing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Platform Helps */}
        <Card className="border-primary/30 bg-primary-subtle/20">
          <CardHeader>
            <CardTitle className="text-base text-primary">How This Platform Reduces Your Losses</CardTitle>
            <CardDescription>Data-driven procurement strategies to minimize capital waste</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-foreground">Basket System for Volume Discounts</p>
                  <p className="text-xs text-muted-foreground">
                    Pool your orders with other organizations to unlock wholesale supplier pricing typically reserved for large retailers.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-foreground">Market Intelligence & Price Trends</p>
                  <p className="text-xs text-muted-foreground">
                    Access 2+ years of historical pricing data and weekly trends to time your purchases during low-price windows.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="font-semibold text-foreground">Direct Purchase Option</p>
                  <p className="text-xs text-muted-foreground">
                    Bypass Merkato retail markup with platform-negotiated direct pricing when you need items immediately.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">4</div>
                <div>
                  <p className="font-semibold text-foreground">Procurement Calendar & Planning</p>
                  <p className="text-xs text-muted-foreground">
                    Plan purchases around optimal timing windows and seasonal trends, avoiding emergency purchases at peak prices.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
