import { useState, useEffect } from 'react'
import { PageMeta } from '@/components/PageMeta'
import { History, RotateCcw, Truck, CheckCircle2, Package, X, ChevronRight, Calendar, ChevronLeft, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  cancelOrder,
  reorder,
  selectAllOrders,
  fetchOrderHistory,
  selectOrdersPagination,
  selectOrdersLoading,
  selectOrdersSummaryStats,
} from '@/store/slices/ordersSlice'

// ==================== SKELETON ====================

function OrderHistorySkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-muted rounded" />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="h-20 bg-surface-muted rounded" />
          <div className="h-20 bg-surface-muted rounded" />
        </div>
        <div className="h-10 w-48 bg-surface-muted rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-surface-muted rounded" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

const STATUS_LABELS: Record<string, string> = {
  'pending':          'Pending Confirmation',
  'accepted':         'Order Accepted',
  'out-for-delivery': 'Out for Delivery',
  'out_for_delivery': 'Out for Delivery',
  'delivered':        'Delivered',
  'cancelled':        'Cancelled',
}

const STATUS_STYLES: Record<string, string> = {
  'pending':          'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
  'accepted':         'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
  'out-for-delivery': 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400',
  'out_for_delivery': 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400',
  'delivered':        'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  'cancelled':        'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400',
}

const STATUS_ICONS: Record<string, any> = {
  'pending':          Calendar,
  'accepted':         CheckCircle2,
  'out-for-delivery': Truck,
  'out_for_delivery': Truck,
  'delivered':        CheckCircle2,
  'cancelled':        XCircle,
}

const normalizeStatusKey = (s: string = '') => s.toLowerCase().replace(/_/g, '-')

// ==================== PAGE COMPONENT ====================

