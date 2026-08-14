import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Users,
  MapPin,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppSelector } from '@/store/hooks'
import { selectHistoryBaskets } from '@/store/slices/adminSlice'

const PAGE_SIZE = 5

export function AdminBasketHistoryPage() {
  const historyBaskets = useAppSelector(selectHistoryBaskets)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all')

  // Expanded participant panels
  const [expandedBaskets, setExpandedBaskets] = useState<Set<string>>(new Set())
  const toggleExpand = (basketId: string) =>
    setExpandedBaskets((prev) => {
      const next = new Set(prev)
      next.has(basketId) ? next.delete(basketId) : next.add(basketId)
      return next
    })

  const filtered =
    statusFilter === 'all' ? historyBaskets : historyBaskets.filter((b) => b.status === statusFilter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const completedCount = historyBaskets.filter((b) => b.status === 'completed').length
  const cancelledCount = historyBaskets.filter((b) => b.status === 'cancelled').length

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin/baskets">
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-800 gap-1.5 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Active Baskets
              </Button>
            </Link>
            <div className="w-px h-5 bg-slate-800" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                Basket History
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                All completed and cancelled procurement baskets with final pricing records.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{completedCount}</span>
            <span className="text-slate-400">Fulfilled Baskets</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs font-mono">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-bold">{cancelledCount}</span>
            <span className="text-slate-400">Cancelled Baskets</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
          {(['all', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab)
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'all' ? `All (${historyBaskets.length})` : tab === 'completed' ? `Fulfilled (${completedCount})` : `Cancelled (${cancelledCount})`}
            </button>
          ))}
        </div>

        {/* History List */}
        {paginated.length === 0 ? (
          <Card className="border-dashed border-slate-800 bg-slate-900/50">
            <CardContent className="p-12 text-center">
              <History className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No baskets in history yet</p>
              <p className="text-slate-500 text-xs mt-1">
                When you fulfill or cancel a basket it will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {paginated.map((b) => {
              const isCompleted = b.status === 'completed'
              const fillPercent = Math.min(
                100,
                Math.round((b.participation.currentCommitment / b.participation.maxCommitment) * 100)
              )

              return (
                <Card
                  key={b.id}
                  className={`overflow-hidden border ${
                    isCompleted ? 'border-emerald-500/20 bg-slate-900' : 'border-red-500/15 bg-slate-900/80'
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-white">{b.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]'
                                : 'bg-red-500/10 text-red-400 border-red-500/30 text-[10px]'
                            }
                          >
                            {isCompleted ? '✓ Fulfilled' : '✕ Cancelled'}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-400 text-[10px] capitalize">
                            {b.type}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {b.basketNumber} • {b.brand.productName} ({b.brand.brandName})
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {b.timeline.deliveryDate}
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded border border-slate-800">
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Pooled Volume</p>
                        <p className="text-sm font-bold text-white font-mono">
                          {b.participation.currentCommitment}{' '}
                          <span className="text-slate-500 text-xs">/ {b.participation.maxCommitment}</span>
                        </p>
                        <p className="text-[10px] text-slate-500">{fillPercent}% fill rate</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
                          <Users className="w-3 h-3" /> Organizations
                        </p>
                        <p className="text-sm font-bold text-blue-400 font-mono">
                          {b.participation.totalParticipants}
                        </p>
                      </div>

                      {/* Babi Platform Price (auto-filled on fulfillment) */}
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Babi Platform Price</p>
                        {b.pricing.babiPlatformPrice ? (
                          <p className="text-sm font-bold text-blue-400 font-mono">
                            ETB {b.pricing.babiPlatformPrice.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">— not set</p>
                        )}
                      </div>

                      {/* Supplier Cost (auto-filled on fulfillment) */}
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Supplier Cost</p>
                        {b.pricing.supplierCost ? (
                          <p className="text-sm font-bold text-purple-400 font-mono">
                            ETB {b.pricing.supplierCost.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">— not set</p>
                        )}
                      </div>
                    </div>

                    {/* Market Reference Prices */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                      <span>
                        Merkato Ref:{' '}
                        <span className="text-slate-300 line-through">ETB {b.pricing.merkato_retailer_price}</span>
                      </span>
                      <span>
                        Market Ref:{' '}
                        <span className="text-slate-300 line-through">ETB {b.pricing.regular_stationary_market_price}</span>
                      </span>
                      {b.pricing.babiPlatformPrice && b.pricing.merkato_retailer_price > 0 && (
                        <span className="text-emerald-400 font-semibold">
                          Saved vs Merkato:{' '}
                          {Math.round(
                            ((b.pricing.merkato_retailer_price - b.pricing.babiPlatformPrice) /
                              b.pricing.merkato_retailer_price) *
                              100
                          )}
                          % off
                        </span>
                      )}
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
                            <p className="text-xs text-slate-500 italic px-1">No participants recorded.</p>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                      currentPage === n
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
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
