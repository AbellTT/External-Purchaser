import { useState, useEffect } from 'react'
import { PageMeta } from '@/components/PageMeta'
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Truck,
  XCircle,
  CheckCircle2,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchPlatformBasketHistory,
  selectPlatformHistoryBaskets,
  selectHistoryPagination,
  selectBasketsHistoryLoading,
} from '@/store/slices/basketsSlice'

const DURATION_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly Pool',
  MONTHLY: 'Monthly Pool',
  SIX_MONTH: '6-Month Consortium',
}

export function BasketHistoryPage() {
  const dispatch = useAppDispatch()
  const historyBaskets = useAppSelector(selectPlatformHistoryBaskets)
  const pagination = useAppSelector(selectHistoryPagination)
  const loading = useAppSelector(selectBasketsHistoryLoading)

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL')

  const loadData = (p = page, silent = false) => {
    dispatch(fetchPlatformBasketHistory({ page: p, pageSize: 6, search: searchQuery, silent }))
  }

  useEffect(() => {
    loadData(page)
  }, [dispatch, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Local filter for Completed vs Cancelled switch
  const filteredBaskets = historyBaskets.filter((b) => {
    if (statusFilter === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'CLOSED'
    if (statusFilter === 'CANCELLED') return b.status === 'CANCELLED'
    return true
  })

  return (
    <DashboardLayout>
      <PageMeta
        title="Basket History"
        description="Review completed procurement baskets and compare savings against market prices."
        path="/dashboard/basket-history"
      />
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <History className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              Platform Basket Pricing History
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Historical archive of all fulfilled procurement baskets, wholesale benchmark prices, and cancelled pools across Ethiopia.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(page)}
            className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh History
          </Button>
        </div>

        {/* Controls: Search Bar & Completed / Cancelled Filter Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by basket name, product, or brand..."
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Filter Switch */}
          <div className="flex items-center gap-1 bg-surface-muted/60 p-1 rounded-xl border border-border self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Baskets
            </button>

            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                statusFilter === 'COMPLETED'
                  ? 'bg-success/15 text-success font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed
            </button>

            <button
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                statusFilter === 'CANCELLED'
                  ? 'bg-destructive/15 text-destructive font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Baskets List */}
        {loading && historyBaskets.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-mono text-sm">
            Loading platform basket history...
          </div>
        ) : filteredBaskets.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-base font-semibold text-foreground">No historical basket records found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Completed and cancelled procurement pools will appear here for historical reference.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBaskets.map((b) => {
              const babiPrice = b.babiPlatformPrice || 0
              const regPrice = b.regularMarketPrice || 0
              const merkatoPrice = b.merkatoRetailerPrice || 0
              const isCancelled = b.status === 'CANCELLED'

              return (
                <Card key={b.id} className="border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground">{b.name}</h3>
                          <Badge variant="outline" className="text-xs sm:text-sm font-mono">
                            {DURATION_LABELS[b.durationType] || b.durationType}
                          </Badge>
                          {isCancelled ? (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 font-semibold text-xs sm:text-sm flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Cancelled Basket
                            </Badge>
                          ) : (
                            <Badge className="bg-success/15 text-success border-success/30 font-semibold text-xs sm:text-sm flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed Basket
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                          Product: <strong className="text-foreground font-semibold">{b.productName}</strong> · Brand:{' '}
                          <strong className="text-foreground font-semibold">{b.brandName}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right font-mono text-sm sm:text-base">
                        <span className="text-muted-foreground block text-xs">Total Pooled Volume:</span>
                        <span className="text-primary font-bold text-base sm:text-lg">{b.currentQuantity} {b.unitOfMeasure || 'units'}</span>
                      </div>
                    </div>

                    {/* Participating Organizations Container Box */}
                    {b.participatingOrganizations && b.participatingOrganizations.length > 0 && (
                      <div className="bg-surface-muted/40 p-3.5 rounded-lg border border-border space-y-2">
                        <span className="text-xs sm:text-sm font-mono font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <Building2 className="w-4 h-4 text-primary" />
                          Participating Institutional Organizations ({b.participatingOrganizations.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {b.participatingOrganizations.slice(0, 4).map((orgName, idx) => (
                            <Badge key={idx} variant="outline" className="bg-background border-border text-foreground text-xs sm:text-sm font-semibold py-1 px-3 max-w-full">
                              <span className="truncate">{orgName}</span>
                            </Badge>
                          ))}
                          {b.participatingOrganizations.length > 4 && (
                            <Badge className="bg-primary/15 text-primary border-primary/30 text-xs sm:text-sm font-bold">
                              +{b.participatingOrganizations.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pricing Benchmark Comparison Grid - Aligned Equal Height Box Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-mono">
                      <div className="bg-surface-muted/40 p-3.5 rounded-lg border border-border flex flex-col justify-between space-y-1">
                        <span className="text-muted-foreground block text-xs font-semibold">Regular Market Price</span>
                        <span className="text-foreground font-bold text-base sm:text-lg">ETB {regPrice.toLocaleString()}</span>
                      </div>

                      <div className="bg-surface-muted/40 p-3.5 rounded-lg border border-border flex flex-col justify-between space-y-1">
                        <span className="text-muted-foreground block text-xs font-semibold">Merkato Retailer Price</span>
                        <span className="text-foreground font-bold text-base sm:text-lg">ETB {merkatoPrice.toLocaleString()}</span>
                      </div>

                      <div className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-1 ${
                        isCancelled ? 'bg-destructive/10 border-destructive/30' : 'bg-success/15 border-success/30'
                      }`}>
                        <span className={isCancelled ? 'text-destructive block text-xs font-bold' : 'text-success block text-xs font-bold'}>
                          {isCancelled ? 'Status Notice' : 'Platform Price'}
                        </span>
                        <span className={isCancelled ? 'text-destructive font-bold text-base sm:text-lg' : 'text-success font-black text-base sm:text-lg'}>
                          {isCancelled ? 'Cancelled by Admin' : `ETB ${babiPrice.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Logistics Info (Date & Note only) */}
                    {b.deliveryDate && !isCancelled && (
                      <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg space-y-2 font-mono text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                          <Truck className="w-5 h-5" />
                          <span>Delivery Information</span>
                        </div>

                        <div className="space-y-1 text-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Estimated Delivery Date:</span>
                            <strong className="font-bold">{b.deliveryDate}</strong>
                          </div>
                          {b.deliveryNotes && (
                            <div className="flex items-start gap-2 text-muted-foreground pt-1">
                              <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span><strong className="text-foreground">Delivery Note:</strong> {b.deliveryNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="text-xs sm:text-sm gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            <span className="text-xs sm:text-sm text-muted-foreground font-mono text-center px-1">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalBaskets} historical records)
            </span>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="text-xs sm:text-sm gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
