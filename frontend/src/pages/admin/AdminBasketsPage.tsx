import { useEffect, useState, useRef, useCallback } from 'react'
import {
  ShoppingBag,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Lock,
  XCircle,
  Users,
  Calendar,
  Layers,
  Truck,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '@/lib/adminApi'
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
  fetchAdminBaskets,
  createAdminBasket,
  closeAdminBasket,
  cancelAdminBasket,
  updateAdminBasketDelivery,
  setFilterStatus,
  setFilterDuration,
  selectAdminBaskets,
  selectAdminBasketsSummary,
  selectAdminBasketsPagination,
  selectAdminBasketsLoading,
  selectAdminBasketsFilterStatus,
  selectAdminBasketsFilterDuration,
} from '@/store/adminSlices/adminBasketsSlice'
import {
  selectProductsPricingProducts,
} from '@/store/adminSlices/productsPricingSlice'

const DURATION_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly Pool',
  MONTHLY: 'Monthly Pool',
  SIX_MONTH: '6-Month Pool',
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'border-[#238636] bg-[#238636]/10 text-[#3fb950]',
  COMPLETED: 'border-[#1f6beb] bg-[#1f6beb]/10 text-[#58a6ff]',
  CLOSED: 'border-[#8b949e] bg-[#8b949e]/10 text-[#8b949e]',
  DRAFT: 'border-[#d29922] bg-[#d29922]/10 text-[#d29922]',
  CANCELLED: 'border-[#da3633] bg-[#da3633]/10 text-[#f85149]',
}

