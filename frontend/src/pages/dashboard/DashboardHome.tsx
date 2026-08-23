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
  X,
  Calendar,
  MapPin,
  Sparkles,
  BarChart3,
  FileText,
  History,
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
import type { ActiveOrder } from '@/types/api'

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

  // Stat Cards Data (Reflecting User Requested Metrics)
  const completedAmount = overview.completedVolume?.totalAmount ?? overview.totalSavings?.amount ?? 0
  const completedUnits = overview.completedVolume?.totalUnits ?? 0
  const basketSavings = overview.totalBasketSavings?.amount ?? overview.totalSavings?.amount ?? 0
  const avgDiscount = overview.avgDiscountRate?.yourAverage ?? 14.5

  const statCards = [
    {
      label: 'Completed Procurement Volume',
      value: `ETB ${completedAmount.toLocaleString()}`,
      sub: `${completedUnits.toLocaleString()} total units fulfilled`,
      icon: Package,
      color: 'text-info',
      bg: 'bg-info-bg',
    },
    {
      label: 'Total Basket Savings',
      value: `ETB ${basketSavings.toLocaleString()}`,
      sub: 'Saved vs Merkato Retailers via Basket Pooling',
      icon: TrendingDown,
      color: 'text-success',
      bg: 'bg-success-bg',
    },
    {
      label: 'Active Orders Queue',
      value: `${overview.activeOrders.count} active orders`,
      sub: `ETB ${overview.activeOrders.totalValue.toLocaleString()} in processing`,
      icon: ShoppingBag,
      color: 'text-primary',
      bg: 'bg-primary-subtle',
    },
    {
      label: 'Avg. Direct Purchase Discount',
      value: `${avgDiscount}%`,
      sub: 'Average savings on Direct Purchases vs Merkato',
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent-subtle',
    },
  ]

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header — Boosted Typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Selam , {orgName} 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">
              Welcome back to your MBE External Purchaser Institutional Procurement Portal
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold h-9">
              <Link to="/dashboard/baskets">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Join Basket
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs font-semibold h-9">
              <Link to="/dashboard/direct-purchase">
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Stat Cards — Boosted Responsive Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-5 space-y-2.5">
                <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">{s.value}</p>
                <p className="text-sm sm:text-base font-bold text-foreground leading-tight">{s.label}</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Baskets + Recent Orders — Single Column Vertical Layout */}
        <div className="flex flex-col gap-5">
          {/* Active Baskets (User's Involved Baskets) */}
          <Card className="border-border flex flex-col justify-between h-full">
            <div>
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Your Active Baskets ({overview.basketParticipation.baskets.length})
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-semibold gap-1">
                    <Link to="/dashboard/baskets">
                      View all baskets <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
                <CardDescription className="text-xs sm:text-sm font-medium">
                  Pooled brand procurement pools you are actively participating in
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                {overview.basketParticipation.baskets.length === 0 ? (
                  <div className="p-6 text-center bg-surface-muted/30 rounded-xl border border-dashed border-border space-y-2">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-sm font-bold text-foreground">No Active Basket Commitments</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto font-medium">
                      You are not currently committed to any open procurement baskets. Join an active basket to pool institutional demand and save!
                    </p>
                    <Button asChild size="sm" className="text-xs font-semibold mt-1">
                      <Link to="/dashboard/baskets">Explore Open Baskets</Link>
                    </Button>
                  </div>
                ) : (
                  overview.basketParticipation.baskets.map((b: any) => (
                    <div key={b.id} className="p-4 rounded-xl border border-border bg-surface-muted/40 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono font-semibold text-primary uppercase tracking-wider mb-0.5">
                            Brand: <strong className="text-foreground font-bold">{b.brandName || b.name}</strong>
                          </p>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-base font-bold text-foreground">{b.name}</p>
                            <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary-subtle px-2 py-0.5 font-semibold">
                              {b.type === '6-month' ? '6-Month' : b.type.charAt(0).toUpperCase() + b.type.slice(1)} Basket
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                            Your commitment: <strong className="text-foreground font-mono font-bold">{b.userCommittedQuantity || 0} units</strong> (ETB {b.yourCommitment.toLocaleString()})
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="outline" className={`text-xs gap-1 font-semibold ${b.status === 'closing_soon' ? 'border-warning text-warning bg-warning-bg' : 'border-success text-success bg-success-bg'}`}>
                            <Clock className="w-3 h-3" />
                            {b.status === 'closing_soon' ? 'Closing Soon' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                      {/* Fill Progress */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs sm:text-sm font-mono">
                          <span className="text-muted-foreground font-medium">
                            Target: {b.fillProgress.target.toLocaleString()} units
                          </span>
                          <span className="font-bold text-primary">{b.fillProgress.percentage}% filled</span>
                        </div>
                        <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${b.fillProgress.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card className="border-border flex flex-col justify-between h-full">
            <div>
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-info" />
                    Recent Purchase Orders
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-semibold gap-1">
                    <Link to="/dashboard/orders">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
                <CardDescription className="text-xs sm:text-sm font-medium">
                  Click any order to view detailed status, items breakdown, and delivery schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                {overview.activeOrders.orders.length === 0 ? (
                  <div className="p-6 text-center bg-surface-muted/30 rounded-xl border border-dashed border-border space-y-2">
                    <Package className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-sm font-bold text-foreground">No Purchase Orders Placed</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto font-medium">
                      You have not placed any direct purchases yet.
                    </p>
                  </div>
                ) : (
                  overview.activeOrders.orders.map((o) => {
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
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:border-primary/50 hover:bg-surface-muted/60 transition-all cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center shrink-0 group-hover:bg-primary-subtle transition-colors">
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
                            <p className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {itemsText}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-mono font-medium mt-0.5">
                            {o.orderNumber} · <strong className="text-foreground font-bold">ETB {o.pricing.total.toLocaleString()}</strong>
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusStyle}`}>
                          {statusLabel}
                        </span>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </div>

            <div className="p-4 sm:p-5 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5 h-9">
                <Link to="/dashboard/direct-purchase">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Place New Direct Purchase
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Procurement Quick Links + Account Activity */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Market Intelligence',
              description: 'View live weekly spot prices and brand pricing data',
              icon: BarChart3,
              to: '/dashboard/market-intelligence',
              color: 'text-accent',
              bg: 'bg-accent-subtle',
            },
            {
              label: 'Procurement Calendar',
              description: 'Check seasonal cycles and recommended procurement windows',
              icon: Calendar,
              to: '/dashboard/calendar',
              color: 'text-primary',
              bg: 'bg-primary-subtle',
            },
            {
              label: 'Basket History',
              description: 'Review all baskets you have participated in and their outcomes',
              icon: History,
              to: '/dashboard/basket-history',
              color: 'text-info',
              bg: 'bg-info-bg',
            },
            {
              label: 'Order History',
              description: 'Full record of all direct purchases placed by your organisation',
              icon: FileText,
              to: '/dashboard/orders',
              color: 'text-success',
              bg: 'bg-success-bg',
            },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="group block p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-surface-muted/40 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg ${link.bg} ${link.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <link.icon className="w-5 h-5" />
              </div>
              <p className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">{link.label}</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1 leading-snug">{link.description}</p>
            </Link>
          ))}
        </div>

        {/* Savings Insight Banner */}
        <div className="rounded-xl border border-border bg-primary-subtle p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm sm:text-base font-bold text-foreground">📅 Institutional Procurement Recommendation</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
              A4 paper prices historically rise in September (school-year demand). Joining this week's <strong className="text-foreground">Double A</strong> basket could save an estimated <strong className="text-foreground">ETB 19,700</strong> before the seasonal spike.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5 h-9 font-semibold">
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
