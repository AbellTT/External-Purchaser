import { useState, useEffect } from 'react'
import { History, RotateCcw, Truck, CheckCircle2, Package, X, ChevronRight, Calendar, AlertCircle, ChevronLeft, XCircle } from 'lucide-react'
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
  selectAllOrders,
} from '@/store/slices/ordersSlice'
import orderHistoryMock from '@/data/orders/orderHistory.json'

// ==================== SKELETON ====================

function OrderHistorySkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-20 bg-muted rounded-lg" />
        </div>
        <div className="h-9 w-44 bg-muted rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-60 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-24 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ==================== TYPES ====================

type OrderStatus = 'pending' | 'accepted' | 'out-for-delivery' | 'delivered' | 'cancelled'

interface OrderItem {
  productName: string
  brandName: string
  quantity: number
  unit: string
  price: number
  subtotal: number
}

interface MappedOrder {
  id: string
  orderNumber: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  pricing: {
    itemsTotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  delivery: {
    address: string
    estimatedDate: string | null
    actualDate: string | null
  }
  savings: {
    vsMerkatoRetailer: { amount: number; percentage: number }
    vsRegularStationaryMarket: { amount: number; percentage: number }
  }
}

// ==================== STATUS CONFIG ====================

const STATUS_STYLES: Record<string, string> = {
  'pending':          'text-warning bg-warning-bg',
  'accepted':         'text-success bg-success-bg',
  'out-for-delivery': 'text-info bg-info-bg',
  'delivered':        'text-muted-foreground bg-surface-muted',
  'cancelled':        'text-error bg-error-bg',
}

const STATUS_LABELS: Record<string, string> = {
  'pending':          'Pending',
  'accepted':         'Accepted',
  'out-for-delivery': 'Out for Delivery',
  'delivered':        'Delivered',
  'cancelled':        'Cancelled',
}

const STATUS_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'pending':          AlertCircle,
  'accepted':         CheckCircle2,
  'out-for-delivery': Truck,
  'delivered':        CheckCircle2,
  'cancelled':        XCircle,
}

const PAGE_SIZE = 3

// ==================== PAGE COMPONENT ====================

export function OrderHistoryPage() {
  const dispatch = useAppDispatch()
  const ordersFromRedux = useAppSelector(selectAllOrders)

  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setIsFirstLoad(true)
    // Seed from mock
    dispatch({
      type: 'orders/fetchOrderHistory/fulfilled',
      payload: {
        orders: orderHistoryMock.data.orders,
        pagination: orderHistoryMock.data.pagination,
      },
    })
    const timer = setTimeout(() => setIsFirstLoad(false), 600)
    return () => clearTimeout(timer)
  }, [dispatch])

  if (isFirstLoad) return <OrderHistorySkeleton />

  const orders: MappedOrder[] = ordersFromRedux.length > 0
    ? (ordersFromRedux as any[])
    : (orderHistoryMock.data.orders as any[])

  const filtered = orders.filter(o => {
    if (filter === 'all') return true
    return o.status === filter
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const totalSpend = deliveredOrders.reduce((s, o) => s + o.pricing.total, 0)
  const totalSavingsVsMarket = deliveredOrders.reduce((s, o) => s + o.savings.vsRegularStationaryMarket.amount, 0)
  const totalSavingsVsMerkato = deliveredOrders.reduce((s, o) => s + o.savings.vsMerkatoRetailer.amount, 0)

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    // Optimistically update in Redux
    dispatch({
      type: 'orders/cancelOrder/fulfilled',
      payload: {
        ...orders.find(o => o.id === orderId),
        status: 'cancelled',
      },
    })
    // Try real API call
    dispatch(cancelOrder(orderId))
    setCancellingId(null)
    setSelectedOrderId(null)
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Order History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">All your direct purchase orders including pending and completed.</p>
        </div>

        {/* Summary — only from delivered orders */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">Total Spend (Delivered)</p>
              <p className="text-xl font-bold text-foreground font-mono mt-1">ETB {totalSpend.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">Total Savings (Delivered)</p>
              <div className="space-y-0.5 mt-1">
                <p className="text-sm font-bold text-success font-mono">ETB {totalSavingsVsMarket.toLocaleString()} vs Regular Market</p>
                <p className="text-sm font-bold text-success font-mono">ETB {totalSavingsVsMerkato.toLocaleString()} vs Merkato Retailers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
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
          <span className="text-xs text-muted-foreground">{filtered.length} order(s)</span>
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {paginated.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No orders found for this filter.</p>
              </CardContent>
            </Card>
          ) : (
            paginated.map((o) => {
              const StatusIcon = STATUS_ICONS[o.status] || Package
              const itemCount = o.items.length
              const firstItem = o.items[0]

              return (
                <Card
                  key={o.id}
                  className="border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrderId(o.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${STATUS_STYLES[o.status]}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-foreground font-mono">{o.orderNumber}</p>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status]}`}>
                            {STATUS_LABELS[o.status]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {itemCount === 1
                            ? `${firstItem.brandName} ${firstItem.productName}`
                            : `${itemCount} products`} · {new Date(o.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-mono">Total</p>
                          <p className="text-lg font-bold text-foreground font-mono">ETB {o.pricing.total.toLocaleString()}</p>
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
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[selectedOrder.status]}`}>
                        {STATUS_LABELS[selectedOrder.status]}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(selectedOrder.date).toLocaleDateString()}</span>
                      {selectedOrder.delivery.estimatedDate && (
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Est. delivery: {new Date(selectedOrder.delivery.estimatedDate).toLocaleDateString()}
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.brandName} {item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}(s) × ETB {item.price}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-foreground font-mono">ETB {item.subtotal.toLocaleString()}</p>
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
                  {selectedOrder.status === 'delivered' && (
                    <Button className="flex-1 gap-2" variant="outline">
                      <RotateCcw className="w-4 h-4" />
                      Reorder These Items
                    </Button>
                  )}
                  {selectedOrder.status === 'pending' && (
                    <Button
                      className="flex-1 gap-2"
                      variant="destructive"
                      disabled={cancellingId === selectedOrder.id}
                      onClick={() => handleCancel(selectedOrder.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      {cancellingId === selectedOrder.id ? 'Cancelling...' : 'Cancel Order'}
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