export function AdminBasketsPage() {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAdminAccessToken)
  const isAuthenticated = useAppSelector(selectIsAdminAuthenticated)
  const authLoading = useAppSelector(selectAdminAuthLoading)
  const isInitialized = useAppSelector(selectIsAdminInitialized)

  const baskets = useAppSelector(selectAdminBaskets)
  const summary = useAppSelector(selectAdminBasketsSummary)
  const pagination = useAppSelector(selectAdminBasketsPagination)
  const loading = useAppSelector(selectAdminBasketsLoading)
  const filterStatus = useAppSelector(selectAdminBasketsFilterStatus)
  const filterDuration = useAppSelector(selectAdminBasketsFilterDuration)
  const catalogProducts = useAppSelector(selectProductsPricingProducts)

  const [searchQuery, setSearchQuery] = useState('')

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [basketName, setBasketName] = useState('')
  const [durationType, setDurationType] = useState('WEEKLY')
  const [targetQuantity, setTargetQuantity] = useState('100')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [publishImmediately, setPublishImmediately] = useState(true)

  // Fulfill/Close Modal State
  const [fulfillBasketId, setFulfillBasketId] = useState<number | null>(null)
  const [fulfillBasketName, setFulfillBasketName] = useState('')
  const [babiPlatformPriceInput, setBabiPlatformPriceInput] = useState('')
  const [supplierCostInput, setSupplierCostInput] = useState('')

  // Delivery Modal State
  const [deliveryBasket, setDeliveryBasket] = useState<any | null>(null)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [carrierName, setCarrierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState('SCHEDULED')

  // Cancel Confirmation Custom Dialog State
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState<{ id: number; name: string } | null>(null)

  const hasFetched = useRef(false)
  const authReady = isInitialized && isAuthenticated && !!token

  const [allProductsList, setAllProductsList] = useState<any[]>([])

  const loadData = useCallback(
    (page = 1, silent = false) => {
      if (!authReady) return
      dispatch(
        fetchAdminBaskets({
          status: filterStatus,
          duration_type: filterDuration,
          search: searchQuery,
          page,
          silent,
        })
      )
      adminApi
        .get('/products/?pageSize=100')
        .then((res) => {
          if (res.data?.data?.products) {
            setAllProductsList(res.data.data.products)
          }
        })
        .catch(() => {})
    },
    [dispatch, authReady, filterStatus, filterDuration, searchQuery]
  )

  useEffect(() => {
    if (!authReady) return
    if (!hasFetched.current) {
      hasFetched.current = true
      loadData(1)
    }
  }, [authReady, loadData])

  useEffect(() => {
    if (!authReady) return
    loadData(1)
  }, [filterStatus, filterDuration, authReady, loadData])

  // Debounced search
  useEffect(() => {
    if (!authReady) return
    const timer = setTimeout(() => {
      loadData(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, authReady, loadData])

  // Selected product object
  const currentProduct = allProductsList.find(
    (p) => String(p.id) === String(selectedProductId)
  )
  const availableBrands = currentProduct?.brands || []
  const currentBrand = availableBrands.find(
    (b) => String(b.id) === String(selectedBrandId)
  )

  const autoMerkatoPrice = currentBrand?.merkatoRetailerPrice ?? currentProduct?.merkatoRetailerPrice ?? 0
  const autoRegularPrice = currentBrand?.regularMarketPrice ?? currentProduct?.regularMarketPrice ?? 0

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId)
    const prod = catalogProducts.find((p) => String(p.id) === String(prodId))
    if (prod && prod.brands && prod.brands.length > 0) {
      setSelectedBrandId(String(prod.brands[0].id))
    } else {
      setSelectedBrandId('')
    }
  }

  const handleCreateBasket = async () => {
    if (!basketName.trim()) {
      toast.error('Please enter a basket name.')
      return
    }
    if (!selectedProductId || !selectedBrandId) {
      toast.error('Please select both a Product and a Brand.')
      return
    }
    const tQty = parseInt(targetQuantity, 10)
    if (isNaN(tQty) || tQty <= 0) {
      toast.error('Please enter a valid target commitment quantity.')
      return
    }

    try {
      const res = await dispatch(
        createAdminBasket({
          name: basketName.trim(),
          durationType,
          targetQuantity: tQty,
          productId: selectedProductId,
          brandId: selectedBrandId,
          publish: publishImmediately,
        })
      ).unwrap()

      toast.success(res.message || 'Basket created successfully!')
      setShowCreateModal(false)
      setBasketName('')
      setSelectedProductId('')
      setSelectedBrandId('')
      setTargetQuantity('100')
      loadData(1)
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to create basket.')
    }
  }

  const handleOpenFulfillModal = (b: any) => {
    setFulfillBasketId(b.id)
    setFulfillBasketName(b.name)
    setBabiPlatformPriceInput(b.babiPlatformPrice ? String(b.babiPlatformPrice) : '')
    setSupplierCostInput(b.supplierCost ? String(b.supplierCost) : '')
  }

  const handleFulfillSubmit = async () => {
    if (!fulfillBasketId) return
    const bPrice = parseFloat(babiPlatformPriceInput)
    const sCost = parseFloat(supplierCostInput)

    if (isNaN(bPrice) || bPrice <= 0 || isNaN(sCost) || sCost <= 0) {
      toast.error('Please enter valid positive amounts for Babi Platform Price and Supplier Cost.')
      return
    }

    try {
      const res = await dispatch(
        closeAdminBasket({
          basketId: fulfillBasketId,
          babiPlatformPrice: bPrice,
          supplierCost: sCost,
        })
      ).unwrap()

      toast.success(res.message || 'Basket fulfilled and completed!')
      setFulfillBasketId(null)
      loadData(pagination.currentPage)
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to fulfill basket.')
    }
  }

  const handleConfirmCancel = async () => {
    if (!cancelConfirmTarget) return
    try {
      const res = await dispatch(cancelAdminBasket(cancelConfirmTarget.id)).unwrap()
      toast.success(res.message || 'Basket cancelled.')
      setCancelConfirmTarget(null)
      loadData(pagination.currentPage)
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to cancel basket.')
    }
  }

  const handleOpenDeliveryModal = (b: any) => {
    setDeliveryBasket(b)
    setDeliveryDate(b.deliveryDate || '')
    setCarrierName(b.carrierName || '')
    setTrackingNumber(b.trackingNumber || '')
    setDeliveryNotes(b.deliveryNotes || '')
    setDeliveryStatus(b.deliveryStatus || 'SCHEDULED')
  }

  const handleDeliverySubmit = async () => {
    if (!deliveryBasket) return
    try {
      const res = await dispatch(
        updateAdminBasketDelivery({
          basketId: deliveryBasket.id,
          deliveryDate,
          carrierName,
          trackingNumber,
          deliveryNotes,
          deliveryStatus,
        })
      ).unwrap()

      toast.success(res.message || 'Delivery details updated successfully!')
      setDeliveryBasket(null)
      loadData(pagination.currentPage)
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to update delivery details.')
    }
  }

  if (authLoading || !isInitialized) {
    return (
      <AdminLayout activePage="baskets">
        <div className="p-8 text-[#8b949e] font-mono text-sm">Loading admin authorization...</div>
      </AdminLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout activePage="baskets">
        <div className="p-8 text-[#f85149] font-mono text-sm">Access Denied. Please log in as Admin.</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activePage="baskets">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-[#2f81f7]" />
              Basket Control & Procurement
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
              Create pooled procurement baskets, monitor real-time commitments, and fulfill final wholesale pricing.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(pagination.currentPage)}
              className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs h-9 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-9 gap-1.5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Create Basket
            </Button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Total Baskets</p>
                <p className="text-lg font-bold font-mono text-[#f0f6fc] mt-0.5">{summary.total}</p>
              </div>
              <Layers className="w-5 h-5 text-[#8b949e]" />
            </CardContent>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Active Open</p>
                <p className="text-lg font-bold font-mono text-[#3fb950] mt-0.5">{summary.open}</p>
              </div>
              <ShoppingBag className="w-5 h-5 text-[#3fb950]" />
            </CardContent>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Fulfilled / Completed</p>
                <p className="text-lg font-bold font-mono text-[#58a6ff] mt-0.5">{summary.completed}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#58a6ff]" />
            </CardContent>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Drafts / Cancelled</p>
                <p className="text-lg font-bold font-mono text-[#d29922] mt-0.5">
                  {summary.draft + summary.cancelled}
                </p>
              </div>
              <XCircle className="w-5 h-5 text-[#d29922]" />
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search basket or product..."
              className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#f0f6fc]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Duration Type Filter Switch */}
            <div className="flex items-center gap-1.5 bg-[#0d1117] p-1 rounded border border-[#30363d]">
              <span className="text-[11px] font-mono text-[#8b949e] px-1">Duration:</span>
              {['ALL', 'WEEKLY', 'MONTHLY', 'SIX_MONTH'].map((dur) => (
                <button
                  key={dur}
                  onClick={() => dispatch(setFilterDuration(dur))}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    filterDuration === dur
                      ? 'bg-[#21262d] text-[#f0f6fc] font-bold border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-[#f0f6fc]'
                  }`}
                >
                  {dur === 'ALL' ? 'All' : dur === 'SIX_MONTH' ? '6-Month' : dur.charAt(0) + dur.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Status Filter Switch */}
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-mono text-[#8b949e] mr-1 hidden sm:inline">Status:</span>
              {['all', 'OPEN', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => dispatch(setFilterStatus(st))}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    filterStatus === st
                      ? 'bg-[#238636] text-white font-bold'
                      : 'bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Baskets Grid */}
        {loading && baskets.length === 0 ? (
          <div className="p-12 text-center text-[#8b949e] font-mono text-sm">
            Loading baskets...
          </div>
        ) : baskets.length === 0 ? (
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-[#8b949e] mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[#f0f6fc]">No procurement baskets found.</p>
              <p className="text-xs text-[#8b949e] mt-1">
                Try clearing search or filters, or click "Create Basket" to launch a new pool.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {baskets.map((b) => {
              const statusClass = STATUS_STYLES[b.status] || STATUS_STYLES.CLOSED

              return (
                <Card key={b.id} className="bg-[#161b22] border-[#30363d] hover:border-[#8b949e]/40 transition-colors">
                  <CardContent className="p-5 space-y-4">
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-[#f0f6fc]">{b.name}</h3>
                          <Badge variant="outline" className="text-xs border-[#30363d] text-[#8b949e] font-mono">
                            {DURATION_LABELS[b.durationType] || b.durationType}
                          </Badge>
                          <Badge className={`text-xs font-semibold ${statusClass}`}>
                            {b.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#8b949e] mt-1">
                          Product: <strong className="text-[#f0f6fc]">{b.productName}</strong> · Brand:{' '}
                          <strong className="text-[#f0f6fc]">{b.brandName}</strong>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {b.status === 'OPEN' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleOpenFulfillModal(b)}
                              className="bg-[#1f6beb] hover:bg-[#388bfd] text-white text-xs h-8 gap-1 font-semibold"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Lock & Fulfill
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCancelConfirmTarget({ id: b.id, name: b.name })}
                              className="border-[#da3633]/40 !bg-transparent text-[#f85149] hover:!bg-[#da3633]/10 text-xs h-8 gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel
                            </Button>
                          </>
                        )}

                        {b.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDeliveryModal(b)}
                            className="border-[#1f6beb]/40 !bg-transparent text-[#58a6ff] hover:!bg-[#1f6beb]/10 text-xs h-8 gap-1 font-semibold"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            {b.deliveryDate ? 'Edit Logistics' : 'Add Delivery Details'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 bg-[#0d1117] p-3 rounded border border-[#30363d]">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[#8b949e] flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#2f81f7]" />
                          Pooled Quantity: <strong className="text-[#f0f6fc]">{b.currentQuantity}</strong> / {b.targetQuantity} units
                        </span>
                        <span className="font-bold text-[#2f81f7]">{b.progressPercentage}%</span>
                      </div>

                      <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden border border-[#30363d]">
                        <div
                          className="bg-[#2f81f7] h-full transition-all duration-300"
                          style={{ width: `${Math.min(b.progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Participating Organizations Container Box */}
                    {b.participants && b.participants.length > 0 && (
                      <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d] space-y-2">
                        <span className="text-xs font-mono font-semibold text-[#8b949e] block uppercase tracking-wider">
                          Participating Institutional Organizations ({b.participants.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {b.participants.map((p, pIdx) => (
                            <Badge
                              key={pIdx}
                              variant="outline"
                              className="bg-[#161b22] border-[#30363d] text-[#f0f6fc] text-xs font-mono py-1 px-2.5"
                            >
                              {p.organizationName || p.userName} ({p.committed_quantity} units)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing Benchmark Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono p-3 bg-[#0d1117] rounded border border-[#30363d]">
                      <div>
                        <span className="text-[#8b949e] block text-[10px]">Merkato Retail Price:</span>
                        <span className="text-[#f0f6fc] font-semibold">ETB {b.merkatoRetailerPrice?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block text-[10px]">Regular Market Price:</span>
                        <span className="text-[#f0f6fc] font-semibold">ETB {b.regularMarketPrice?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block text-[10px]">Platform Basket Price:</span>
                        <span className="text-[#3fb950] font-bold">
                          {b.babiPlatformPrice ? `ETB ${b.babiPlatformPrice.toLocaleString()}` : 'Pending Fulfill'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block text-[10px]">Supplier Cost:</span>
                        <span className="text-[#58a6ff] font-semibold">
                          {b.supplierCost ? `ETB ${b.supplierCost.toLocaleString()}` : 'Pending Fulfill'}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Logistics Banner (If available) */}
                    {b.deliveryDate && (
                      <div className="bg-[#1f6beb]/10 border border-[#1f6beb]/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-[#58a6ff]">
                          <Truck className="w-4 h-4" />
                          <span>
                            <strong>Carrier:</strong> {b.carrierName || 'Platform Freight'} · <strong>Status:</strong>{' '}
                            {b.deliveryStatus}
                          </span>
                        </div>
                        <div className="text-[#8b949e]">
                          <strong>Est. Date:</strong> {b.deliveryDate} {b.trackingNumber && `· Tracking #: ${b.trackingNumber}`}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#30363d] pt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.currentPage <= 1}
              onClick={() => loadData(pagination.currentPage - 1)}
              className="border-[#30363d] text-[#f0f6fc] hover:bg-white/10 text-xs gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            <span className="text-xs text-[#8b949e] font-mono">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalBaskets} total pools)
            </span>

            <Button
              size="sm"
              variant="outline"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => loadData(pagination.currentPage + 1)}
              className="border-[#30363d] text-[#f0f6fc] hover:bg-white/10 text-xs gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* CREATE BASKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h2 className="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#238636]" />
                Create Procurement Basket
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8b949e] hover:text-[#f0f6fc] text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8b949e] block mb-1">Basket Name *</label>
                <input
                  type="text"
                  value={basketName}
                  onChange={(e) => setBasketName(e.target.value)}
                  placeholder="e.g. Q3 High-Volume Paper Ream Consortium"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#2f81f7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8b949e] block mb-1">Duration Type *</label>
                  <select
                    value={durationType}
                    onChange={(e) => setDurationType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#2f81f7]"
                  >
                    <option value="WEEKLY">Weekly Pool</option>
                    <option value="MONTHLY">Monthly Pool</option>
                    <option value="SIX_MONTH">6-Month Consortium</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8b949e] block mb-1">Target Commitment Qty *</label>
                  <input
                    type="number"
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#2f81f7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8b949e] block mb-1">Catalog Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#2f81f7]"
                >
                  <option value="">-- Select Catalog Product --</option>
                  {allProductsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unitOfMeasure || 'unit'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#8b949e] block mb-1">Product Brand *</label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  disabled={!selectedProductId || availableBrands.length === 0}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#2f81f7] disabled:opacity-50"
                >
                  <option value="">-- Select Brand --</option>
                  {availableBrands.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBrandId && (
                <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-xs space-y-1">
                  <span className="text-[#3fb950] font-bold block">Auto-Filled Benchmark Prices:</span>
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Merkato Retail Price:</span>
                    <strong className="text-[#f0f6fc]">ETB {autoMerkatoPrice.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Regular Market Price:</span>
                    <strong className="text-[#f0f6fc]">ETB {autoRegularPrice.toLocaleString()}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#30363d] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="border-[#30363d] !bg-transparent !text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBasket}
                size="sm"
                className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold"
              >
                Create & Launch Pool
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LOCK & FULFILL MODAL */}
      {fulfillBasketId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h2 className="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#1f6beb]" />
                Fulfill & Complete Basket
              </h2>
              <button
                onClick={() => setFulfillBasketId(null)}
                className="text-[#8b949e] hover:text-[#f0f6fc] text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#8b949e]">
              Enter the negotiated platform wholesale price for <strong>{fulfillBasketName}</strong>. This will complete the basket and update the Brand record catalog.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8b949e] block mb-1">Final Babi Platform Price (ETB) *</label>
                <input
                  type="number"
                  value={babiPlatformPriceInput}
                  onChange={(e) => setBabiPlatformPriceInput(e.target.value)}
                  placeholder="e.g. 120.00"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#1f6beb]"
                />
              </div>

              <div>
                <label className="text-[#8b949e] block mb-1">Supplier Cost Price (ETB) *</label>
                <input
                  type="number"
                  value={supplierCostInput}
                  onChange={(e) => setSupplierCostInput(e.target.value)}
                  placeholder="e.g. 105.00"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#1f6beb]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#30363d] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFulfillBasketId(null)}
                className="border-[#30363d] !bg-transparent !text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFulfillSubmit}
                size="sm"
                className="bg-[#1f6beb] hover:bg-[#388bfd] text-white text-xs font-semibold"
              >
                Fulfill & Complete Pool
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY DETAILS MODAL */}
      {deliveryBasket && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h2 className="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#58a6ff]" />
                Logistics & Delivery Details
              </h2>
              <button
                onClick={() => setDeliveryBasket(null)}
                className="text-[#8b949e] hover:text-[#f0f6fc] text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#8b949e]">
              Enter shipping & delivery logistics for <strong>{deliveryBasket.name}</strong> to notify participating buyers.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8b949e] block mb-1">Estimated Delivery Date *</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#1f6beb]"
                />
              </div>

              <div>
                <label className="text-[#8b949e] block mb-1">Delivery Note</label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Estimated dispatch via direct freight to main campus warehouse."
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:border-[#1f6beb]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#30363d] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeliveryBasket(null)}
                className="border-[#30363d] !bg-transparent !text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeliverySubmit}
                size="sm"
                className="bg-[#1f6beb] hover:bg-[#388bfd] text-white text-xs font-semibold"
              >
                Save Delivery Info
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CANCEL CONFIRMATION DIALOG (Item 1) */}
      {cancelConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#da3633]/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#30363d] pb-3 text-[#f85149]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold">Confirm Basket Cancellation</h2>
            </div>

            <p className="text-sm text-[#f0f6fc]">
              Are you sure you want to cancel <strong className="text-[#f85149]">"{cancelConfirmTarget.name}"</strong>?
            </p>
            <p className="text-xs text-[#8b949e]">
              This action will close the pool immediately and notify participating organizations. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 border-t border-[#30363d] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelConfirmTarget(null)}
                className="border-[#30363d] !bg-transparent !text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs"
              >
                Keep Basket
              </Button>
              <Button
                onClick={handleConfirmCancel}
                size="sm"
                className="bg-[#da3633] hover:bg-[#b82a28] text-white text-xs font-semibold"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
