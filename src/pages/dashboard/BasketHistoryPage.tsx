import { useState } from 'react'
import { ShoppingBag, Calendar, TrendingDown, Package, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

// Mock basket history data
const BASKET_HISTORY = [
  {
    id: '1',
    basketNumber: 'BSK-2026/07/25-X7Y9A',
    name: 'Weekly A4 Paper Basket',
    type: 'weekly',
    status: 'completed',
    brand: {
      brandName: 'Sinar Line',
      productName: 'A4 Paper',
      brandImageUrl: '/placeholder-product.png',
    },
    yourOrder: {
      quantity: 50,
      unit: 'ream',
      unitPrice: 820,
      subtotal: 41000,
    },
    completedDate: '2026-07-28',
    deliveryDate: '2026-07-30',
    pricing: {
      basketPrice: 820,
      directPurchasePrice: 920,
      merkato_retailer_price: 952,
      regular_stationary_market_price: 985,
    },
    savings: {
      vsDirectPurchase: {
        amount: 5000,
        percentage: 10.9,
      },
      vsMerkatoRetailer: {
        amount: 6600,
        percentage: 13.9,
      },
      vsRegularStationaryMarket: {
        amount: 8250,
        percentage: 16.8,
      },
    },
  },
  {
    id: '2',
    basketNumber: 'BSK-2026/06/15-A3B8C',
    name: 'Monthly HP Toner Basket',
    type: 'monthly',
    status: 'completed',
    brand: {
      brandName: '05A HP',
      productName: 'Toner Ink',
      brandImageUrl: '/placeholder-product.png',
    },
    yourOrder: {
      quantity: 8,
      unit: 'cartridge',
      unitPrice: 2050,
      subtotal: 16400,
    },
    completedDate: '2026-06-20',
    deliveryDate: '2026-06-22',
    pricing: {
      basketPrice: 2050,
      directPurchasePrice: 2150,
      merkato_retailer_price: 2300,
      regular_stationary_market_price: 2450,
    },
    savings: {
      vsDirectPurchase: {
        amount: 800,
        percentage: 4.7,
      },
      vsMerkatoRetailer: {
        amount: 2000,
        percentage: 10.9,
      },
      vsRegularStationaryMarket: {
        amount: 3200,
        percentage: 13.1,
      },
    },
  },
  {
    id: '3',
    basketNumber: 'BSK-2026/05/10-Z9K4M',
    name: 'Weekly Box File Basket',
    type: 'weekly',
    status: 'cancelled',
    brand: {
      brandName: 'KENT',
      productName: 'Box File',
      brandImageUrl: '/placeholder-product.png',
    },
    yourOrder: {
      quantity: 0,
      unit: 'piece',
      unitPrice: 0,
      subtotal: 0,
    },
    completedDate: '2026-05-12',
    deliveryDate: null,
    pricing: {
      basketPrice: 118,
      directPurchasePrice: 128,
      merkato_retailer_price: 136,
      regular_stationary_market_price: 145,
    },
    savings: {
      vsDirectPurchase: {
        amount: 0,
        percentage: 0,
      },
      vsMerkatoRetailer: {
        amount: 0,
        percentage: 0,
      },
      vsRegularStationaryMarket: {
        amount: 0,
        percentage: 0,
      },
    },
  },
]

export function BasketHistoryPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredBaskets = BASKET_HISTORY.filter((basket) => {
    if (statusFilter === 'all') return true
    return basket.status === statusFilter
  })

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
            View your completed and cancelled basket participations
          </p>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-foreground">Filter by status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          {filteredBaskets.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No basket history found</p>
              </CardContent>
            </Card>
          ) : (
            filteredBaskets.map((basket) => (
              <Card key={basket.id} className="border-border">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">{basket.name}</h3>
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
                      <p className="text-xs text-muted-foreground font-mono">{basket.basketNumber}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {basket.brand.brandName} — {basket.brand.productName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {basket.type === 'weekly' ? 'Weekly' : basket.type === 'monthly' ? 'Monthly' : '6-Month'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Grid */}
                  {basket.status === 'completed' ? (
                    <div className="space-y-5">
                      {/* Your Order Summary */}
                      <div className="bg-surface-muted border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          <Package className="w-3.5 h-3.5" />
                          Your Order
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                            <p className="text-sm font-semibold text-foreground">{basket.yourOrder.quantity} {basket.yourOrder.unit}s</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                            <p className="text-sm font-mono text-foreground">ETB {basket.yourOrder.unitPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                            <p className="text-sm font-bold text-foreground">ETB {basket.yourOrder.subtotal.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price Comparison - 4 Grid */}
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
                            <p className="text-sm font-bold text-foreground font-mono">ETB {basket.pricing.directPurchasePrice}</p>
                          </div>
                          <div className="bg-success-bg rounded-lg border border-success/30 p-3 text-center">
                            <p className="text-[10px] text-success font-mono mb-1 font-semibold">Final Basket Price</p>
                            <p className="text-sm font-bold text-success font-mono">ETB {basket.pricing.basketPrice}</p>
                          </div>
                        </div>
                      </div>

                      {/* Savings Breakdown */}
                      <div className="bg-success-bg border border-success/20 rounded-lg p-4">
                        <p className="font-semibold text-success text-xs uppercase tracking-wide mb-3">Your Savings ({basket.yourOrder.quantity} {basket.yourOrder.unit}s)</p>
                        <div className="grid sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">vs Regular Market</p>
                            <p className="font-bold text-success font-mono">ETB {basket.savings.vsRegularStationaryMarket.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">vs Merkato Retailers</p>
                            <p className="font-bold text-success font-mono">ETB {basket.savings.vsMerkatoRetailer.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">vs Direct Purchase</p>
                            <p className="font-bold text-success font-mono">ETB {basket.savings.vsDirectPurchase.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-surface-muted border border-border">
                      <p className="text-sm text-muted-foreground text-center">
                        This basket was cancelled and no order was placed
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Completed: {new Date(basket.completedDate).toLocaleDateString()}</span>
                    </div>
                    {basket.deliveryDate && (
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        <span>Delivered: {new Date(basket.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
