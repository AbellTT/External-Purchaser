import { useState, useEffect } from 'react'
import { ShoppingBag, Calendar, TrendingDown, Package, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectBasketHistory,
} from '@/store/slices/basketsSlice'
import basketHistoryMock from '@/data/baskets/basketHistory.json'

// ==================== SKELETON ====================

function BasketHistorySkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>
        <div className="h-16 bg-muted rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-muted rounded-lg" />
                  <div className="h-16 bg-muted rounded-lg" />
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="h-14 bg-muted rounded-lg" />
                  <div className="h-14 bg-muted rounded-lg" />
                  <div className="h-14 bg-muted rounded-lg" />
                  <div className="h-14 bg-muted rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

const PAGE_SIZE = 2

// ==================== PAGE COMPONENT ====================

export function BasketHistoryPage() {
  const dispatch = useAppDispatch()
  const basketHistoryFromRedux = useAppSelector(selectBasketHistory)

  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setIsFirstLoad(true)
    // Seed from mock (works without live backend)
    dispatch({
      type: 'baskets/fetchBasketHistory/fulfilled',
      payload: {
        baskets: basketHistoryMock.data.baskets,
        pagination: basketHistoryMock.data.pagination,
      },
    })
    const timer = setTimeout(() => setIsFirstLoad(false), 600)
    return () => clearTimeout(timer)
  }, [dispatch])

  if (isFirstLoad) return <BasketHistorySkeleton />

  // Use Redux data if available, fallback to mock
  const allBaskets: any[] = basketHistoryFromRedux.length > 0
    ? basketHistoryFromRedux
    : basketHistoryMock.data.baskets

  const filteredBaskets = allBaskets.filter((basket: any) => {
    if (statusFilter === 'all') return true
    return basket.status === statusFilter
  })

  const totalPages = Math.max(1, Math.ceil(filteredBaskets.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filteredBaskets.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Basket History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personal basket participation history — baskets you have joined and completed or cancelled.
          </p>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-foreground">Filter by status:</label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Baskets</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredBaskets.length} basket{filteredBaskets.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Baskets List */}
        <div className="space-y-4">
          {paginated.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No basket history found</p>
              </CardContent>
            </Card>
          ) : (
            paginated.map((basket: any) => (
              <Card key={basket.id} className="border-border">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-semibold text-foreground">
                          {basket.brand?.brandName ?? basket.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            basket.status === 'completed'
                              ? 'border-success text-success'
                              : 'border-muted-foreground text-muted-foreground'
                          }`}
                        >
                          {basket.status === 'completed' ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" />Completed</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" />Cancelled</>
                          )}
                        </Badge>
                      </div>
                      {basket.brand?.productName && (
                        <p className="text-sm text-muted-foreground">
                          {basket.brand.productName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{basket.basketNumber}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {basket.type === 'weekly' ? 'Weekly' : basket.type === 'monthly' ? 'Monthly' : '6-Month'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  {basket.status === 'completed' ? (
                    <div className="space-y-5">
                      {/* Your Order Summary */}
                      {basket.userParticipation?.commitment > 0 && (
                        <div className="bg-surface-muted border border-border rounded-lg p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            <Package className="w-3.5 h-3.5" />
                            Your Order
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                              <p className="text-sm font-semibold text-foreground">
                                {basket.userParticipation.commitment} {basket.brand?.productUnit ?? 'units'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                              <p className="text-sm font-mono text-foreground">ETB {basket.pricing.basketPrice}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                              <p className="text-sm font-bold text-foreground">
                                ETB {(basket.userParticipation.commitment * basket.pricing.basketPrice).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Price Comparison */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Price Comparison (per unit)
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                            <p className="text-[10px] text-muted-foreground font-mono mb-1">Regular Market</p>
                            <p className="text-sm font-bold text-foreground font-mono">ETB {basket.pricing.regular_stationary_market_price}</p>
                          </div>
                          <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                            <p className="text-[10px] text-muted-foreground font-mono mb-1">Merkato Retailer</p>
                            <p className="text-sm font-bold text-foreground font-mono">ETB {basket.pricing.merkato_retailer_price}</p>
                          </div>
                          <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                            <p className="text-[10px] text-muted-foreground font-mono mb-1">Direct Purchase</p>
                            <p className="text-sm font-bold text-foreground font-mono">
                              ETB {(basket.pricing.basketPrice * 1.05).toFixed(0)}
                            </p>
                          </div>
                          <div className="bg-success-bg rounded-lg border border-success/30 p-3 text-center">
                            <p className="text-[10px] text-success font-mono mb-1 font-semibold">Final Basket Price</p>
                            <p className="text-sm font-bold text-success font-mono">ETB {basket.pricing.basketPrice}</p>
                          </div>
                        </div>
                      </div>

                      {/* Savings Breakdown */}
                      {basket.userParticipation?.commitment > 0 && basket.completedSavings && (
                        <div className="bg-success-bg border border-success/20 rounded-lg p-4">
                          <p className="font-semibold text-success text-xs uppercase tracking-wide mb-3">
                            Your Savings ({basket.userParticipation.commitment} {basket.brand?.productUnit ?? 'units'})
                          </p>
                          <div className="grid sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">vs Regular Market</p>
                              <p className="font-bold text-success font-mono">
                                ETB {(basket.completedSavings.vsRegularStationaryMarket * basket.userParticipation.commitment).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">vs Merkato Retailers</p>
                              <p className="font-bold text-success font-mono">
                                ETB {(basket.completedSavings.vsMerkatoRetailer * basket.userParticipation.commitment).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">vs Direct Purchase</p>
                              <p className="font-bold text-success font-mono">
                                ETB {(basket.pricing.basketPrice * 0.05 * basket.userParticipation.commitment).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-surface-muted border border-border">
                      <p className="text-sm text-muted-foreground text-center">
                        This basket was cancelled and no order was placed
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Basket opened: {new Date(basket.timeline.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Closed: {new Date(basket.timeline.endDate).toLocaleDateString()}</span>
                    </div>
                    {basket.timeline.deliveryDate && (
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        <span>Delivered: {new Date(basket.timeline.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground font-mono">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
