import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
  X,
  User,
  Phone,
  FileCheck,
  MapPin,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAdminAccessToken,
  selectAdminAuthLoading,
  selectIsAdminAuthenticated,
  selectIsAdminInitialized,
} from '@/store/adminSlices/adminAuthSlice'
import {
  fetchAdminOrders,
  setAdminOrdersFilterStatus,
  setAdminOrdersPage,
  selectAdminOrdersState,
  updateAdminOrderStatus,
} from '@/store/adminSlices/adminOrdersSlice'
import type { Order } from '@/types/api'

function AdminOrdersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-[#161b22] rounded border border-[#30363d]" />
      <div className="h-14 bg-[#161b22] rounded border border-[#30363d]" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-[#161b22] rounded border border-[#30363d]" />
        ))}
      </div>
    </div>
  )
}

export function AdminOrdersPage() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAdminAccessToken)
  const isAuthenticated = useAppSelector(selectIsAdminAuthenticated)
  const authLoading = useAppSelector(selectAdminAuthLoading)
  const authInitialized = useAppSelector(selectIsAdminInitialized)

  const { orders, filterStatus, currentPage, totalPages, totalOrders, loading, initialized } =
    useAppSelector(selectAdminOrdersState)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const authReady = authInitialized && !authLoading && isAuthenticated && Boolean(accessToken)

  // Poll backend every 5 seconds for real-time status sync without race conditions
  useEffect(() => {
    if (!authReady) return
    dispatch(fetchAdminOrders({ status: filterStatus, page: currentPage }))
  }, [dispatch, authReady, filterStatus, currentPage])

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    if (newStatus === 'cancelled') {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel this order? This action is PERMANENT and cannot be undone.'
      )
      if (!confirmCancel) return
    }

    setUpdatingId(orderId)
    try {
      await dispatch(updateAdminOrderStatus({ orderId, status: newStatus })).unwrap()
      toast.success(`Order status updated to ${newStatus}`)
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter local orders by search query (order number or buyer name)
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const num = o.orderNumber?.toLowerCase() || ''
    const buyer = (o.customer?.name || '').toLowerCase()
    const org = (o.customer?.organization || '').toLowerCase()
    return num.includes(q) || buyer.includes(q) || org.includes(q)
  })

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toLowerCase()
    if (s === 'pending') {
      return (
        <Badge variant="outline" className="bg-[#2d2417] text-[#e3b341] border-[#d29922] text-xs">
          Pending
        </Badge>
      )
    }
    if (s === 'accepted') {
      return (
        <Badge variant="outline" className="bg-[#12261e] text-[#3fb950] border-[#238636] text-xs">
          Accepted
        </Badge>
      )
    }
    if (s === 'out-for-delivery' || s === 'out_for_delivery') {
      return (
        <Badge variant="outline" className="bg-[#1c1d36] text-[#a371f7] border-[#8957e5] text-xs">
          Out for Delivery
        </Badge>
      )
    }
    if (s === 'delivered') {
      return (
        <Badge variant="outline" className="bg-[#12261e] text-[#3fb950] border-[#238636] text-xs">
          Delivered
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-[#2d171a] text-[#f85149] border-[#f85149] text-xs">
        {statusStr}
      </Badge>
    )
  }

  return (
    <AdminLayout>
      {!authInitialized || authLoading ? (
        <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
          <AdminOrdersSkeleton />
        </div>
      ) : !authReady ? (
        <div className="max-w-3xl mx-auto">
          <Card className="border-[#30363d] bg-[#161b22]">
            <CardContent className="p-5 sm:px-6 space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-[#f0f6fc]">Session expired</h2>
              <p className="text-sm text-[#8b949e]">
                The admin session is not authenticated yet. Please sign in again to view orders.
              </p>
              <Button
                className="mt-2 bg-[#238636] hover:bg-[#2ea043] text-[#f0f6fc]"
                onClick={() => {
                  window.location.href = '/admin/login'
                }}
              >
                Go to admin login
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#f0f6fc]" />
                Order Processing & Fulfillment Center
              </h1>
              <p className="text-sm text-[#8b949e] mt-0.5">
                Review institutional purchase orders, dispatch bulk deliveries, and generate procurement invoices.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order # or buyer..."
                className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#f0f6fc]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-[#8b949e]">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => dispatch(setAdminOrdersFilterStatus(e.target.value))}
                  className="min-w-0 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] px-2 py-2 focus:outline-none focus:border-[#f0f6fc]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dispatch(fetchAdminOrders({ status: filterStatus, page: currentPage }))}
                  className="text-xs border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <span className="text-sm text-[#8b949e] font-mono whitespace-nowrap">
                Total: {totalOrders} orders
              </span>
            </div>
          </div>

          {/* Orders Table */}
          {loading || !initialized ? (
            <AdminOrdersSkeleton />
          ) : (
            <div className="space-y-3">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-[#30363d] bg-[#161b22]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#30363d] text-[#8b949e] font-mono bg-[#0d1117]/50">
                      <th className="p-4">Order #</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#8b949e]">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className="text-[#c9d1d9] hover:bg-[#21262d]/60 cursor-pointer transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-[#f0f6fc]">{ord.orderNumber}</td>
                          <td className="p-4 font-mono text-[#8b949e] text-sm">{ord.date}</td>
                          <td className="p-4 font-mono font-bold text-[#f0f6fc] text-sm">
                            ETB {ord.pricing.total.toLocaleString()}
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            {ord.status.toLowerCase() === 'cancelled' ? (
                              <Badge variant="outline" className="bg-[#361c1c] text-[#f85149] border-[#f85149] text-xs">
                                Cancelled (Final)
                              </Badge>
                            ) : (
                              <select
                                value={ord.status}
                                disabled={updatingId === ord.id}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                className="bg-[#0d1117] border border-[#30363d] text-xs text-[#f0f6fc] rounded px-2 py-1.5 focus:outline-none focus:border-[#f0f6fc]"
                              >
                                <option value="pending">pending</option>
                                <option value="accepted">accepted</option>
                                <option value="out-for-delivery">out-for-delivery</option>
                                <option value="delivered">delivered</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            )}
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-start gap-2">

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(ord)}
                                className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 hover:text-[#f0f6fc]"
                              >
                                Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-3">
                {filteredOrders.map((ord) => (
                  <Card
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="border-[#30363d] bg-[#161b22] hover:bg-[#21262d]/80 transition-all cursor-pointer"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-mono font-bold text-sm text-[#f0f6fc]">{ord.orderNumber}</h3>
                        <p className="text-[13px] text-[#8b949e] font-mono">{ord.date}</p>
                      </div>

                      <div className="text-sm border-t border-[#30363d] pt-2">
                        <p className="font-semibold text-[#f0f6fc]">
                          {ord.customer?.organization || ord.customer?.name}
                        </p>
                        <p className="text-xs text-[#8b949e] font-mono">TIN: {ord.customer?.tinNumber || '—'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-sm">
                        <span className="text-sm text-[#8b949e] font-mono">Direct Total</span>
                        <span className="font-mono font-bold text-[#f0f6fc]">
                          ETB {ord.pricing.total.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        {ord.status.toLowerCase() === 'cancelled' ? (
                          <Badge variant="outline" className="w-full justify-center bg-[#361c1c] text-[#f85149] border-[#f85149] text-xs py-1.5">
                            Cancelled (Final)
                          </Badge>
                        ) : (
                          <select
                            value={ord.status}
                            disabled={updatingId === ord.id}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className="w-full bg-[#0d1117] border border-[#30363d] text-xs text-[#f0f6fc] rounded px-3 py-2 focus:outline-none focus:border-[#f0f6fc]"
                          >
                            <option value="pending">pending</option>
                            <option value="accepted">accepted</option>
                            <option value="out-for-delivery">out-for-delivery</option>
                            <option value="delivered">delivered</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(ord)}
                          className="w-full text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10"
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Bar */}
              <div className="p-4 border border-[#30363d] bg-[#161b22] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-sm text-[#8b949e] font-mono">
                  Showing {filteredOrders.length} of {totalOrders} orders
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => dispatch(setAdminOrdersPage(Math.max(1, currentPage - 1)))}
                    className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => dispatch(setAdminOrdersPage(pageNum))}
                        className={`w-8 h-8 rounded text-sm font-mono font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#238636] text-[#f0f6fc] font-bold'
                            : 'bg-[#0d1117] text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => dispatch(setAdminOrdersPage(Math.min(totalPages, currentPage + 1)))}
                    className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5 disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Order Details & Customer Profile Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <Card className="w-full max-w-2xl border-[#30363d] bg-[#161b22] shadow-2xl my-auto">
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#30363d]">
                  <div>
                    <CardTitle className="text-base text-[#f0f6fc] font-semibold flex items-center gap-2 font-mono">
                      <Layers className="w-5 h-5 text-[#f0f6fc]" />
                      Order Details: {selectedOrder.orderNumber}
                    </CardTitle>
                    <CardDescription className="text-sm text-[#8b949e]">
                      Date: {selectedOrder.date} • Status: {selectedOrder.status}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedOrder(null)}
                    className="text-[#8b949e] hover:text-[#f0f6fc]"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardHeader>

                <CardContent className="p-4 sm:px-6 space-y-5 text-sm">
                  {/* Customer & Organization Info */}
                  <div className="space-y-3 rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
                    <h4 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-[#8b949e]" /> Buyer Profile & Tax Info
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#8b949e] block">Organization / Buyer Name</span>
                        <span className="font-semibold text-[#f0f6fc] text-sm">
                          {selectedOrder.customer?.organization || selectedOrder.customer?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block">TIN Number</span>
                        <span className="font-mono text-[#f0f6fc]">
                          {selectedOrder.customer?.tinNumber || '1234567890'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block">Phone Contact</span>
                        <span className="font-mono text-[#f0f6fc]">
                          {selectedOrder.customer?.phoneNumber || '0911234567'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8b949e]" /> Delivery Address
                        </span>
                        <span className="text-[#c9d1d9]">
                          {selectedOrder.delivery?.address || 'Main Office, Addis Ababa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchased Items Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-wider">
                      Purchased Items Breakdown
                    </h4>
                    <div className="overflow-x-auto w-full border border-[#30363d] rounded-md bg-[#0d1117]">
                      <table className="w-full text-left text-xs min-w-[500px]">
                        <thead className="border-b border-[#30363d] text-[#8b949e] font-mono bg-[#161b22]">
                          <tr>
                            <th className="p-3">Product Name</th>
                            <th className="p-3">Brand</th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">Unit Price</th>
                            <th className="p-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
                          {selectedOrder.items.map((it, idx) => (
                            <tr key={idx} className="text-[#c9d1d9]">
                              <td className="p-3 font-medium text-[#f0f6fc]">{it.productName}</td>
                              <td className="p-3 text-[#8b949e]">{it.brandName}</td>
                              <td className="p-3 font-mono">
                                {it.quantity} {it.unit}s
                              </td>
                              <td className="p-3 font-mono">ETB {it.price.toLocaleString()}</td>
                              <td className="p-3 font-mono font-bold text-[#f0f6fc] text-right">
                                ETB {it.subtotal.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals & Export Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-3 border-t border-[#30363d]">
                    <div className="text-right w-full sm:w-auto border-t sm:border-t-0 border-[#30363d] pt-2 sm:pt-0">
                      <span className="text-xs text-[#8b949e] font-mono block">Order Grand Total</span>
                      <span className="text-lg font-bold font-mono text-[#f0f6fc]">
                        ETB {selectedOrder.pricing.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
