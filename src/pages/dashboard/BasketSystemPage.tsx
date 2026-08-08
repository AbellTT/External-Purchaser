import { useState } from 'react'
import { Clock, Users, Truck, Plus, ShoppingCart, Package, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const ACTIVE_BASKETS = [
  {
    id: 'bsk-w-082',
    type: 'Weekly',
    status: 'Open',
    product: 'A4 Paper',
    category: 'Paper Products',
    unit: 'ream',
    closesIn: '2 days',
    openedDate: '2026-07-30',
    participants: 9,
    pooledQty: 6800,
    minQty: 10000,
    truckPct: 68,
    myQty: 120,
  },
  {
    id: 'bsk-m-082',
    type: 'Monthly',
    status: 'Open',
    product: 'Box File',
    category: 'Filing & Storage',
    unit: 'piece',
    closesIn: '11 days',
    openedDate: '2026-07-25',
    participants: 6,
    pooledQty: 1350,
    minQty: 3000,
    truckPct: 45,
    myQty: 80,
  },
  {
    id: 'bsk-6m-082',
    type: '6-Month',
    status: 'Open',
    product: 'Printer Toner',
    category: 'Printer Supplies',
    unit: 'cartridge',
    closesIn: '23 days',
    openedDate: '2026-07-20',
    participants: 4,
    pooledQty: 240,
    minQty: 500,
    truckPct: 48,
    myQty: 0,
  },
]

const COMPLETED_BASKETS = [
  {
    id: 'bsk-w-075',
    type: 'Weekly',
    status: 'Completed',
    product: 'A4 Paper',
    category: 'Paper Products',
    unit: 'ream',
    openedDate: '2026-06-15',
    closedDate: '2026-06-22',
    participants: 12,
    totalQty: 8500,
    regularMarketPrice: 1100,
    merkatoRetailerPrice: 950,
    directPurchasePrice: 920,
    finalBasketPrice: 860,
    myQty: 150,
  },
  {
    id: 'bsk-m-074',
    type: 'Monthly',
    status: 'Completed',
    product: 'Notebook',
    category: 'Books & Notebooks',
    unit: 'piece',
    openedDate: '2026-05-20',
    closedDate: '2026-06-20',
    participants: 8,
    totalQty: 2400,
    regularMarketPrice: 85,
    merkatoRetailerPrice: 72,
    directPurchasePrice: 68,
    finalBasketPrice: 62,
    myQty: 200,
  },
]

const ORGS_SAMPLE = [
  'Addis Ababa University', 'Ministry of Education', 'Bekele Molla School',
  'Ethiopian Red Cross', 'Commercial Bank HQ', 'St. Paul Hospital',
  'Entoto TVET College', 'City Admin Office', 'Biruh Tesfa NGO',
]

export function BasketSystemPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [joining, setJoining] = useState<string | null>(null)
  const [qtyInput, setQtyInput] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [leftBaskets, setLeftBaskets] = useState<Set<string>>(new Set())

  const handleJoin = (id: string) => {
    setJoining(joining === id ? null : id)
  }

  const handleLeave = (basketId: string) => {
    // Immediately update UI state
    setLeftBaskets(prev => new Set(prev).add(basketId))
    // In real app, this would also call API to remove user from basket
    console.log('Left basket:', basketId)
  }

  // Filter out baskets the user has left and adjust participant counts
  const adjustedActiveBaskets = ACTIVE_BASKETS.map(basket => {
    const hasLeft = leftBaskets.has(basket.id)
    return {
      ...basket,
      myQty: hasLeft ? 0 : basket.myQty,
      participants: hasLeft && basket.myQty > 0 ? basket.participants - 1 : basket.participants,
      pooledQty: hasLeft && basket.myQty > 0 ? basket.pooledQty - basket.myQty : basket.pooledQty,
    }
  })

  const filteredActiveBaskets = adjustedActiveBaskets.filter(basket => 
    basket.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    basket.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCompletedBaskets = COMPLETED_BASKETS.filter(basket => 
    basket.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    basket.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Basket System
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pool your orders with other organizations to unlock wholesale supplier pricing.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by product or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Tabs for Active/Completed */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'completed')}>
          <TabsList>
            <TabsTrigger value="active">Active Baskets ({filteredActiveBaskets.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed Baskets ({filteredCompletedBaskets.length})</TabsTrigger>
          </TabsList>

          {/* Active Baskets Tab */}
          <TabsContent value="active" className="space-y-5 mt-5">
            {filteredActiveBaskets.map((b) => {
              const fillPct = Math.round((b.pooledQty / b.minQty) * 100)
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
                      <span className="text-xs text-muted-foreground">Category: {b.category}</span>
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
                      </div>
                    </div>

                    {/* Pricing Explanation */}
                    <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4 text-sm space-y-2">
                      <p className="font-semibold text-foreground text-xs uppercase tracking-wide">How Basket Pricing Works</p>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li>• <strong className="text-foreground">Final supplier price</strong> determined after basket closes and negotiations complete</li>
                        <li>• You're <strong className="text-success">guaranteed competitive savings</strong> within the 5–20% range</li>
                        <li>• Even if target isn't fully met, we negotiate the best possible supplier price</li>
                        <li>• You can always switch to Direct Purchase if you need items immediately</li>
                      </ul>
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

                    {/* Join/Leave action */}
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
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleJoin(b.id)}
                          variant={joined ? 'outline' : 'default'}
                          size="sm"
                          className="gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {joined ? 'Increase My Quantity' : 'Join This Basket'}
                        </Button>
                        {joined && (
                          <Button
                            onClick={() => handleLeave(b.id)}
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-error hover:text-error hover:bg-error-bg"
                          >
                            <X className="w-3.5 h-3.5" />Leave Basket
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {filteredActiveBaskets.length === 0 && (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No active baskets found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Baskets Tab */}
          <TabsContent value="completed" className="space-y-5 mt-5">
            {filteredCompletedBaskets.map((b) => {
              const regularSavings = b.regularMarketPrice - b.finalBasketPrice
              const merkatoSavings = b.merkatoRetailerPrice - b.finalBasketPrice
              const directSavings = b.directPurchasePrice - b.finalBasketPrice
              const myRegularSavings = regularSavings * b.myQty
              const myMerkatoSavings = merkatoSavings * b.myQty
              const myDirectSavings = directSavings * b.myQty

              return (
                <Card key={b.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] font-semibold ${
                          b.type === 'Weekly' ? 'border-info text-info' :
                          b.type === 'Monthly' ? 'border-primary text-primary' :
                          'border-accent text-accent'
                        }`}>{b.type} Basket</Badge>
                        <Badge className="text-[10px] bg-surface-muted text-muted-foreground border-0">Completed</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        {b.openedDate} → {b.closedDate}
                      </div>
                    </div>
                    <CardTitle className="text-base">{b.product}</CardTitle>
                    <CardDescription className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.participants} organizations</span>
                      <span>{b.totalQty.toLocaleString()} {b.unit}s total</span>
                      <span>You ordered: {b.myQty} {b.unit}s</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">Regular Market</p>
                        <p className="text-sm font-bold text-foreground font-mono">ETB {b.regularMarketPrice}</p>
                      </div>
                      <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">Merkato Retailer</p>
                        <p className="text-sm font-bold text-foreground font-mono">ETB {b.merkatoRetailerPrice}</p>
                      </div>
                      <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">Direct Purchase</p>
                        <p className="text-sm font-bold text-foreground font-mono">ETB {b.directPurchasePrice}</p>
                      </div>
                      <div className="bg-success-bg rounded-lg border border-success/30 p-3 text-center">
                        <p className="text-[10px] text-success font-mono mb-1 font-semibold">Final Basket Price</p>
                        <p className="text-sm font-bold text-success font-mono">ETB {b.finalBasketPrice}</p>
                      </div>
                    </div>

                    {/* Savings Breakdown */}
                    <div className="bg-success-bg border border-success/20 rounded-lg p-4 space-y-2">
                      <p className="font-semibold text-success text-xs uppercase tracking-wide">Your Savings ({b.myQty} {b.unit}s)</p>
                      <div className="grid sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">vs Regular Market</p>
                          <p className="font-bold text-success font-mono">ETB {myRegularSavings.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">vs Merkato Retailers</p>
                          <p className="font-bold text-success font-mono">ETB {myMerkatoSavings.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">vs Direct Purchase</p>
                          <p className="font-bold text-success font-mono">ETB {myDirectSavings.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filteredCompletedBaskets.length === 0 && (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No completed baskets found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
