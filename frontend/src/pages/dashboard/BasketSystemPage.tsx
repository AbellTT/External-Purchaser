import { useState, useEffect } from 'react'
import { PageMeta } from '@/components/PageMeta'
import {
  ShoppingBag,
  Users,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Sparkles,
  Search,
  Edit2,
  Trash2,
  Truck,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchUserBaskets,
  commitBasketQuantity,
  selectOpenBaskets,
  selectOpenPagination,
  selectActiveUserBaskets,
  selectActivePagination,
  selectUserCompletedBaskets,
  selectCompletedPagination,
  selectBasketsLoading,
} from '@/store/slices/basketsSlice'

const DURATION_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly Pool',
  MONTHLY: 'Monthly Pool',
  SIX_MONTH: '6-Month Consortium',
}

export function BasketSystemPage() {
  const dispatch = useAppDispatch()
  const openBaskets = useAppSelector(selectOpenBaskets)
  const openPagination = useAppSelector(selectOpenPagination)
  const activeBaskets = useAppSelector(selectActiveUserBaskets)
  const activePagination = useAppSelector(selectActivePagination)
  const userCompletedBaskets = useAppSelector(selectUserCompletedBaskets)
  const completedPagination = useAppSelector(selectCompletedPagination)
  const loading = useAppSelector(selectBasketsLoading)

  const [activeTab, setActiveTab] = useState<'open' | 'active' | 'completed'>('open')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination page states
  const [openPage, setOpenPage] = useState(1)
  const [activePage, setActivePage] = useState(1)
  const [completedPage, setCompletedPage] = useState(1)

  // Commit / edit quantity inputs
  const [commitQuantities, setCommitQuantities] = useState<Record<number, string>>({})
  const [submittingId, setSubmittingId] = useState<number | null>(null)
  const [editingBasketId, setEditingBasketId] = useState<number | null>(null)

  const loadAllTabs = (silent = false) => {
    dispatch(fetchUserBaskets({ tab: 'open', page: openPage, pageSize: 6, search: searchQuery, silent }))
    dispatch(fetchUserBaskets({ tab: 'active', page: activePage, pageSize: 6, search: searchQuery, silent }))
    dispatch(fetchUserBaskets({ tab: 'completed', page: completedPage, pageSize: 6, search: searchQuery, silent }))
  }

  useEffect(() => {
    loadAllTabs()
  }, [dispatch, openPage, activePage, completedPage])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllTabs()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCommit = async (basketId: number, qtyToCommit: number) => {
    if (qtyToCommit < 0) return
    setSubmittingId(basketId)
    try {
      if (qtyToCommit === 0) {
        await dispatch(commitBasketQuantity({ basketId, quantity: 0 })).unwrap()
        toast.success('Left the basket successfully.')
      } else {
        const res = await dispatch(commitBasketQuantity({ basketId, quantity: qtyToCommit })).unwrap()
        toast.success(res.message || `Committed ${qtyToCommit} units successfully!`)
      }
      setEditingBasketId(null)
      loadAllTabs(true)
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to update commitment.')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <DashboardLayout>
      <PageMeta
        title="Procurement Baskets"
        description="Join collective procurement baskets and unlock bigger discounts as more organizations participate."
        path="/dashboard/baskets"
      />
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              Basket Procurement System
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Pool demand with institutional buyers to unlock maximum wholesale price savings across Ethiopia.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAllTabs()}
            className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Baskets
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search basket, product, or brand..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* 3 Tabs Navigation with Mobile Horizontal Scroll Prevention */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full space-y-4">
          <div className="overflow-x-auto scrollbar-none pb-1">
            <TabsList className="flex w-max min-w-full sm:w-auto h-11 p-1 bg-surface-muted/60 rounded-xl border border-border">
              <TabsTrigger value="open" className="text-xs sm:text-sm font-semibold flex items-center gap-2 px-3 sm:px-4">
                <ShoppingBag className="w-4 h-4 text-success" />
                <span>Open Baskets</span>
                <Badge variant="secondary" className="text-xs font-mono font-bold">
                  {openPagination.totalBaskets}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="active" className="text-xs sm:text-sm font-semibold flex items-center gap-2 px-3 sm:px-4">
                <Clock className="w-4 h-4 text-primary" />
                <span>Active Baskets</span>
                <Badge variant="secondary" className="text-xs font-mono font-bold">
                  {activePagination.totalBaskets}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="completed" className="text-xs sm:text-sm font-semibold flex items-center gap-2 px-3 sm:px-4">
                <CheckCircle2 className="w-4 h-4 text-info" />
                <span>Completed Baskets</span>
                <Badge variant="secondary" className="text-xs font-mono font-bold">
                  {completedPagination.totalBaskets}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: OPEN BASKETS */}
          <TabsContent value="open" className="space-y-4 mt-2">
            {loading && openBaskets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-mono text-sm">
                Loading open baskets...
              </div>
            ) : openBaskets.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-base font-semibold text-foreground">No unjoined open baskets available.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have joined all currently available open procurement pools! Check the <strong>Active Baskets</strong> tab.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {openBaskets.map((b) => {
                  const inputVal = commitQuantities[b.id] || ''

                  return (
                    <Card key={b.id} className="border-border hover:border-primary/50 transition-all flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <Badge variant="outline" className="text-xs sm:text-sm font-mono mb-1 text-success border-success/30">
                              {DURATION_LABELS[b.durationType] || b.durationType}
                            </Badge>
                            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">{b.name}</CardTitle>
                            <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1">
                              Product: <strong className="text-foreground font-semibold">{b.productName}</strong> · Brand:{' '}
                              <strong className="text-foreground font-semibold">{b.brandName}</strong>
                            </CardDescription>
                          </div>

                          <Badge className="bg-success/15 text-success border-success/30 font-semibold text-xs sm:text-sm self-start sm:self-auto">
                            Open for Pool
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-0">
                        {/* Progress Bar */}
                        <div className="space-y-2 bg-surface-muted/40 p-3.5 rounded-lg border border-border">
                          <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 text-sm sm:text-base font-mono">
                            <span className="text-muted-foreground flex items-center gap-1.5 min-w-0 flex-wrap">
                              <Users className="w-4 h-4 text-primary shrink-0" />
                              Pooled Volume: <strong className="text-foreground font-bold">{b.currentQuantity}</strong> / {b.targetQuantity} {b.unitOfMeasure || 'units'}
                            </span>
                            <span className="font-bold text-primary">{b.progressPercentage}%</span>
                          </div>

                          <div className="w-full bg-surface-muted h-2.5 rounded-full overflow-hidden border border-border">
                            <div
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${Math.min(b.progressPercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Participating Organizations Full Names Container Box */}
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

                        {/* Benchmark Prices Comparison Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-mono p-3 bg-surface-muted/30 rounded-lg border border-border">
                          <div>
                            <span className="text-muted-foreground block text-xs">Regular Market Price:</span>
                            <span className="text-foreground font-bold text-sm sm:text-base">ETB {b.regularMarketPrice?.toLocaleString()}</span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-xs">Merkato Retail Price:</span>
                            <span className="text-foreground font-bold text-sm sm:text-base">ETB {b.merkatoRetailerPrice?.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Join & Commit Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-border">
                          <input
                            type="number"
                            value={inputVal}
                            onChange={(e) => setCommitQuantities({ ...commitQuantities, [b.id]: e.target.value })}
                            placeholder="Enter Commitment Quantity"
                            className="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm sm:text-base font-mono focus:outline-none focus:border-primary"
                          />

                          <Button
                            onClick={() => handleCommit(b.id, parseInt(inputVal, 10) || 0)}
                            disabled={submittingId === b.id}
                            className="gap-1.5 text-sm font-bold bg-primary text-primary-foreground h-10 px-5"
                          >
                            {submittingId === b.id ? 'Joining Pool...' : 'Join & Commit Pool'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Pagination for Open Tab */}
            {openPagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={openPage <= 1}
                  onClick={() => setOpenPage(openPage - 1)}
                  className="text-xs sm:text-sm gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                  Page {openPagination.currentPage} of {openPagination.totalPages} ({openPagination.totalBaskets} open pools)
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={openPage >= openPagination.totalPages}
                  onClick={() => setOpenPage(openPage + 1)}
                  className="text-xs sm:text-sm gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: ACTIVE BASKETS */}
          <TabsContent value="active" className="space-y-4 mt-2">
            {loading && activeBaskets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-mono text-sm">
                Loading active joined baskets...
              </div>
            ) : activeBaskets.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-base font-semibold text-foreground">No active joined baskets.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You haven't committed to any open procurement baskets yet. Switch to the <strong>Open Baskets</strong> tab to join a pool.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeBaskets.map((b) => {
                  const myQty = b.userCommittedQuantity || 0
                  const isEditing = editingBasketId === b.id
                  const editVal = commitQuantities[b.id] ?? String(myQty)

                  return (
                    <Card key={b.id} className="border-border hover:border-primary/50 transition-all flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <Badge variant="outline" className="text-xs sm:text-sm font-mono mb-1 text-primary border-primary/30">
                              {DURATION_LABELS[b.durationType] || b.durationType}
                            </Badge>
                            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">{b.name}</CardTitle>
                            <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1">
                              Product: <strong className="text-foreground font-semibold">{b.productName}</strong> · Brand:{' '}
                              <strong className="text-foreground font-semibold">{b.brandName}</strong>
                            </CardDescription>
                          </div>

                          <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold text-xs sm:text-sm self-start sm:self-auto">
                            Active Joined
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-0">
                        {/* Committed quantity banner */}
                        <div className="bg-primary/10 border border-primary/20 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-x-3 gap-y-2 font-mono text-sm sm:text-base text-primary font-bold">
                          <span className="break-words min-w-0">Your Commitment: {myQty} {b.unitOfMeasure || 'units'}</span>
                          <div className="flex items-center gap-1.5">
                            {!isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingBasketId(b.id)}
                                  className="h-8 px-2.5 text-xs sm:text-sm hover:bg-primary/20 text-primary gap-1"
                                >
                                  <Edit2 className="w-4 h-4" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCommit(b.id, 0)}
                                  disabled={submittingId === b.id}
                                  className="h-8 px-2.5 text-xs sm:text-sm hover:bg-destructive/20 text-destructive gap-1"
                                >
                                  <Trash2 className="w-4 h-4" /> Leave
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingBasketId(null)}
                                className="h-8 px-2.5 text-xs sm:text-sm text-muted-foreground"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Edit Inline Form */}
                        {isEditing && (
                          <div className="flex items-center gap-2 bg-surface-muted/40 p-3 rounded-lg border border-border">
                            <input
                              type="number"
                              value={editVal}
                              onChange={(e) => setCommitQuantities({ ...commitQuantities, [b.id]: e.target.value })}
                              className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono focus:outline-none focus:border-primary"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleCommit(b.id, parseInt(editVal, 10) || 0)}
                              disabled={submittingId === b.id}
                              className="h-9 text-xs sm:text-sm font-bold gap-1 px-4"
                            >
                              Update Commitment
                            </Button>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="space-y-2 bg-surface-muted/40 p-3.5 rounded-lg border border-border">
                          <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 text-sm sm:text-base font-mono">
                            <span className="text-muted-foreground flex items-center gap-1.5 min-w-0 flex-wrap">
                              <Users className="w-4 h-4 text-primary shrink-0" />
                              Pooled Volume: <strong className="text-foreground font-bold">{b.currentQuantity}</strong> / {b.targetQuantity} {b.unitOfMeasure || 'units'}
                            </span>
                            <span className="font-bold text-primary">{b.progressPercentage}%</span>
                          </div>

                          <div className="w-full bg-surface-muted h-2.5 rounded-full overflow-hidden border border-border">
                            <div
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${Math.min(b.progressPercentage, 100)}%` }}
                            />
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

                        {/* Pricing benchmarks */}
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-mono p-3 bg-surface-muted/30 rounded-lg border border-border">
                          <div>
                            <span className="text-muted-foreground block text-xs">Regular Market Price:</span>
                            <span className="text-foreground font-bold text-sm sm:text-base">ETB {b.regularMarketPrice?.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">Merkato Retail Price:</span>
                            <span className="text-foreground font-bold text-sm sm:text-base">ETB {b.merkatoRetailerPrice?.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Pagination for Active Tab */}
            {activePagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={activePage <= 1}
                  onClick={() => setActivePage(activePage - 1)}
                  className="text-xs sm:text-sm gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                  Page {activePagination.currentPage} of {activePagination.totalPages} ({activePagination.totalBaskets} active joined pools)
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={activePage >= activePagination.totalPages}
                  onClick={() => setActivePage(activePage + 1)}
                  className="text-xs sm:text-sm gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: COMPLETED BASKETS */}
          <TabsContent value="completed" className="space-y-4 mt-2">
            {loading && userCompletedBaskets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-mono text-sm">
                Loading completed baskets...
              </div>
            ) : userCompletedBaskets.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-base font-semibold text-foreground">No completed participated baskets.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Baskets you committed quantity to will appear here once fulfilled and closed by admin.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userCompletedBaskets.map((b) => {
                  const myQty = b.userCommittedQuantity || 0
                  const babiPrice = b.babiPlatformPrice || 0
                  const regPrice = b.regularMarketPrice || 0
                  const merkatoPrice = b.merkatoRetailerPrice || 0

                  const regSavings = Math.max(0, regPrice - babiPrice) * myQty
                  const merkatoSavings = Math.max(0, merkatoPrice - babiPrice) * myQty

                  return (
                    <Card key={b.id} className="border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-5 sm:p-6 space-y-4">
                        {/* Header line */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg sm:text-xl font-bold text-foreground">{b.name}</h3>
                              <Badge variant="outline" className="text-xs sm:text-sm bg-info/10 text-info border-info/30 font-mono">
                                {DURATION_LABELS[b.durationType] || b.durationType}
                              </Badge>
                              <Badge className="text-xs sm:text-sm bg-success/15 text-success border-success/30 font-semibold">
                                Completed & Fulfilled
                              </Badge>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                              Product: <strong className="text-foreground font-semibold">{b.productName}</strong> · Brand:{' '}
                              <strong className="text-foreground font-semibold">{b.brandName}</strong>
                            </p>
                          </div>

                          <div className="text-left sm:text-right font-mono text-sm sm:text-base">
                            <span className="text-muted-foreground block text-xs">Your Final Commitment:</span>
                            <span className="text-primary font-bold text-base sm:text-lg">{myQty} units</span>
                          </div>
                        </div>

                        {/* Benchmark Prices Comparison Grid - Aligned Equal Height Box Layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-mono">
                          <div className="bg-surface-muted/40 p-3.5 rounded-lg border border-border flex flex-col justify-between space-y-1">
                            <span className="text-muted-foreground block text-xs font-semibold">Regular Market Price</span>
                            <span className="text-foreground font-bold text-base sm:text-lg">ETB {regPrice.toLocaleString()}</span>
                          </div>

                          <div className="bg-surface-muted/40 p-3.5 rounded-lg border border-border flex flex-col justify-between space-y-1">
                            <span className="text-muted-foreground block text-xs font-semibold">Merkato Retailer Price</span>
                            <span className="text-foreground font-bold text-base sm:text-lg">ETB {merkatoPrice.toLocaleString()}</span>
                          </div>

                          <div className="bg-success/15 p-3.5 rounded-lg border border-success/30 flex flex-col justify-between space-y-1">
                            <span className="text-success block text-xs font-bold uppercase">Final Wholesale Basket Price</span>
                            <span className="text-success font-black text-base sm:text-lg">ETB {babiPrice.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Savings Breakdown Box */}
                        {myQty > 0 && (
                          <div className="bg-success/10 border border-success/30 rounded-lg p-4 space-y-2 font-mono">
                            <p className="font-bold text-success flex items-center gap-1.5 text-sm sm:text-base uppercase tracking-wide">
                              <Sparkles className="w-5 h-5 text-success" /> Total Institutional Savings ({myQty} units)
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div>
                                <span className="text-muted-foreground text-xs block">vs Regular Market Price:</span>
                                <span className="font-extrabold text-success text-base sm:text-lg">ETB {regSavings.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">vs Merkato Retailer Price:</span>
                                <span className="font-extrabold text-success text-base sm:text-lg">ETB {merkatoSavings.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Delivery Info Box (If provided by Admin) */}
                        {b.deliveryDate && (
                          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg space-y-2 font-mono text-xs sm:text-sm">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                              <Truck className="w-5 h-5" />
                              <span>Delivery Information</span>
                            </div>

                            <div className="space-y-1 text-foreground">
                              <div>
                                <span className="text-muted-foreground">Estimated Delivery Date:</span>{' '}
                                <strong className="font-bold">{b.deliveryDate}</strong>
                              </div>
                              {b.deliveryNotes && (
                                <div className="text-muted-foreground pt-0.5">
                                  <strong className="text-foreground">Delivery Note:</strong> {b.deliveryNotes}
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

            {/* Pagination for Completed Tab */}
            {completedPagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={completedPage <= 1}
                  onClick={() => setCompletedPage(completedPage - 1)}
                  className="text-xs sm:text-sm gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                  Page {completedPagination.currentPage} of {completedPagination.totalPages} ({completedPagination.totalBaskets} completed pools)
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={completedPage >= completedPagination.totalPages}
                  onClick={() => setCompletedPage(completedPage + 1)}
                  className="text-xs sm:text-sm gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
