import { useState } from 'react'
import { History, Download, RotateCcw, Truck, CheckCircle2, Package } from 'lucide-react'
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

type OrderStatus = 'Delivered' | 'Out for Delivery' | 'Confirmed' | 'Purchased' | 'Packed'

const STATUS_STYLES: Record<OrderStatus, string> = {
  'Delivered':       'text-muted-foreground bg-surface-muted',
  'Out for Delivery':'text-info bg-info-bg',
  'Confirmed':       'text-success bg-success-bg',
  'Purchased':       'text-primary bg-primary-subtle',
  'Packed':          'text-accent bg-accent-subtle',
}

const STATUS_ICONS: Record<OrderStatus, React.FC<{ className?: string }>> = {
  'Delivered':        CheckCircle2,
  'Out for Delivery': Truck,
  'Confirmed':        CheckCircle2,
  'Purchased':        Package,
  'Packed':           Package,
}

const ORDERS = [
  {
    id: 'ORD-2026-098',
    type: 'Direct',
    product: 'Sinar Line A4 Paper',
    brand: 'Double A',
    qty: 120,
    unit: 'ream',
    unitPrice: 820,
    total: 98400,
    savings: 19800,
    date: '2026-08-02',
    status: 'Out for Delivery' as OrderStatus,
  },
  {
    id: 'BSK-2026-082-W',
    type: 'Basket',
    product: '05A HP Toner Ink',
    brand: 'HP Original',
    qty: 12,
    unit: 'cartridge',
    unitPrice: 2050,
    total: 24600,
    savings: 4800,
    date: '2026-07-28',
    status: 'Confirmed' as OrderStatus,
  },
  {
    id: 'ORD-2026-089',
    type: 'Direct',
    product: 'Box File Kent',
    brand: 'Kent',
    qty: 80,
    unit: 'piece',
    unitPrice: 118,
    total: 9440,
    savings: 2160,
    date: '2026-07-15',
    status: 'Delivered' as OrderStatus,
  },
  {
    id: 'BSK-2026-075-M',
    type: 'Basket',
    product: 'Sinar Line A4 Paper',
    brand: 'Sinar Line',
    qty: 200,
    unit: 'ream',
    unitPrice: 798,
    total: 159600,
    savings: 37400,
    date: '2026-06-30',
    status: 'Delivered' as OrderStatus,
  },
  {
    id: 'ORD-2026-061',
    type: 'Direct',
    product: 'Ledger Book',
    brand: 'Premium Hardcover',
    qty: 30,
    unit: 'piece',
    unitPrice: 348,
    total: 10440,
    savings: 2160,
    date: '2026-06-05',
    status: 'Delivered' as OrderStatus,
  },
]

export function OrderHistoryPage() {
  const [filter, setFilter] = useState('all')

  const filtered = ORDERS.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'direct') return o.type === 'Direct'
    if (filter === 'basket') return o.type === 'Basket'
    return o.status.toLowerCase().includes(filter)
  })

  const totalSavings = ORDERS.reduce((s, o) => s + o.savings, 0)
  const totalSpend = ORDERS.reduce((s, o) => s + o.total, 0)

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Order History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">All your direct purchases and completed basket orders.</p>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">Total Spend (YTD)</p>
              <p className="text-xl font-bold text-foreground font-mono mt-1">ETB {totalSpend.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">Total Savings (YTD)</p>
              <p className="text-xl font-bold text-success font-mono mt-1">ETB {totalSavings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-foreground font-mono mt-1">{ORDERS.length} orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="direct">Direct Purchase</SelectItem>
              <SelectItem value="basket">Basket Orders</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="delivery">Out for Delivery</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} order(s)</span>
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {filtered.map((o) => {
            const StatusIcon = STATUS_ICONS[o.status]
            return (
              <Card key={o.id} className="border-border hover:border-border/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${STATUS_STYLES[o.status]}`}>
                      <StatusIcon className="w-4.5 h-4.5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{o.product}</p>
                        <Badge variant="outline" className={`text-[10px] ${o.type === 'Basket' ? 'border-primary text-primary' : 'border-info text-info'}`}>
                          {o.type}
                        </Badge>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {o.id} · {o.brand} · {o.qty} {o.unit}s · {o.date}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono">Total</p>
                        <p className="text-sm font-bold text-foreground font-mono">ETB {o.total.toLocaleString()}</p>
                        <p className="text-[11px] text-success font-mono">saved ETB {o.savings.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                          <Download className="w-3 h-3" />
                          Invoice
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                          <RotateCcw className="w-3 h-3" />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
