import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingBag, TrendingDown, Building2, Plus, ArrowDownRight } from 'lucide-react'
import BlurText from '@/components/ui/blur-text'
import { Steps } from '@vibe/core'
import '@vibe/core/tokens' // Import Vibe CSS

export function DashboardPreview() {
  const recentOrders = [
    {
      id: 'ORD-2026-089',
      product: 'A4 Paper (80gsm) - Ream',
      category: 'Paper Products',
      quantity: 1200,
      unitPrice: 'ETB 145.00',
      marketPrice: 'ETB 168.00',
      savings: '13.7%',
      status: 'Confirmed',
      statusVariant: 'default' as const,
    },
    {
      id: 'ORD-2026-092',
      product: 'Ballpoint Pens (Blue, Box of 50)',
      category: 'Writing Tools',
      quantity: 450,
      unitPrice: 'ETB 210.00',
      marketPrice: 'ETB 255.00',
      savings: '17.6%',
      status: 'Pending Basket',
      statusVariant: 'secondary' as const,
    },
    {
      id: 'ORD-2026-095',
      product: 'Lever Arch Files (A4, 75mm)',
      category: 'Filing & Storage',
      quantity: 300,
      unitPrice: 'ETB 185.00',
      marketPrice: 'ETB 220.00',
      savings: '15.9%',
      status: 'Confirmed',
      statusVariant: 'default' as const,
    },
    {
      id: 'ORD-2026-098',
      product: 'Heavy Duty Stapler (100 Sheets)',
      category: 'Office Equipment',
      quantity: 40,
      unitPrice: 'ETB 620.00',
      marketPrice: 'ETB 710.00',
      savings: '12.6%',
      status: 'Out for Delivery',
      statusVariant: 'outline' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xs sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg shadow-sm">
              B
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight block">Babi Procurement</span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">Merkato Group Purchasing</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs px-2.5 py-1">
              Addis Ababa University
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              August Basket Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Consolidated procurement orders and dynamic wholesale pricing updates.
            </p>
          </div>
          <Button size="lg" className="w-full sm:w-auto shadow-sm gap-2">
            <Plus className="size-4" />
            Join Active Basket
          </Button>
        </div>

        {/* 3 Statistic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Stat Card 1 */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Basket Volume
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <ShoppingBag className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <BlurText
                  text="3,450 Reams"
                  delay={50}
                  className="text-2xl font-bold tracking-tight font-mono text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: 4,000 Reams for next discount tier
                </p>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Current Phase</span>
                  <span className="font-mono">Bidding</span>
                </div>
                {/* Vibe Steps overriding shadcn Progress */}
                <Steps 
                  activeStepIndex={1}
                  steps={[
                    <div key="1" title="Sourcing">Sourcing</div>,
                    <div key="2" title="Bidding">Bidding</div>,
                    <div key="3" title="Fulfillment">Fulfillment</div>
                  ]}
                  areNavigationButtonsHidden
                  type="gallery"
                  color="primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stat Card 2 */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Savings Generated
              </CardTitle>
              <div className="p-2 bg-accent/10 rounded-md text-accent">
                <TrendingDown className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <BlurText
                  text="ETB 48,200"
                  delay={100}
                  className="text-2xl font-bold tracking-tight font-mono text-foreground"
                />
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-xs gap-0.5 px-1.5 py-0 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                    <ArrowDownRight className="size-3" /> 14.8%
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs Merkato retail list price</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                Average ETB 2,680 saved per participating institution.
              </p>
            </CardContent>
          </Card>

          {/* Stat Card 3 */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participating Institutions
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <Building2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <BlurText
                  text="18 Orgs"
                  delay={150}
                  className="text-2xl font-bold tracking-tight font-mono text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Schools, Universities & Government Offices
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">
                  3 new orders submitted in last 24 hours
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table Section */}
        <Card>
          <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-semibold">Active Basket Orders</CardTitle>
                <CardDescription>
                  Current product commitments aggregated across participating organizations.
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit text-xs font-normal">
                Updated Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Ref</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Basket Unit Price</TableHead>
                  <TableHead className="text-right">Retail Market Price</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{order.product}</div>
                      <div className="text-xs text-muted-foreground">{order.category}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {order.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-primary">
                      {order.unitPrice}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground line-through">
                      {order.marketPrice}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20">
                        -{order.savings}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={order.statusVariant} className="text-xs">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
