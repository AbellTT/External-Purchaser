import { useState, useEffect } from 'react'
import { Clock, Users, Truck, Plus, ShoppingCart, Package, X, Search, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  selectActiveBaskets, 
  selectOpenBaskets, 
  selectCompletedBaskets, 
} from '@/store/slices/basketsSlice'
import basketsMock from '@/data/baskets/basketsList.json'

function BasketSkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>
        <div className="h-9 w-72 bg-muted rounded" />
        <div className="h-10 w-80 bg-muted rounded" />
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
              <div className="h-6 w-64 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded-full" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-muted rounded-lg" />
                <div className="h-16 bg-muted rounded-lg" />
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}

export function BasketSystemPage() {
  const dispatch = useAppDispatch()
  
  const activeBasketsFromRedux = useAppSelector(selectActiveBaskets)
  const openBasketsFromRedux = useAppSelector(selectOpenBaskets)
  const completedBasketsFromRedux = useAppSelector(selectCompletedBaskets)
  
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'open' | 'completed'>('active')
  const [joining, setJoining] = useState<string | null>(null)
  const [qtyInput, setQtyInput] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  // Pagination per tab
  const [activePage, setActivePage] = useState(1)
  const [openPage, setOpenPage] = useState(1)
  const [completedPage, setCompletedPage] = useState(1)
  const PAGE_SIZE = 1

  // Always fetch on mount — show skeleton first, then load data
  useEffect(() => {
    setIsFirstLoad(true)
    dispatch({
      type: 'baskets/fetchBaskets/fulfilled',
      payload: basketsMock.data
    })
    // Small artificial delay so skeleton is visible on refresh
    const timer = setTimeout(() => setIsFirstLoad(false), 600)
    return () => clearTimeout(timer)
  }, [dispatch])

  // Map to UI format
  const mapBasket = (basket: any, statusLabel: string) => ({
    id: basket.id,
    type: basket.type.charAt(0).toUpperCase() + basket.type.slice(1),
    status: statusLabel,
    title: basket.brand.brandName,           // basket title = brand name
    product: basket.brand.productName,        // product name shown as subtitle
    category: 'Products',
    unit: basket.brand.productUnit,
    closesIn: `${basket.timeline.daysRemaining} day${basket.timeline.daysRemaining !== 1 ? 's' : ''}`,
    openedDate: basket.timeline.startDate.split('T')[0],
    closedDate: basket.timeline.endDate.split('T')[0],
    participants: basket.participation.totalParticipants,
    pooledQty: basket.participation.totalCommitment,
    minQty: basket.participation.maxCommitment,
    truckPct: Math.round((basket.participation.totalCommitment / basket.participation.maxCommitment) * 100),
    myQty: basket.userParticipation.commitment || 0,
    regularMarketPrice: basket.pricing.regular_stationary_market_price,
    merkatoRetailerPrice: basket.pricing.merkato_retailer_price,
    directPurchasePrice: basket.pricing.basketPrice * 1.05,
    finalBasketPrice: basket.pricing.basketPrice,
    originalBasket: basket,
    orgs: basket.participation.participants.map((p: any) => p.organizationName)
  })

  const ACTIVE_BASKETS = activeBasketsFromRedux.map(b => mapBasket(b, 'Active'))
  const OPEN_BASKETS = openBasketsFromRedux.map(b => mapBasket(b, 'Open'))
  const COMPLETED_BASKETS = completedBasketsFromRedux.map(b => mapBasket(b, 'Completed'))

  const handleJoinStart = (id: string) => {
    setJoining(joining === id ? null : id)
  }

  const handleJoinConfirm = (basketItem: any) => {
    const qty = parseInt(qtyInput[basketItem.id] || '0', 10)
    if (qty > 0) {
      const updatedBasket = { ...basketItem.originalBasket }
      updatedBasket.userParticipation = {
        isParticipating: true,
        commitment: qty,
        joinedDate: new Date().toISOString()
      }
      updatedBasket.participation = {
        ...updatedBasket.participation,
        totalParticipants: updatedBasket.participation.totalParticipants + 1,
        totalCommitment: updatedBasket.participation.totalCommitment + qty,
        currentCommitment: updatedBasket.participation.currentCommitment + qty,
        participants: [
          ...updatedBasket.participation.participants,
          {
            organizationName: "Your Organization",
            commitment: qty,
            joinedDate: new Date().toISOString()
          }
        ]
      }
      
      dispatch({
        type: 'baskets/joinBasket/fulfilled',
        payload: updatedBasket
      })
      
      setJoining(null)
      setQtyInput(prev => ({ ...prev, [basketItem.id]: '' }))
    }
  }
  
  const handleUpdateCommitment = (basketItem: any) => {
    const qty = parseInt(qtyInput[basketItem.id] || '0', 10)
    if (qty > 0) {
      const updatedBasket = { ...basketItem.originalBasket }
      const diff = qty - (updatedBasket.userParticipation.commitment || 0)
      updatedBasket.userParticipation = {
        ...updatedBasket.userParticipation,
        commitment: qty
      }
      updatedBasket.participation = {
        ...updatedBasket.participation,
        totalCommitment: updatedBasket.participation.totalCommitment + diff,
        currentCommitment: updatedBasket.participation.currentCommitment + diff,
        participants: updatedBasket.participation.participants.map((p: any) => 
          p.organizationName === "Your Organization" ? { ...p, commitment: qty } : p
        )
      }
      
      dispatch({
        type: 'baskets/updateCommitment/fulfilled',
        payload: updatedBasket
      })
      
      setJoining(null)
      setQtyInput(prev => ({ ...prev, [basketItem.id]: '' }))
    }
  }

  const handleLeave = (basketItem: any) => {
    const updatedBasket = { ...basketItem.originalBasket }
    const myQty = updatedBasket.userParticipation.commitment || 0
    updatedBasket.userParticipation = {
      isParticipating: false,
      commitment: null,
      joinedDate: null
    }
    updatedBasket.participation = {
      ...updatedBasket.participation,
      totalParticipants: Math.max(0, updatedBasket.participation.totalParticipants - 1),
      totalCommitment: Math.max(0, updatedBasket.participation.totalCommitment - myQty),
      currentCommitment: Math.max(0, updatedBasket.participation.currentCommitment - myQty),
      participants: updatedBasket.participation.participants.filter((p: any) => p.organizationName !== "Your Organization")
    }
    
    dispatch({
      type: 'baskets/leaveBasket/fulfilled',
      payload: updatedBasket
    })
  }

  const filteredActive = ACTIVE_BASKETS.filter(basket => 
    basket.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    basket.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOpen = OPEN_BASKETS.filter(basket => 
    basket.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    basket.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCompleted = COMPLETED_BASKETS.filter(basket => 
    basket.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    basket.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isFirstLoad) {
    return <BasketSkeleton />
  }

  const renderBasketCard = (b: any, isJoined: boolean) => {
    const fillPct = Math.round((b.pooledQty / b.minQty) * 100)
    const isJoining = joining === b.id

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
              {isJoined && <Badge className="text-[10px] bg-success-bg text-success border-0"><CheckCircle className="w-3 h-3 mr-1" />You joined · {b.myQty} {b.unit}s</Badge>}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Closes in {b.closesIn}
            </div>
          </div>
          <CardTitle className="text-base">{b.title}</CardTitle>
          <CardDescription className="flex flex-col gap-0.5">
            <span className="text-sm text-muted-foreground">{b.product}</span>
            <span className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.participants} organizations</span>
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {b.truckPct}% truck capacity</span>
            <span className="text-xs text-muted-foreground">Category: {b.category}</span>
            </span>
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
              {b.orgs.slice(0, 9).map((org: string) => (
                <span key={org} className="text-[11px] bg-surface-muted border border-border rounded px-2 py-0.5 text-foreground">{org}</span>
              ))}
              {b.orgs.length > 9 && <span className="text-[11px] text-muted-foreground px-2 py-0.5">+{b.orgs.length - 9} more</span>}
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
              <Button size="sm" onClick={() => isJoined ? handleUpdateCommitment(b) : handleJoinConfirm(b)} className="gap-1.5 h-9">
                <Package className="w-3.5 h-3.5" />Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => setJoining(null)} className="h-9">Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleJoinStart(b.id)}
                variant={isJoined ? 'outline' : 'default'}
                size="sm"
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {isJoined ? 'Update My Quantity' : 'Join This Basket'}
              </Button>
              {isJoined && (
                <Button
                  onClick={() => handleLeave(b)}
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
  }

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

        {/* Tabs for Active/Open/Completed */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'open' | 'completed')}>
          <TabsList>
            <TabsTrigger value="active">My Baskets ({filteredActive.length})</TabsTrigger>
            <TabsTrigger value="open">Open Baskets ({filteredOpen.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed Baskets ({filteredCompleted.length})</TabsTrigger>
          </TabsList>

          {/* My Baskets (Active) Tab */}
          <TabsContent value="active" className="space-y-5 mt-5">
            {(() => {
              const totalActivePages = Math.max(1, Math.ceil(filteredActive.length / PAGE_SIZE))
              const safeActivePage = Math.min(activePage, totalActivePages)
              const paginatedActive = filteredActive.slice((safeActivePage - 1) * PAGE_SIZE, safeActivePage * PAGE_SIZE)
              return (
                <>
                  {paginatedActive.map((b) => renderBasketCard(b, true))}
                  {filteredActive.length === 0 && (
                    <Card className="border-border bg-surface-muted/30">
                      <CardContent className="py-12 text-center">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">You haven't joined any active baskets yet.</p>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab('open')}>
                          Browse Open Baskets
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  {totalActivePages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <Button variant="outline" size="sm" disabled={safeActivePage <= 1} onClick={() => setActivePage(p => Math.max(1, p - 1))} className="gap-1">
                        <ChevronLeft className="w-4 h-4" />Prev
                      </Button>
                      <span className="text-sm text-muted-foreground font-mono">Page {safeActivePage} of {totalActivePages}</span>
                      <Button variant="outline" size="sm" disabled={safeActivePage >= totalActivePages} onClick={() => setActivePage(p => Math.min(totalActivePages, p + 1))} className="gap-1">
                        Next<ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )
            })()}
          </TabsContent>
          
          {/* Open Baskets Tab */}
          <TabsContent value="open" className="space-y-5 mt-5">
            {(() => {
              const totalOpenPages = Math.max(1, Math.ceil(filteredOpen.length / PAGE_SIZE))
              const safeOpenPage = Math.min(openPage, totalOpenPages)
              const paginatedOpen = filteredOpen.slice((safeOpenPage - 1) * PAGE_SIZE, safeOpenPage * PAGE_SIZE)
              return (
                <>
                  {paginatedOpen.map((b) => renderBasketCard(b, false))}
                  {filteredOpen.length === 0 && (
                    <Card className="border-border">
                      <CardContent className="py-12 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">No open baskets available right now.</p>
                      </CardContent>
                    </Card>
                  )}
                  {totalOpenPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <Button variant="outline" size="sm" disabled={safeOpenPage <= 1} onClick={() => setOpenPage(p => Math.max(1, p - 1))} className="gap-1">
                        <ChevronLeft className="w-4 h-4" />Prev
                      </Button>
                      <span className="text-sm text-muted-foreground font-mono">Page {safeOpenPage} of {totalOpenPages}</span>
                      <Button variant="outline" size="sm" disabled={safeOpenPage >= totalOpenPages} onClick={() => setOpenPage(p => Math.min(totalOpenPages, p + 1))} className="gap-1">
                        Next<ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )
            })()}
          </TabsContent>

          {/* Completed Baskets Tab */}
          <TabsContent value="completed" className="space-y-5 mt-5">
            {(() => {
              const totalCompPages = Math.max(1, Math.ceil(filteredCompleted.length / PAGE_SIZE))
              const safeCompPage = Math.min(completedPage, totalCompPages)
              const paginatedCompleted = filteredCompleted.slice((safeCompPage - 1) * PAGE_SIZE, safeCompPage * PAGE_SIZE)
              return (
                <>
                  {paginatedCompleted.map((b) => {
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
                          <CardTitle className="text-base">{b.title}</CardTitle>
                          <CardDescription className="flex flex-col gap-0.5">
                            <span className="text-sm text-muted-foreground">{b.product}</span>
                            <span className="flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.participants} organizations</span>
                              <span>{b.pooledQty.toLocaleString()} {b.unit}s total</span>
                              {b.myQty > 0 && <span>You ordered: {b.myQty} {b.unit}s</span>}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
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
                          {b.myQty > 0 && (
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
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  {filteredCompleted.length === 0 && (
                    <Card className="border-border">
                      <CardContent className="py-12 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">No completed baskets found matching your search.</p>
                      </CardContent>
                    </Card>
                  )}
                  {totalCompPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <Button variant="outline" size="sm" disabled={safeCompPage <= 1} onClick={() => setCompletedPage(p => Math.max(1, p - 1))} className="gap-1">
                        <ChevronLeft className="w-4 h-4" />Prev
                      </Button>
                      <span className="text-sm text-muted-foreground font-mono">Page {safeCompPage} of {totalCompPages}</span>
                      <Button variant="outline" size="sm" disabled={safeCompPage >= totalCompPages} onClick={() => setCompletedPage(p => Math.min(totalCompPages, p + 1))} className="gap-1">
                        Next<ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )
            })()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
