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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const STAT_CARDS = [
  {
    label: 'Total Savings (YTD)',
    value: 'ETB 47,820',
    sub: '+12.4% vs market price',
    trend: 'up',
    icon: TrendingDown,
    color: 'text-success',
    bg: 'bg-success-bg',
  },
  {
    label: 'Active Orders',
    value: '3',
    sub: '1 out for delivery',
    trend: 'neutral',
    icon: Package,
    color: 'text-info',
    bg: 'bg-info-bg',
  },
  {
    label: 'Basket Participation',
    value: '2 baskets',
    sub: 'Weekly + Monthly',
    trend: 'neutral',
    icon: ShoppingBag,
    color: 'text-primary',
    bg: 'bg-primary-subtle',
  },
  {
    label: 'Avg. Discount Rate',
    value: '16.2%',
    sub: 'vs Merkato Retailers',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-accent',
    bg: 'bg-accent-subtle',
  },
]

const RECENT_ORDERS = [
  { id: 'ORD-0891', product: 'Sinar Line A4 Paper', qty: '120 reams', status: 'Out for Delivery', statusColor: 'text-info bg-info-bg' },
  { id: 'ORD-0878', product: '05A HP Toner Ink', qty: '12 cartridges', status: 'Confirmed', statusColor: 'text-success bg-success-bg' },
  { id: 'ORD-0862', product: 'Box File Kent', qty: '80 pieces', status: 'Delivered', statusColor: 'text-muted-foreground bg-surface-muted' },
]

const ACTIVE_BASKETS = [
  {
    type: 'Weekly Basket',
    closes: 'Closes in 2 days',
    product: 'Sinar Line A4 Paper',
    filled: 68,
    participants: 9,
    status: 'Active',
  },
  {
    type: 'Monthly Basket',
    closes: 'Closes in 11 days',
    product: 'Box File Kent',
    filled: 45,
    participants: 6,
    status: 'Active',
  },
]

export function DashboardHome() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Good morning, AAU 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">August 2026 — Weekly basket closes in 2 days</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/dashboard/baskets"><ShoppingBag className="w-3.5 h-3.5" />Join Basket</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/dashboard/direct-purchase"><ShoppingCart className="w-3.5 h-3.5" />Buy Now</Link>
            </Button>
          </div>
        </div>

        {/* Merkato Price Highlight */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Merkato Market · This Week</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                Sinar Line A4 Paper — <span className="text-accent font-bold">ETB 985 / ream</span>
                <span className="ml-2 text-xs text-error font-mono">↑ +1.5% vs last week</span>
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Link to="/dashboard/market-intelligence">
              Explore all prices
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map((s) => (
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Baskets</CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Link to="/dashboard/baskets">View all <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </div>
              <CardDescription>Pooled orders you're participating in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ACTIVE_BASKETS.map((b) => (
                <div key={b.type} className="p-4 rounded-lg border border-border bg-surface-muted/40 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.type}</p>
                      <p className="text-xs text-muted-foreground">{b.product}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-[10px] gap-1 border-warning text-warning">
                        <Clock className="w-2.5 h-2.5" />{b.closes}
                      </Badge>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{b.participants} organizations joined</span>
                      <span className="font-semibold text-primary">{b.filled}% filled</span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${b.filled}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Status: <span className="font-semibold text-foreground">{b.status}</span>
                      <span className="ml-2 text-info">• Basket is filling</span>
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Link to="/dashboard/orders">View all <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </div>
              <CardDescription>Latest purchase and delivery status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {RECENT_ORDERS.map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-surface-muted/40 transition-colors">
                  <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center shrink-0">
                    {o.status === 'Out for Delivery' && <Truck className="w-4 h-4 text-info" />}
                    {o.status === 'Confirmed' && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {o.status === 'Delivered' && <CheckCircle2 className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{o.product}</p>
                    <p className="text-xs text-muted-foreground font-mono">{o.id} · {o.qty}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${o.statusColor}`}>
                    {o.status}
                  </span>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full mt-2 gap-1.5">
                <Link to="/dashboard/direct-purchase">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Place New Order
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Savings Insight Banner */}
        <div className="rounded-xl border border-border bg-primary-subtle p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">📅 Procurement Insight — August</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A4 paper prices historically rise in September (school-year demand). Joining this week's basket could save an estimated <strong>ETB 19,700</strong> before the seasonal spike.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5">
            <Link to="/dashboard/calendar">View Calendar <ArrowRight className="w-3.5 h-3.5" /></Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
