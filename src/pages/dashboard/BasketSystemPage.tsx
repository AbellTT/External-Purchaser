import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, Truck, TrendingDown, ChevronRight, Plus, ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const BASKETS = [
  {
    id: 'bsk-w-082',
    type: 'Weekly',
    status: 'Open',
    product: 'Sinar Line A4 Paper',
    unit: 'ream',
    closesIn: '2 days',
    participants: 9,
    pooledQty: 6800,
    minQty: 10000,
    platformPrice: 820,
    marketPrice: 985,
    milestones: [
      { qty: 5000,  discount: '10%', label: 'Tier 1', reached: true },
      { qty: 8000,  discount: '15%', label: 'Tier 2', reached: false },
      { qty: 12000, discount: '20%', label: 'Tier 3', reached: false },
    ],
    truckPct: 68,
    myQty: 120,
  },
  {
    id: 'bsk-m-082',
    type: 'Monthly',
    status: 'Open',
    product: 'Box File Kent',
    unit: 'piece',
    closesIn: '11 days',
    participants: 6,
    pooledQty: 1350,
    minQty: 3000,
    platformPrice: 118,
    marketPrice: 145,
    milestones: [
      { qty: 1000,  discount: '10%', label: 'Tier 1', reached: true },
      { qty: 2000,  discount: '15%', label: 'Tier 2', reached: false },
      { qty: 3500,  discount: '20%', label: 'Tier 3', reached: false },
    ],
    truckPct: 45,
    myQty: 80,
  },
  {
    id: 'bsk-6m-082',
    type: '6-Month',
    status: 'Open',
    product: '05A HP Toner Ink',
    unit: 'cartridge',
    closesIn: '23 days',
    participants: 4,
    pooledQty: 240,
    minQty: 500,
    platformPrice: 2050,
    marketPrice: 2450,
    milestones: [
      { qty: 200,  discount: '10%', label: 'Tier 1', reached: true },
      { qty: 400,  discount: '16%', label: 'Tier 2', reached: false },
      { qty: 600,  discount: '22%', label: 'Tier 3', reached: false },
    ],
    truckPct: 48,
    myQty: 0,
  },
]

const ORGS_SAMPLE = [
  'Addis Ababa University', 'Ministry of Education', 'Bekele Molla School',
  'Ethiopian Red Cross', 'Commercial Bank HQ', 'St. Paul Hospital',
  'Entoto TVET College', 'City Admin Office', 'Biruh Tesfa NGO',
]

export function BasketSystemPage() {
  const [joining, setJoining] = useState<string | null>(null)
  const [qtyInput, setQtyInput] = useState<Record<string, string>>({})

  const handleJoin = (id: string) => {
    setJoining(joining === id ? null : id)
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              Basket System
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pool your orders with other organizations for maximum wholesale savings.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/dashboard/orders">
              View Completed Baskets <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Basket Cards */}
        <div className="space-y-5">
          {BASKETS.map((b) => {
            const fillPct = Math.round((b.pooledQty / b.minQty) * 100)
            const savings = Math.round(((b.marketPrice - b.platformPrice) / b.marketPrice) * 100)
            const nextMilestone = b.milestones.find((m) => !m.reached)
            const remaining = nextMilestone ? nextMilestone.qty - b.pooledQty : 0
            const isJoining = joining === b.id
            const joined = b.myQty > 0

            return (
              <Card key={b.id} className={`border-border ${joined ? 'ring-1 ring-primary/20' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${
                        b.type === 'Weekly' ? 'border-info text-info' :
                        b.type === 'Monthly' ? 'border-primary text-primary' :
                        'border-accent text-accent'
                      }`}>{b.type} Basket</Badge>
                      {joined && <Badge className="text-[10px] bg-success-bg text-success border-0">You joined · {b.myQty} {b.unit}s</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      Closes in {b.closesIn}
                    </div>
                  </div>
                  <CardTitle className="text-base">{b.product}</CardTitle>
                  <CardDescription className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.participants} organizations</span>
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {b.truckPct}% truck capacity</span>
                    <span className="flex items-center gap-1 text-success font-semibold"><TrendingDown className="w-3.5 h-3.5" /> {savings}% vs market</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">{b.pooledQty.toLocaleString()} {b.unit}s pooled</span>
                      <span className="text-foreground font-semibold">{b.minQty.toLocaleString()} target</span>
                    </div>
                    <div className="relative h-3 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      />
                      {/* Milestone markers */}
                      {b.milestones.map((m) => {
                        const pct = (m.qty / b.minQty) * 100
                        if (pct > 100) return null
                        return (
                          <div
                            key={m.label}
                            className="absolute top-0 bottom-0 w-0.5 bg-card/60"
                            style={{ left: `${pct}%` }}
                          />
                        )
                      })}
                    </div>
                    {nextMilestone && remaining > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-accent">{remaining.toLocaleString()} more {b.unit}s</span> needed to unlock {nextMilestone.label} ({nextMilestone.discount} discount)
                      </p>
                    )}
                  </div>

                  {/* Milestones */}
                  <div className="grid grid-cols-3 gap-2">
                    {b.milestones.map((m) => (
                      <div key={m.label} className={`rounded-md border p-2.5 text-center text-xs ${
                        m.reached ? 'bg-success-bg border-success/30 text-success' : 'bg-surface-muted border-border text-muted-foreground'
                      }`}>
                        <p className="font-bold">{m.discount}</p>
                        <p className="font-mono text-[10px] mt-0.5">{m.qty.toLocaleString()} {b.unit}s</p>
                        <p className="font-semibold text-[10px] mt-0.5">{m.reached ? '✓ Unlocked' : m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Price summary */}
                  <div className="flex flex-wrap gap-4 p-3 bg-surface-muted rounded-md border border-border text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">Platform price</p>
                      <p className="font-bold text-primary font-mono">ETB {b.platformPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">Market price</p>
                      <p className="font-semibold text-muted-foreground line-through font-mono">ETB {b.marketPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">You save</p>
                      <p className="font-bold text-success font-mono">ETB {b.marketPrice - b.platformPrice} ({savings}%)</p>
                    </div>
                  </div>

                  {/* Participants preview */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Participating organizations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ORGS_SAMPLE.slice(0, b.participants).map((org) => (
                        <span key={org} className="text-[11px] bg-surface-muted border border-border rounded px-2 py-0.5 text-foreground">{org}</span>
                      ))}
                    </div>
                  </div>

                  {/* Join action */}
                  {isJoining ? (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1">
                        <input
                          type="number"
                          min={1}
                          placeholder={`Quantity (${b.unit}s)`}
                          value={qtyInput[b.id] || ''}
                          onChange={(e) => setQtyInput((prev) => ({ ...prev, [b.id]: e.target.value }))}
                          className="w-full h-9 px-3 text-sm border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                        />
                      </div>
                      <Button size="sm" onClick={() => setJoining(null)} className="gap-1.5 h-9">
                        <Package className="w-3.5 h-3.5" />Commit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setJoining(null)} className="h-9">Cancel</Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleJoin(b.id)}
                      variant={joined ? 'outline' : 'default'}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {joined ? 'Increase My Quantity' : 'Join This Basket'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
