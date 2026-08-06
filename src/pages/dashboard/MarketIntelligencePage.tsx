import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import marketData from '@/data/marketData.json'

type Item = typeof marketData[0]

const MONTHS_COUNT = 14

function findPeak(data: Item['data']) {
  return data.reduce((a, b) => (a.market > b.market ? a : b))
}
function findLowest(data: Item['data']) {
  return data.reduce((a, b) => (a.market < b.market ? a : b))
}

export function MarketIntelligencePage() {
  const [selectedId, setSelectedId] = useState(marketData[0].id)
  const item = marketData.find((i) => i.id === selectedId)!
  const peak = findPeak(item.data)
  const low = findLowest(item.data)
  const totalMarket = item.data.reduce((s, d) => s + d.market, 0)
  const totalPlatform = item.data.reduce((s, d) => s + d.platform, 0)
  const totalLoss = totalMarket - totalPlatform
  const avgMonthlyLoss = Math.round(totalLoss / MONTHS_COUNT)
  const savingsPct = Math.round((totalLoss / totalMarket) * 100)

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
            2-year Merkato price history vs platform pricing for key stationery items.
          </p>
        </div>

        {/* Product Selector */}
        <div className="flex flex-wrap gap-2">
          {marketData.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={selectedId === item.id ? 'default' : 'outline'}
              onClick={() => setSelectedId(item.id)}
              className="text-xs"
            >
              {item.name}
            </Button>
          ))}
        </div>

        {/* Stat Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Current Market', value: `ETB ${item.currentMarketPrice}`, sub: `per ${item.unit}`, color: 'text-error' },
            { label: 'Platform Price', value: `ETB ${item.platformPrice}`, sub: 'your price', color: 'text-primary' },
            { label: 'Peak Price', value: `ETB ${peak.market}`, sub: peak.month, color: 'text-accent' },
            { label: 'Lowest Price', value: `ETB ${low.market}`, sub: low.month, color: 'text-success' },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4">
                <p className="text-xs font-mono text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">{item.name} — Price History (Last 14 Months)</CardTitle>
            <CardDescription>Merkato market price vs External Purchaser platform price (ETB per {item.unit})</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={item.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono' }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'IBM Plex Mono',
                  }}
                  formatter={(val, name) => [`ETB ${val}`, name === 'market' ? 'Market Price' : 'Platform Price']}
                />
                <Legend
                  formatter={(v) => v === 'market' ? 'Merkato Market Price' : 'Platform Price'}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="market"
                  stroke="var(--error)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="platform"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loss Analysis */}
        <Card className="border-border border-warning/30 bg-warning-bg/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Cost-of-Inaction Analysis
            </CardTitle>
            <CardDescription>
              How much your organization would overspend by purchasing at Merkato market price instead of the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-xs font-mono text-muted-foreground">Avg. Monthly Overspend</p>
                <p className="text-2xl font-bold text-error font-mono mt-1">ETB {avgMonthlyLoss.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">per {item.unit} purchased</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-xs font-mono text-muted-foreground">14-Month Total Loss</p>
                <p className="text-2xl font-bold text-error font-mono mt-1">ETB {totalLoss.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">vs platform pricing</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-xs font-mono text-muted-foreground">Platform Savings Rate</p>
                <p className="text-2xl font-bold text-success font-mono mt-1">{savingsPct}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">average discount</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-md p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground text-xs font-mono uppercase tracking-wide">Seasonal Insights</p>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-error mt-0.5 shrink-0" />
                  <span>Prices historically peak in <strong>September–October</strong> due to school-year demand. Plan bulk purchases in July–August.</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                  <span>Lowest prices recorded in <strong>November</strong> after back-to-school demand normalizes. Ideal for 6-month basket planning.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <span>This month's basket price is <strong>{Math.round(((item.currentMarketPrice - item.platformPrice) / item.currentMarketPrice) * 100)}% below the market rate</strong> — an above-average savings window.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
