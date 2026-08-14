import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ShoppingBag,
  Clock,
  Package,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Truck,
  BellRing,
  X,
  Calendar,
  MapPin,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchDashboardOverview,
  selectDashboardOverview,
  selectDashboardLoading,
  selectDashboardNeedsRefresh,
} from '@/store/slices/dashboardSlice'
import { selectUser } from '@/store/slices/authSlice'
import type { ActiveOrder, PriceAlert } from '@/types/api'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-muted rounded-md" />
            <div className="h-9 w-28 bg-muted rounded-md" />
          </div>
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="w-8 h-8 rounded-md bg-muted" />
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Baskets + Recent Orders Skeleton */}
        <div className="grid lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-3">
                <div className="h-5 w-36 bg-muted rounded" />
                <div className="h-4 w-56 bg-muted rounded mt-1" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 bg-muted rounded-lg" />
                <div className="h-20 bg-muted rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price Alerts Skeleton */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded mt-1" />
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  'delivered': 'text-muted-foreground bg-surface-muted',
  'out-for-delivery': 'text-info bg-info-bg',
  'accepted': 'text-success bg-success-bg',
  'pending': 'text-warning bg-warning-bg',
}

const STATUS_LABELS: Record<string, string> = {
  'delivered': 'Delivered',
  'out-for-delivery': 'Out for Delivery',
  'accepted': 'Confirmed',
  'pending': 'Pending',
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DashboardHome() {
  const dispatch = useAppDispatch()
  const overview = useAppSelector(selectDashboardOverview)
  const loading = useAppSelector(selectDashboardLoading)
  const needsRefresh = useAppSelector(selectDashboardNeedsRefresh)
  const user = useAppSelector(selectUser)

  const [selectedOrder, setSelectedOrder] = useState<ActiveOrder | null>(null)

  // Initial hydration on mount
  useEffect(() => {
    dispatch(fetchDashboardOverview())
  }, [dispatch])

  // Re-fetch when a mutating request was made elsewhere in the app
  // (e.g., placed an order, updated profile). The Axios interceptor sets
  // needsRefresh = true after every non-GET request.
  useEffect(() => {
    if (needsRefresh) {
      dispatch(fetchDashboardOverview())
    }
  }, [needsRefresh, dispatch])

  if (loading || !overview) {
    return <DashboardSkeleton />
  }

  const orgName = user?.organizationName?.split(' ')[0] || 'there'

  // Stat Cards Data
  const statCards = [
    {
      label: 'Total Savings (YTD)',
      value: `ETB ${overview.totalSavings.amount.toLocaleString()}`,
      sub: `+${overview.totalSavings.percentage}% ${overview.totalSavings.comparedTo || 'vs Merkato Retailers'}`,
      trend: overview.totalSavings.trend,
      icon: TrendingDown,
      color: 'text-success',
      bg: 'bg-success-bg',
    },
    {
      label: 'Active Orders',
      value: overview.activeOrders.count.toString(),
      sub: `ETB ${overview.activeOrders.totalValue.toLocaleString()} total value`,
      trend: 'neutral' as const,
      icon: Package,
      color: 'text-info',
      bg: 'bg-info-bg',
    },
    {
      label: 'Basket Participation',
      value: `${overview.basketParticipation.activeBaskets} active baskets`,
      sub: `${overview.basketParticipation.upcomingDeliveries} upcoming deliveries`,
      trend: 'neutral' as const,
      icon: ShoppingBag,
      color: 'text-primary',
      bg: 'bg-primary-subtle',
    },
    {
      label: 'Avg. Discount Rate',
      value: `${overview.avgDiscountRate.yourAverage}%`,
      sub: 'vs Merkato Retailers',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent-subtle',
    },
  ]

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Good morning, {orgName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back to your Ethiopian Institutional Procurement Portal
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/dashboard/baskets">
                <ShoppingBag className="w-3.5 h-3.5" />
                Join Basket
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/dashboard/direct-purchase">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buy Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className={`w-8 h-8 rounded-md ${s.bg} ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-xs font-semibold text-muted-foreground leading-none">{s.label}</p>
                <p className="text-[11px] text-muted-foreground/70">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Baskets + Recent Orders */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Active Baskets */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Active Baskets
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Link to="/dashboard/baskets">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
              <CardDescription>Pooled brand orders you're participating in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.basketParticipation.baskets.map((b) => (
                <div key={b.id} className="p-4 rounded-lg border border-border bg-surface-muted/40 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{b.name}</p>
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary-subtle px-1.5 py-0">
                          {b.type === '6-month' ? '6-Month' : b.type.charAt(0).toUpperCase() + b.type.slice(1)} Basket
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your commitment: <strong className="text-foreground font-mono">ETB {b.yourCommitment.toLocaleString()}</strong>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className={`text-[10px] gap-1 ${b.status === 'closing_soon' ? 'border-warning text-warning' : 'border-success text-success'}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {b.status === 'closing_soon' ? 'Closing Soon' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                  {/* Fill Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">
                        Target: ETB {b.fillProgress.target.toLocaleString()}
                      </span>
                      <span className="font-semibold text-primary">{b.fillProgress.percentage}% filled</span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${b.fillProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-info" />
                  Recent Orders
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Link to="/dashboard/orders">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
              <CardDescription>Click any order to view detailed status and item breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.activeOrders.orders.map((o) => {
                const totalItems = o.items.reduce((sum, item) => sum + item.quantity, 0)
                const itemsText = o.items.length === 1
                  ? `${o.items[0].brandName} ${o.items[0].productName}`
                  : `${o.items.length} products (${totalItems} units)`
                const statusStyle = STATUS_STYLES[o.status] || 'text-muted-foreground bg-surface-muted'
                const statusLabel = STATUS_LABELS[o.status] || o.status

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary/50 hover:bg-surface-muted/60 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center shrink-0 group-hover:bg-primary-subtle transition-colors">
                      {o.status === 'out-for-delivery' ? (
                        <Truck className="w-4 h-4 text-info" />
                      ) : o.status === 'accepted' || o.status === 'delivered' ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Package className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {itemsText}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {o.orderNumber} · ETB {o.pricing.total.toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>
                )
              })}

              <Button asChild variant="outline" size="sm" className="w-full mt-2 gap-1.5">
                <Link to="/dashboard/direct-purchase">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Place New Direct Purchase
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Price Alerts Section */}
        {overview.priceAlerts && overview.priceAlerts.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-accent" />
                    Market Price Alerts
                  </CardTitle>
                  <CardDescription>
                    Real-time market price movements for your frequently purchased institutional supplies
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 shrink-0">
                  <Link to="/dashboard/market-intelligence">
                    Market Intelligence <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                {overview.priceAlerts.map((alert: PriceAlert) => {
                  const isDrop = alert.direction === 'down'
                  return (
                    <div
                      key={alert.productId}
                      className={`p-4 rounded-xl border transition-colors space-y-3 ${
                        isDrop
                          ? 'border-success/30 bg-success-bg/40 hover:border-success/60'
                          : 'border-error/30 bg-error/5 hover:border-error/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-[10px] font-mono mb-1">
                            {alert.brandName}
                          </Badge>
                          <p className="text-sm font-semibold text-foreground">{alert.productName}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono font-bold gap-0.5 shrink-0 ${
                            isDrop ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10'
                          }`}
                        >
                          {isDrop ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {Math.abs(alert.priceChange)}%
                        </Badge>
                      </div>

                      <div className="space-y-1 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Price:</span>
                          <span className="font-bold text-foreground">ETB {alert.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Previous Price:</span>
                          <span className="line-through text-muted-foreground">ETB {alert.previousPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {alert.userPurchaseHistory && (
                        <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-0.5">
                          <p>
                            Avg paid before:{' '}
                            <strong className="text-foreground font-mono">
                              ETB {alert.userPurchaseHistory.avgPrice.toFixed(2)}
                            </strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Savings Insight Banner */}
        <div className="rounded-xl border border-border bg-primary-subtle p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">📅 Institutional Procurement Recommendation</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A4 paper prices historically rise in September (school-year demand). Joining this week's <strong>Double A</strong> basket could save an estimated <strong>ETB 19,700</strong> before the seasonal spike.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5">
            <Link to="/dashboard/calendar">
              View Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </DashboardLayout>
  )
}

// ─── Order Details Modal Component ───────────────────────────────────────────
function OrderDetailsModal({ order, onClose }: { order: ActiveOrder; onClose: () => void }) {
  const statusStyle = STATUS_STYLES[order.status] || 'text-muted-foreground bg-surface-muted'
  const statusLabel = STATUS_LABELS[order.status] || order.status

  const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border shadow-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <CardHeader className="pb-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-start gap-3">
            {/* Title block — takes full width on mobile */}
            <div className="flex-1 min-w-0">
              {/* Order number + badges: stack on mobile, row on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1.5">
                <CardTitle className="text-base sm:text-lg font-mono leading-tight">{order.orderNumber}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] border-info text-info font-mono w-fit">
                    DIRECT PURCHASE
                  </Badge>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit ${statusStyle}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
              <CardDescription className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {order.delivery?.address || 'Main Campus'}
                </span>
              </CardDescription>
            </div>
            {/* Close button — always top-right, doesn't push title */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full shrink-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Modal Content */}
        <CardContent className="p-5 space-y-5">
          {/* Items List */}
          <div className="space-y-2.5">
            <p className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">
              Order Items ({order.items.length})
            </p>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-surface-muted/60 rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Brand: <strong className="text-foreground">{item.brandName}</strong> · {item.quantity} {item.unit}(s) × ETB {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground font-mono">
                  ETB {item.subtotal.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-surface-muted/40 border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider mb-1">
              Pricing Summary
            </p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Items Subtotal</span>
              <span className="font-mono text-foreground font-semibold">ETB {order.pricing.itemsTotal.toLocaleString()}</span>
            </div>
            {order.pricing.deliveryFee > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Delivery Fee</span>
                <span className="font-mono text-foreground font-semibold">ETB {order.pricing.deliveryFee.toLocaleString()}</span>
              </div>
            )}
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-xs text-success">
                <span>Discount Applied</span>
                <span className="font-mono font-semibold">-ETB {order.pricing.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
              <span>Total Amount Paid</span>
              <span className="font-mono text-primary text-base">ETB {order.pricing.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Savings Highlight */}
          {order.savings && (
            <div className="bg-success-bg border border-success/30 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-success font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-success" />
                Institutional Savings Achieved
              </div>
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div className="bg-card border border-border p-3 rounded-lg shadow-2xs">
                  <p className="text-[11px] font-medium text-muted-foreground">vs Merkato Retailers</p>
                  <p className="text-sm font-bold text-success font-mono mt-0.5">
                    ETB {order.savings.vsMerkatoRetailer.amount.toLocaleString()} ({order.savings.vsMerkatoRetailer.percentage}%)
                  </p>
                </div>
                <div className="bg-card border border-border p-3 rounded-lg shadow-2xs">
                  <p className="text-[11px] font-medium text-muted-foreground">vs Regular Market</p>
                  <p className="text-sm font-bold text-success font-mono mt-0.5">
                    ETB {order.savings.vsRegularStationaryMarket.amount.toLocaleString()} ({order.savings.vsRegularStationaryMarket.percentage}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link to="/dashboard/orders">
                View All Orders in History
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
