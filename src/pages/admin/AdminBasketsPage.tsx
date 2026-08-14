import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  Info,
  MapPin,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectActiveBaskets,
  selectHistoryBaskets,
  createBasket,
  updateBasketStatus,
  fulfillBasket,
} from '@/store/slices/adminSlice'
import type { Basket } from '@/types/api'

const PAGE_SIZE = 5

export function AdminBasketsPage() {
  const dispatch = useAppDispatch()
  const activeBaskets = useAppSelector(selectActiveBaskets)
  const historyBaskets = useAppSelector(selectHistoryBaskets)

  // Pagination for active list
  const [activePage, setActivePage] = useState(1)
  const totalActivePages = Math.max(1, Math.ceil(activeBaskets.length / PAGE_SIZE))
  const paginatedActive = activeBaskets.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)

  // Expanded participant panels
  const [expandedBaskets, setExpandedBaskets] = useState<Set<string>>(new Set())
  const toggleExpand = (basketId: string) =>
    setExpandedBaskets((prev) => {
      const next = new Set(prev)
      next.has(basketId) ? next.delete(basketId) : next.add(basketId)
      return next
    })

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [fulfillTarget, setFulfillTarget] = useState<Basket | null>(null)

  // Create basket form
  const [basketName, setBasketName] = useState('')
  const [basketType, setBasketType] = useState<'weekly' | 'monthly' | '6-month'>('monthly')
  const [productName, setProductName] = useState('Siner Line A4 Paper')
  const [brandName, setBrandName] = useState('Siner Line')
  const [merkatoPrice, setMerkatoPrice] = useState(675)
  const [regularPrice, setRegularPrice] = useState(700)
  const [targetQty, setTargetQty] = useState(1000)

  // Fulfill basket modal
  const [fulfillPlatformPrice, setFulfillPlatformPrice] = useState(0)
  const [fulfillSupplierCost, setFulfillSupplierCost] = useState(0)

  const handleCreateBasket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!basketName.trim()) return

    dispatch(
      createBasket({
        name: basketName,
        type: basketType,
        brand: {
          brandId: `b_${Date.now()}`,
          brandName,
          productId: `p_${Date.now()}`,
          productName,
          productUnit: 'ream',
          brandImageUrl: '',
        },
        pricing: {
          basketPrice: 0, // Will be filled on fulfillment
          merkato_retailer_price: Number(merkatoPrice),
          regular_stationary_market_price: Number(regularPrice),
          babiPlatformPrice: null,
          supplierCost: null,
        },
        participation: {
          participants: [],
          totalParticipants: 0,
          totalCommitment: 0,
          currentCommitment: 0,
          minCommitment: 100,
          maxCommitment: Number(targetQty),
        },
      })
    )

    setBasketName('')
    setProductName('Siner Line A4 Paper')
    setBrandName('Siner Line')
    setMerkatoPrice(675)
    setRegularPrice(700)
    setTargetQty(1000)
    setShowCreateModal(false)
  }

  const openFulfillModal = (basket: Basket) => {
    setFulfillTarget(basket)
    setFulfillPlatformPrice(basket.pricing.babiPlatformPrice ?? 0)
    setFulfillSupplierCost(basket.pricing.supplierCost ?? 0)
  }

  const handleFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fulfillTarget) return

    dispatch(
      fulfillBasket({
        basketId: fulfillTarget.id,
        babiPlatformPrice: Number(fulfillPlatformPrice),
        supplierCost: Number(fulfillSupplierCost),
      })
    )

    setFulfillTarget(null)
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              Basket Management & Control
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch and manage active collective procurement baskets. Completed and cancelled baskets are in history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/baskets/history">
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5"
              >
                <History className="w-4 h-4 text-slate-400" />
                View History
                {historyBaskets.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                    {historyBaskets.length}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Launch New Basket
            </Button>
          </div>
        </div>

        {/* Pricing Notice Banner */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3.5 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-blue-400 font-semibold">Babi Platform Price & Supplier Cost</span> are entered only{' '}
              <strong className="text-slate-200">when you lock and fulfill a basket</strong> (once it reaches 100% or you manually close it).
              These are auto-surfaced to users in their basket history and capital analysis.
            </p>
          </CardContent>
        </Card>

        {/* Active Baskets Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Baskets
            <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 font-mono text-[10px]">
              {activeBaskets.length}
            </Badge>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Page {activePage} of {totalActivePages}
          </span>
        </div>

        {/* Active Baskets List */}
        {paginatedActive.length === 0 ? (
          <Card className="border-dashed border-slate-800 bg-slate-900/50">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No active baskets</p>
              <p className="text-slate-500 text-xs mt-1">Launch a new basket to start collective procurement</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedActive.map((b) => {
              const fillPercentage = Math.min(
                100,
                Math.round((b.participation.currentCommitment / b.participation.maxCommitment) * 100)
              )
              const isFull = fillPercentage >= 100

              return (
                <Card key={b.id} className="border-slate-800 bg-slate-900 overflow-hidden">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-white">{b.name}</h3>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] uppercase"
                          >
                            {b.type}
                          </Badge>
                          {isFull && (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] animate-pulse"
                            >
                              100% — Ready to Fulfill!
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {b.basketNumber} • {b.brand.productName} ({b.brand.brandName})
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => openFulfillModal(b)}
                          className={`text-xs gap-1.5 font-semibold ${
                            isFull
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Lock & Fulfill
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            dispatch(updateBasketStatus({ basketId: b.id, status: 'cancelled' }))
                          }
                          className="text-xs border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded border border-slate-800">
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Merkato Price</p>
                        <p className="text-sm font-bold text-slate-300 font-mono line-through">
                          ETB {b.pricing.merkato_retailer_price}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Regular Market</p>
                        <p className="text-sm font-bold text-slate-400 font-mono line-through">
                          ETB {b.pricing.regular_stationary_market_price}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Pooled Volume</p>
                        <p className="text-sm font-bold text-white font-mono">
                          {b.participation.currentCommitment} / {b.participation.maxCommitment}{' '}
                          <span className="text-slate-400 text-xs">{b.brand.productUnit}s</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
                          <Users className="w-3 h-3" /> Participants
                        </p>
                        <p className="text-sm font-bold text-blue-400 font-mono">
                          {b.participation.totalParticipants}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {b.timeline.deliveryDate} ({b.timeline.daysRemaining} days left)
                        </span>
                        <span
                          className={`font-bold ${
                            isFull ? 'text-amber-400' : fillPercentage >= 75 ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {fillPercentage}% filled
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? 'bg-amber-400' : fillPercentage >= 75 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Participants Panel Toggle */}
                    <div className="border-t border-slate-800 pt-3">
                      <button
                        onClick={() => toggleExpand(b.id)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors font-medium"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {b.participation.participants.length} Participating Organization{b.participation.participants.length !== 1 ? 's' : ''}
                        {expandedBaskets.has(b.id) ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedBaskets.has(b.id) && (
                        <div className="mt-3 space-y-2">
                          {b.participation.participants.length === 0 ? (
                            <p className="text-xs text-slate-500 italic px-1">No organizations have joined yet.</p>
                          ) : (
                            b.participation.participants.map((p, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-950 rounded border border-slate-800"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-white truncate">{p.organizationName}</p>
                                  {p.address && (
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3 shrink-0" />
                                      {p.address}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <CalendarDays className="w-3 h-3 shrink-0" />
                                    Joined {new Date(p.joinedDate).toLocaleDateString('en-ET', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-[10px] text-slate-400 font-mono">Committed</p>
                                  <p className="text-sm font-bold text-emerald-400 font-mono">
                                    {p.commitment.toLocaleString()}
                                    <span className="text-slate-500 text-[10px] ml-1">{b.brand.productUnit}s</span>
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Active Baskets Pagination */}
            {totalActivePages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={activePage === 1}
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalActivePages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setActivePage(n)}
                    className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                      activePage === n
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={activePage === totalActivePages}
                  onClick={() => setActivePage((p) => Math.min(totalActivePages, p + 1))}
                  className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick History Link Footer */}
        {historyBaskets.length > 0 && (
          <Card className="border-slate-800 bg-slate-900/60">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <History className="w-4 h-4 text-slate-400" />
                <span>
                  <strong className="text-white">{historyBaskets.length}</strong> completed/cancelled baskets in history
                </span>
              </div>
              <Link to="/admin/baskets/history">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  Open Basket History
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Create Basket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl my-auto">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                    Launch New Procurement Basket
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Configure pooling parameters for institutions to join and commit volume
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleCreateBasket} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Basket Name</label>
                    <input
                      type="text"
                      required
                      value={basketName}
                      onChange={(e) => setBasketName(e.target.value)}
                      placeholder="e.g. Q3 University Paper Bulk Basket"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Duration Type</label>
                      <select
                        value={basketType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setBasketType(e.target.value as 'weekly' | 'monthly' | '6-month')
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="weekly">Weekly Spot Basket</option>
                        <option value="monthly">Monthly Standing Basket</option>
                        <option value="6-month">6-Month Strategic Basket</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Target Commitment (qty)</label>
                      <input
                        type="number"
                        required
                        value={targetQty}
                        onChange={(e) => setTargetQty(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Product Name</label>
                      <input
                        type="text"
                        required
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Market Benchmarks only — NOT basket or platform price */}
                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-300">
                      Market Reference Prices{' '}
                      <span className="text-slate-500 font-normal">(shown to users for comparison)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">Merkato Retail Price (ETB)</label>
                        <input
                          type="number"
                          required
                          value={merkatoPrice}
                          onChange={(e) => setMerkatoPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">Regular Market Price (ETB)</label>
                        <input
                          type="number"
                          required
                          value={regularPrice}
                          onChange={(e) => setRegularPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-2 p-2.5 rounded bg-amber-500/5 border border-amber-500/20 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400">
                        <span className="text-amber-400 font-semibold">Platform Price & Supplier Cost</span> will be entered
                        when you <strong className="text-slate-300">Lock & Fulfill</strong> the basket.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateModal(false)}
                      className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                    >
                      Publish Basket
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lock & Fulfill Modal */}
        {fulfillTarget && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <Card className="w-full max-w-md border-amber-500/40 bg-slate-900 shadow-2xl my-auto">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                    Lock & Fulfill Basket
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    {fulfillTarget.name}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFulfillTarget(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleFulfillSubmit} className="space-y-5">
                  {/* Summary */}
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Product:</span>
                      <span className="text-slate-200">
                        {fulfillTarget.brand.productName} ({fulfillTarget.brand.brandName})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Pool Fill:</span>
                      <span className="text-emerald-400 font-bold">
                        {fulfillTarget.participation.currentCommitment} /{' '}
                        {fulfillTarget.participation.maxCommitment} {fulfillTarget.brand.productUnit}s
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Participants:</span>
                      <span className="text-white">{fulfillTarget.participation.totalParticipants} organizations</span>
                    </div>
                  </div>

                  {/* Platform Price & Supplier Cost */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-400">
                        Babi Platform Price (ETB / {fulfillTarget.brand.productUnit})
                      </label>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        The tiered bulk price after platform profit — shown to users in basket history & capital analysis.
                      </p>
                      <input
                        type="number"
                        required
                        min={1}
                        value={fulfillPlatformPrice || ''}
                        onChange={(e) => setFulfillPlatformPrice(Number(e.target.value))}
                        placeholder="e.g. 520"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-blue-500/50 rounded text-sm text-blue-400 font-bold font-mono focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-purple-400">
                        Supplier Wholesale Cost (ETB / {fulfillTarget.brand.productUnit})
                      </label>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Actual negotiated cost from Merkato supplier — shown in capital analysis as supplier cost.
                      </p>
                      <input
                        type="number"
                        required
                        min={1}
                        value={fulfillSupplierCost || ''}
                        onChange={(e) => setFulfillSupplierCost(Number(e.target.value))}
                        placeholder="e.g. 490"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-purple-500/50 rounded text-sm text-purple-400 font-bold font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded bg-amber-500/5 border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-300">
                      This action is <strong>permanent</strong>. The basket will be locked, moved to history, and pricing
                      will be published to all participant organizations.
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFulfillTarget(null)}
                      className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm & Fulfill
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
