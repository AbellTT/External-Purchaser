import { useState } from 'react'
import { History, RotateCcw, Truck, CheckCircle2, Package, X, ChevronRight, Users, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

type OrderStatus = 'Delivered' | 'Out for Delivery' | 'Confirmed' | 'Purchased' | 'Packed'
type OrderType = 'Direct' | 'Basket'
type BasketType = 'Weekly' | 'Monthly' | '6-Month'

interface OrderItem {
  product: string
  brand: string
  qty: number
  unit: string
  unitPrice: number
}

interface Order {
  id: string
  type: OrderType
  date: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  savingsVsMarket: number
  savingsVsMerkato: number
  // Basket-specific fields
  basketType?: BasketType
  basketOpenDate?: string
  basketCloseDate?: string
  participants?: number
  regularMarketPrice?: number
  merkatoRetailerPrice?: number
  directPurchasePrice?: number
  finalBasketPrice?: number
}

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

const ORDERS: Order[] = [
  {
    id: 'ORD-2026-098',
    type: 'Direct',
    date: '2026-08-02',
    status: 'Out for Delivery',
    items: [
      { product: 'Sinar Line A4 Paper', brand: 'Double A', qty: 120, unit: 'ream', unitPrice: 820 },
      { product: 'Ballpoint Pen', brand: 'Pilot', qty: 50, unit: 'box', unitPrice: 195 },
    ],
    total: 108150,
    savingsVsMarket: 28750,
    savingsVsMerkato: 17250,
  },
  {
    id: 'BSK-2026-082-W',
    type: 'Basket',
    date: '2026-07-28',
    status: 'Confirmed',
    items: [
      { product: '05A HP Toner Ink', brand: 'HP Original', qty: 12, unit: 'cartridge', unitPrice: 2050 },
    ],
    total: 24600,
    savingsVsMarket: 6600,
    savingsVsMerkato: 4200,
    basketType: 'Weekly',
    basketOpenDate: '2026-07-15',
    basketCloseDate: '2026-07-28',
    participants: 9,
    regularMarketPrice: 2600,
    merkatoRetailerPrice: 2400,
    directPurchasePrice: 2150,
    finalBasketPrice: 2050,
  },
  {
    id: 'ORD-2026-089',
    type: 'Direct',
    date: '2026-07-15',
    status: 'Delivered',
    items: [
      { product: 'Box File Kent', brand: 'Kent', qty: 80, unit: 'piece', unitPrice: 118 },
      { product: 'Ledger Book', brand: 'Standard', qty: 15, unit: 'piece', unitPrice: 348 },
      { product: 'Stapler', brand: 'Kangaro', qty: 5, unit: 'piece', unitPrice: 580 },
    ],
    total: 17860,
    savingsVsMarket: 5420,
    savingsVsMerkato: 3180,
  },
  {
    id: 'BSK-2026-075-M',
    type: 'Basket',
    date: '2026-06-30',
    status: 'Delivered',
    items: [
      { product: 'Sinar Line A4 Paper', brand: 'Sinar Line', qty: 200, unit: 'ream', unitPrice: 798 },
    ],
    total: 159600,
    savingsVsMarket: 60400,
    savingsVsMerkato: 30800,
    basketType: 'Monthly',
    basketOpenDate: '2026-06-10',
    basketCloseDate: '2026-06-30',
    participants: 12,
    regularMarketPrice: 1100,
    merkatoRetailerPrice: 952,
    directPurchasePrice: 920,
    finalBasketPrice: 798,
  },
  {
    id: 'ORD-2026-061',
    type: 'Direct',
    date: '2026-06-05',
    status: 'Delivered',
    items: [
      { product: 'Ledger Book', brand: 'Premium Hardcover', qty: 30, unit: 'piece', unitPrice: 348 },
    ],
    total: 10440,
    savingsVsMarket: 2910,
    savingsVsMerkato: 1260,
  },
]

export function OrderHistoryPage() {
  const [filter, setFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const filtered = ORDERS
    .filter(o => o.type === 'Direct') // Only show direct purchase orders
    .filter((o) => {
      if (filter === 'all') return true
      return o.status.toLowerCase().includes(filter)
    })

  const selectedOrder = ORDERS.find(o => o.id === selectedOrderId)

  const directOrders = ORDERS.filter(o => o.type === 'Direct')
  const totalSavingsVsMarket = directOrders.reduce((s, o) => s + o.savingsVsMarket, 0)
  const totalSavingsVsMerkato = directOrders.reduce((s, o) => s + o.savingsVsMerkato, 0)
  const totalSpend = directOrders.reduce((s, o) => s + o.total, 0)

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Order History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">All your direct purchases (excluding basket orders).</p>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">Total Spend (YTD)</p>
              <p className="text-xl font-bold text-foreground font-mono mt-1">ETB {totalSpend.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">Total Savings (YTD)</p>
              <div className="space-y-0.5 mt-1">
                <p className="text-sm font-bold text-success font-mono">ETB {totalSavingsVsMarket.toLocaleString()} vs Regular Market</p>
                <p className="text-sm font-bold text-success font-mono">ETB {totalSavingsVsMerkato.toLocaleString()} vs Merkato Retailers</p>
              </div>
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
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="delivery">Out for Delivery</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} order(s)</span>
        </div>

        {/* Orders - Simplified Cards */}
        <div className="space-y-3">
          {filtered.map((o) => {
            const StatusIcon = STATUS_ICONS[o.status]
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
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${STATUS_STYLES[o.status]}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-foreground font-mono">{o.id}</p>
                        <Badge variant="outline" className={`text-[10px] ${o.type === 'Basket' ? 'border-primary text-primary' : 'border-info text-info'}`}>
                          {o.type}
                        </Badge>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {itemCount === 1 ? firstItem.product : `${itemCount} products`} · {o.date}
                      </p>
                    </div>

                    {/* Total & Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-mono">Total</p>
                        <p className="text-lg font-bold text-foreground font-mono">ETB {o.total.toLocaleString()}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detailed Order View Modal/Panel */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrderId(null)}>
            <Card 
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="pb-4 border-b border-border sticky top-0 bg-card z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-mono">{selectedOrder.id}</CardTitle>
                      <Badge variant="outline" className={`text-[10px] ${selectedOrder.type === 'Basket' ? 'border-primary text-primary' : 'border-info text-info'}`}>
                        {selectedOrder.type}
                      </Badge>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedOrder.date}</span>
                      {selectedOrder.type === 'Basket' && selectedOrder.participants && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selectedOrder.participants} organizations</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedOrderId(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Basket-specific info */}
                {selectedOrder.type === 'Basket' && (
                  <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">Basket Details</p>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Basket Type:</p>
                        <p className="font-semibold text-foreground">{selectedOrder.basketType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Opened:</p>
                        <p className="font-semibold text-foreground">{selectedOrder.basketOpenDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Closed:</p>
                        <p className="font-semibold text-foreground">{selectedOrder.basketCloseDate}</p>
                      </div>
                    </div>
                  </div>
                )}

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
                          <p className="text-sm font-semibold text-foreground">{item.product}</p>
                          <p className="text-xs text-muted-foreground">{item.brand} · {item.qty} {item.unit}(s) × ETB {item.unitPrice}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-foreground font-mono">ETB {(item.qty * item.unitPrice).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown for Baskets */}
                {selectedOrder.type === 'Basket' && selectedOrder.regularMarketPrice && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Price Comparison (per unit)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">Regular Market</p>
                        <p className="text-sm font-bold text-foreground font-mono">ETB {selectedOrder.regularMarketPrice}</p>
                      </div>
                      <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">Merkato Retailer</p>
                        <p className="text-sm font-bold text-foreground font-mono">ETB {selectedOrder.merkatoRetailerPrice}</p>
                      </div>
                      <div className="bg-surface-muted rounded-lg border border-border p-3 text-center">
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">Direct Purchase</p>
                        <p className="text-sm font-bold text-foreground font-mono">ETB {selectedOrder.directPurchasePrice}</p>
                      </div>
                      <div className="bg-success-bg rounded-lg border border-success/30 p-3 text-center">
                        <p className="text-[10px] text-success font-mono mb-1 font-semibold">Final Basket Price</p>
                        <p className="text-sm font-bold text-success font-mono">ETB {selectedOrder.finalBasketPrice}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total & Savings */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="font-bold text-foreground font-mono text-lg">ETB {selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="bg-success-bg border border-success/20 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-success uppercase tracking-wide">Your Savings</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">vs Regular Stationery Market</span>
                      <span className="font-bold text-success font-mono">ETB {selectedOrder.savingsVsMarket.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">vs Merkato Retailers</span>
                      <span className="font-bold text-success font-mono">ETB {selectedOrder.savingsVsMerkato.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedOrder.type === 'Direct' && (
                  <div className="border-t border-border pt-4">
                    <Button className="w-full gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reorder These Items
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
