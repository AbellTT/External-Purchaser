import { useState } from 'react'
import { ShoppingCart, Printer, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAdminOrders, updateOrderStatus } from '@/store/slices/adminSlice'
import type { Order } from '@/types/api'

export function AdminOrdersPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectAdminOrders)

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus)

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              Order Processing & Fulfillment Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review institutional purchase orders, dispatch bulk deliveries, and generate procurement invoices.
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'accepted', 'out-for-delivery', 'delivered'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status)}
              className={`text-xs capitalize ${
                filterStatus === status
                  ? 'bg-blue-600 text-white hover:bg-blue-500 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status.replace('-', ' ')}
            </Button>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="py-4 px-6 border-b border-slate-800">
            <CardTitle className="text-sm text-white">Institutional Orders List ({filteredOrders.length})</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Update status stages step-by-step as products are acquired from Merkato suppliers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/40">
                    <th className="p-4">Order #</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Total Value</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="text-slate-300 hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-400">{ord.orderNumber}</td>
                      <td className="p-4 font-mono text-slate-400">{ord.date}</td>
                      <td className="p-4 max-w-xs">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="truncate text-slate-200">
                            • {it.quantity} {it.unit}s x {it.productName} ({it.brandName})
                          </div>
                        ))}
                      </td>
                      <td className="p-4 font-mono font-bold text-white">ETB {ord.pricing.total.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={
                            ord.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : ord.status === 'accepted'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : ord.status === 'out-for-delivery'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }
                        >
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              dispatch(
                                updateOrderStatus({
                                  orderId: ord.id,
                                  status: e.target.value as any,
                                })
                              )
                            }
                            className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                          >
                            <option value="pending">pending</option>
                            <option value="accepted">accepted</option>
                            <option value="out-for-delivery">out-for-delivery</option>
                            <option value="delivered">delivered</option>
                            <option value="cancelled">cancelled</option>
                          </select>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(ord)}
                            className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Order Details & Invoice View Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl border-slate-800 bg-slate-900 shadow-2xl">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-white font-mono">
                      Order Details: {selectedOrder.orderNumber}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Date: {selectedOrder.date} • Status: {selectedOrder.status}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">Delivery Destination Address</h4>
                  <p className="text-slate-400 bg-slate-950 p-3 rounded border border-slate-800">
                    {selectedOrder.delivery.address}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Purchased Items Breakdown</h4>
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="p-3">Item</th>
                          <th className="p-3">Brand</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3">Unit Price</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedOrder.items.map((it, idx) => (
                          <tr key={idx} className="text-slate-300">
                            <td className="p-3 font-medium text-white">{it.productName}</td>
                            <td className="p-3 text-slate-400">{it.brandName}</td>
                            <td className="p-3 font-mono">{it.quantity} {it.unit}s</td>
                            <td className="p-3 font-mono">ETB {it.price}</td>
                            <td className="p-3 font-mono font-bold text-white text-right">ETB {it.subtotal.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => alert(`Printing official purchase order for ${selectedOrder.orderNumber}`)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Official PO
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Downloading VAT Invoice PDF for ${selectedOrder.orderNumber}`)}
                      className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Generate VAT Invoice
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-mono">Grand Total</p>
                    <p className="text-lg font-bold font-mono text-emerald-400">
                      ETB {selectedOrder.pricing.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
