import { AlertTriangle, TrendingDown, DollarSign, Building2, Package, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// Aggregate loss data by product (no individual company details)
const PRODUCT_LOSS_DATA = [
  {
    product: 'A4 Paper',
    avgLossPerCompany: 45200,
    totalLoss500Companies: 22600000,
    lossPercentOfProcurement: 18.5,
  },
  {
    product: 'HP Toner',
    avgLossPerCompany: 68400,
    totalLoss500Companies: 34200000,
    lossPercentOfProcurement: 22.3,
  },
  {
    product: 'Box File',
    avgLossPerCompany: 18900,
    totalLoss500Companies: 9450000,
    lossPercentOfProcurement: 15.2,
  },
  {
    product: 'Marker',
    avgLossPerCompany: 31200,
    totalLoss500Companies: 15600000,
    lossPercentOfProcurement: 19.8,
  },
]

const TOTAL_LOSS = PRODUCT_LOSS_DATA.reduce((sum, item) => sum + item.totalLoss500Companies, 0)
const AVG_LOSS_PER_COMPANY = TOTAL_LOSS / 500

// Chart data
const chartData = PRODUCT_LOSS_DATA.map(item => ({
  product: item.product,
  avgLoss: Math.round(item.avgLossPerCompany / 1000), // Convert to thousands for readability
  totalLoss: Math.round(item.totalLoss500Companies / 1000000), // Convert to millions
}))

export function CompanyLossAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-error" />
            Capital Loss Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Understanding the financial impact of poor procurement timing and price volatility across 500 organizations
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
              <p className="text-3xl font-bold text-error font-mono">ETB {(TOTAL_LOSS / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground mt-1">annually across 500 organizations</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wide">Organizations Analyzed</p>
              <p className="text-3xl font-bold text-foreground font-mono">500</p>
              <p className="text-xs text-muted-foreground mt-1">nationwide sample</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wide">Avg. Loss Per Organization</p>
              <p className="text-3xl font-bold text-foreground font-mono">ETB {(AVG_LOSS_PER_COMPANY / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-1">annually per organization</p>
            </CardContent>
          </Card>
        </div>

        {/* Product-Level Loss Breakdown */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Loss by Product Category</CardTitle>
            <CardDescription>
              Annual capital losses aggregated across 500 organizations, broken down by stationery product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bar Chart - Average Loss Per Company */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Average Loss Per Company (ETB Thousands)</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="product"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                    label={{ value: 'ETB (Thousands)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--muted-foreground)' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'IBM Plex Mono',
                    }}
                    formatter={(val) => [`ETB ${val}K`, 'Avg Loss']}
                  />
                  <Bar dataKey="avgLoss" fill="var(--error)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Total Loss 500 Companies */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Total Loss Across 500 Companies (ETB Millions)</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="product"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
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
                  <Bar dataKey="totalLoss" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-semibold text-foreground">Product</th>
                    <th className="text-right py-3 px-2 font-semibold text-foreground">Avg Loss/Company</th>
                    <th className="text-right py-3 px-2 font-semibold text-foreground">Total Loss (500)</th>
                    <th className="text-right py-3 px-2 font-semibold text-foreground">% of Procurement</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCT_LOSS_DATA.map((item) => (
                    <tr key={item.product} className="border-b border-border hover:bg-surface-muted/50">
                      <td className="py-3 px-2 font-medium text-foreground">{item.product}</td>
                      <td className="py-3 px-2 text-right font-mono text-error">ETB {item.avgLossPerCompany.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right font-mono text-foreground font-semibold">
                        ETB {(item.totalLoss500Companies / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-muted-foreground">{item.lossPercentOfProcurement}%</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-surface-muted/50">
                    <td className="py-3 px-2 font-bold text-foreground">TOTAL</td>
                    <td className="py-3 px-2 text-right font-mono text-error font-bold">ETB {AVG_LOSS_PER_COMPANY.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 px-2 text-right font-mono text-foreground font-bold">
                      ETB {(TOTAL_LOSS / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-muted-foreground">—</td>
                  </tr>
                </tbody>
              </table>
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