export function OrderHistoryPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectAllOrders)
  const pagination = useAppSelector(selectOrdersPagination)
  const loading = useAppSelector(selectOrdersLoading)
  const summaryStats = useAppSelector(selectOrdersSummaryStats)

  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [reorderingId, setReorderingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(fetchOrderHistory({
      page,
      status: filter !== 'all' ? filter : undefined,
      pageSize: 10,
    }))
  }, [dispatch, page, filter])

  useEffect(() => {
    const timer = setTimeout(() => setIsFirstLoad(false), 400)
    return () => clearTimeout(timer)
  }, [])

  if (isFirstLoad && loading && orders.length === 0) return <OrderHistorySkeleton />

  const selectedOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId)

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      await dispatch(cancelOrder(orderId)).unwrap()
      toast.success('Order cancelled successfully.')
      setSelectedOrderId(null)
      dispatch(fetchOrderHistory({ page, status: filter !== 'all' ? filter : undefined, pageSize: 10 }))
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to cancel order.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleReorder = async (orderId: string) => {
    setReorderingId(orderId)
    try {
      const res = await dispatch(reorder(orderId)).unwrap()
      toast.success(`Reorder created successfully: ${res.orderNumber}`)
      setSelectedOrderId(null)
      setPage(1)
      dispatch(fetchOrderHistory({ page: 1, status: filter !== 'all' ? filter : undefined, pageSize: 10 }))
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to reorder.')
    } finally {
      setReorderingId(null)
    }
  }

  return (
    <DashboardLayout>
      <PageMeta
        title="Order History"
        description="Track your past orders, delivery status, and total savings versus market prices."
        path="/dashboard/orders"
      />
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <History className="w-7 h-7 text-primary" />
            Order History
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">All your direct purchase orders including pending and completed.</p>
        </div>

        {/* Global Summary — considers ALL delivered transactions in database */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm font-mono font-medium text-muted-foreground">Total Spend (Delivered)</p>
              <p className="text-lg sm:text-xl font-bold text-foreground font-mono mt-1.5">
                ETB {(summaryStats?.totalSpend || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm font-mono font-medium text-muted-foreground">Total Savings (Delivered)</p>
              <div className="space-y-1 mt-1.5">
                <p className="text-sm sm:text-base font-bold text-success font-mono">
                  ETB {(summaryStats?.savingsVsRegular || 0).toLocaleString()} vs Regular Market
                </p>
                <p className="text-sm sm:text-base font-bold text-success font-mono">
                  ETB {(summaryStats?.savingsVsMerkato || 0).toLocaleString()} vs Merkato Retailers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Count & Refresh */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1) }}>
              <SelectTrigger className="w-48 h-9 text-sm">
                <SelectValue placeholder="Filter orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchOrderHistory({ page, status: filter !== 'all' ? filter : undefined, pageSize: 10 }))}
              className="text-xs h-9 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <span className="text-xs text-muted-foreground font-mono">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total orders)
            </span>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {orders.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No orders found for this filter.</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((o) => {
              const stKey = normalizeStatusKey(o.status)
              const StatusIcon = STATUS_ICONS[stKey] || Package
              const itemCount = o.items.length
              const firstItem = o.items[0]

              return (
                <Card
                  key={o.id}
                  className="border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrderId(o.id)}
                >
                  <CardContent className="p-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${STATUS_STYLES[stKey] || STATUS_STYLES.pending}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm sm:text-lg font-bold text-foreground font-mono truncate">{o.orderNumber}</p>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[stKey] || STATUS_STYLES.pending}`}>
                              {STATUS_LABELS[stKey] || o.status}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {itemCount === 1 && firstItem
                              ? `${firstItem.brandName} ${firstItem.productName}`
                              : `${itemCount} products`} · {o.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-mono text-muted-foreground">Total</p>
                            <p className="text-base sm:text-xl font-bold text-foreground font-mono whitespace-nowrap">ETB {o.pricing.total.toLocaleString()}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Server-side Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>

            <span className="text-sm text-muted-foreground font-mono">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrderId(null)}>
            <Card
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="pb-4 border-b border-border sticky top-0 bg-card z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-lg font-mono">{selectedOrder.orderNumber}</CardTitle>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[selectedOrder.status] || STATUS_STYLES.pending}`}>
                        {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedOrder.date}</span>
                      {selectedOrder.delivery.estimatedDate && (
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Est. delivery: {selectedOrder.delivery.estimatedDate}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedOrderId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Items */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Order Items</p>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg border border-border">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{item.brandName} {item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}(s) × ETB {item.price}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-foreground font-mono shrink-0 whitespace-nowrap">ETB {item.subtotal.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-1.5 bg-surface-muted rounded-lg border border-border p-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Items subtotal</span>
                    <span className="font-mono">ETB {selectedOrder.pricing.itemsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="font-mono">ETB {selectedOrder.pricing.deliveryFee.toLocaleString()}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="flex justify-between text-xs text-success">
                      <span>Discount</span>
                      <span className="font-mono">- ETB {selectedOrder.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5 mt-1.5">
                    <span className="text-foreground">Order Total</span>
                    <span className="text-foreground font-mono text-lg">ETB {selectedOrder.pricing.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Savings */}
                {selectedOrder.status === 'delivered' && (
                  <div className="bg-success-bg border border-success/20 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-success uppercase tracking-wide">Your Savings</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">vs Regular Market</span>
                      <span className="font-bold text-success font-mono">ETB {selectedOrder.savings.vsRegularStationaryMarket.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">vs Merkato Retailers</span>
                      <span className="font-bold text-success font-mono">ETB {selectedOrder.savings.vsMerkatoRetailer.amount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Delivery address */}
                <div className="text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="font-semibold text-foreground">Delivery address: </span>
                  {selectedOrder.delivery.address}
                </div>

                {/* Actions */}
                <div className="border-t border-border pt-4 flex gap-2 flex-wrap">
                  <Button
                    className="flex-1 gap-2"
                    variant="outline"
                    disabled={reorderingId === selectedOrder.id}
                    onClick={() => handleReorder(selectedOrder.id)}
                  >
                    {reorderingId === selectedOrder.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Reordering...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" /> Reorder These Items
                      </>
                    )}
                  </Button>

                  {['pending', 'accepted'].includes(selectedOrder.status.toLowerCase()) && (
                    <Button
                      className="flex-1 gap-2"
                      variant="destructive"
                      disabled={cancellingId === selectedOrder.id}
                      onClick={() => handleCancel(selectedOrder.id)}
                    >
                      {cancellingId === selectedOrder.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Cancel Order
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
