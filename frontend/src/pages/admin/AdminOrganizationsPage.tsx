import { useEffect, useState, useRef, useCallback } from 'react'
import { PageMeta } from '@/components/PageMeta'
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
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
  fetchAdminOrganizations,
  approveAdminOrganization,
  rejectAdminOrganization,
  setOrgFilterStatus,
  selectAdminOrganizations,
  selectAdminOrganizationsSummary,
  selectAdminOrganizationsPagination,
  selectAdminOrganizationsLoading,
  selectAdminOrganizationsFilterStatus,
} from '@/store/adminSlices/adminOrganizationsSlice'

const STATUS_STYLES: Record<string, string> = {
  VERIFIED: 'border-[#238636] bg-[#238636]/10 text-[#3fb950]',
  PENDING: 'border-[#d29922] bg-[#d29922]/10 text-[#d29922]',
  REJECTED: 'border-[#da3633] bg-[#da3633]/10 text-[#f85149]',
  SUSPENDED: 'border-[#8b949e] bg-[#8b949e]/10 text-[#8b949e]',
}

export function AdminOrganizationsPage() {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAdminAccessToken)
  const isAuthenticated = useAppSelector(selectIsAdminAuthenticated)
  const authLoading = useAppSelector(selectAdminAuthLoading)
  const isInitialized = useAppSelector(selectIsAdminInitialized)

  const orgs = useAppSelector(selectAdminOrganizations)
  const summary = useAppSelector(selectAdminOrganizationsSummary)
  const pagination = useAppSelector(selectAdminOrganizationsPagination)
  const loading = useAppSelector(selectAdminOrganizationsLoading)
  const filterStatus = useAppSelector(selectAdminOrganizationsFilterStatus)

  const [searchQuery, setSearchQuery] = useState('')
  const [rejectConfirmTarget, setRejectConfirmTarget] = useState<{ id: number; name: string } | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  const hasFetched = useRef(false)
  const authReady = isInitialized && isAuthenticated && !!token

  const loadData = useCallback(
    (page = 1, silent = false) => {
      if (!authReady) return
      dispatch(
        fetchAdminOrganizations({
          status: filterStatus,
          search: searchQuery,
          page,
          silent,
        })
      )
    },
    [dispatch, authReady, filterStatus, searchQuery]
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
  }, [filterStatus, authReady, loadData])

  useEffect(() => {
    if (!authReady) return
    const timer = setTimeout(() => {
      loadData(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, authReady, loadData])

  const handleApprove = async (id: number, name: string) => {
    try {
      const res = await dispatch(approveAdminOrganization(id)).unwrap()
      toast.success(res.message || `Organization "${name}" approved successfully!`)
      loadData(pagination.currentPage)
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to approve organization.')
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectConfirmTarget) return
    try {
      const res = await dispatch(
        rejectAdminOrganization({
          orgId: rejectConfirmTarget.id,
          notes: rejectNotes.trim(),
        })
      ).unwrap()

      toast.success(res.message || 'Organization registration rejected.')
      setRejectConfirmTarget(null)
      setRejectNotes('')
      loadData(pagination.currentPage)
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to reject organization.')
    }
  }

  if (authLoading || !isInitialized) {
    return (
      <AdminLayout activePage="organizations">
        <div className="p-8 text-[#8b949e] font-mono text-sm">Loading admin authorization...</div>
      </AdminLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout activePage="organizations">
        <div className="p-8 text-[#f85149] font-mono text-sm">Access Denied. Please log in as Admin.</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activePage="organizations">
      <PageMeta
        title="Organizations"
        description="Manage registered organizations, their details, and verification status."
        path="/admin/organizations"
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#2f81f7]" />
              Organization Verification & Approval
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
              Review institutional buyer registrations, verify TIN credentials, and approve access to procurement pools.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(pagination.currentPage)}
            className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Total Orgs</p>
                <p className="text-lg font-bold font-mono text-[#f0f6fc] mt-0.5">{summary.total}</p>
              </div>
              <Building2 className="w-5 h-5 text-[#8b949e]" />
            </CardContent>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Pending Verification</p>
                <p className="text-lg font-bold font-mono text-[#d29922] mt-0.5">{summary.pending}</p>
              </div>
              <Clock className="w-5 h-5 text-[#d29922]" />
            </CardContent>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Approved / Verified</p>
                <p className="text-lg font-bold font-mono text-[#3fb950] mt-0.5">{summary.verified}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#3fb950]" />
            </CardContent>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Rejected</p>
                <p className="text-lg font-bold font-mono text-[#f85149] mt-0.5">{summary.rejected}</p>
              </div>
              <XCircle className="w-5 h-5 text-[#f85149]" />
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by org name, TIN, or phone..."
              className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#f0f6fc]"
            />
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs font-mono text-[#8b949e] mr-1 hidden sm:inline">Status:</span>
            {['all', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => dispatch(setOrgFilterStatus(st))}
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

        {/* Organizations List */}
        {loading && orgs.length === 0 ? (
          <div className="p-12 text-center text-[#8b949e] font-mono text-sm">
            Loading registered organizations...
          </div>
        ) : orgs.length === 0 ? (
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-[#8b949e] mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[#f0f6fc]">No registered organizations found.</p>
              <p className="text-xs text-[#8b949e] mt-1">
                Try clearing search query or changing verification status filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orgs.map((org) => {
              const statusClass = STATUS_STYLES[org.verificationStatus] || STATUS_STYLES.PENDING

              return (
                <Card key={org.id} className="bg-[#161b22] border-[#30363d] hover:border-[#8b949e]/40 transition-colors">
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-[#f0f6fc]">{org.name}</h3>
                          <Badge variant="outline" className="text-xs border-[#30363d] text-[#8b949e] font-mono">
                            {org.organizationType}
                          </Badge>
                          <Badge className={`text-xs font-semibold ${statusClass}`}>
                            {org.verificationStatus === 'VERIFIED' ? 'Verified' : org.verificationStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#8b949e] mt-1 flex items-center gap-3 flex-wrap font-mono">
                          <span>TIN: <strong className="text-[#f0f6fc]">{org.tinNumber}</strong></span> ·
                          <span>Phone: <strong className="text-[#f0f6fc]">{org.phoneNumber}</strong></span> ·
                          <span>City: <strong className="text-[#f0f6fc]">{org.city}</strong></span>
                        </p>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {org.verificationStatus !== 'VERIFIED' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(org.id, org.name)}
                            className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-8 gap-1 font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                        )}

                        {org.verificationStatus !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectConfirmTarget({ id: org.id, name: org.name })}
                            className="border-[#da3633]/40 !bg-transparent text-[#f85149] hover:!bg-[#da3633]/10 text-xs h-8 gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Details & Address Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono p-3 bg-[#0d1117] rounded border border-[#30363d]">
                      <div>
                        <span className="text-[#8b949e] block text-[10px]">TIN Verification Number:</span>
                        <span className="text-[#f0f6fc] font-semibold">{org.tinNumber}</span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block text-[10px]">Contact Phone:</span>
                        <span className="text-[#f0f6fc] font-semibold">{org.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block text-[10px]">Verification Date:</span>
                        <span className="text-[#58a6ff] font-semibold">
                          {org.verifiedAt ? new Date(org.verifiedAt).toLocaleDateString() : 'Pending Review'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8b949e] block text-[10px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2f81f7]" /> Registered Address:
                        </span>
                        <span className="text-[#f0f6fc] font-semibold">
                          {org.addressFormatted || [org.street, org.subCity, org.area, org.city, org.region].filter(Boolean).join(', ') || 'Addis Ababa'}
                        </span>
                      </div>
                    </div>
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
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrganizations} registered orgs)
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

      {/* REJECT CONFIRMATION MODAL */}
      {rejectConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#da3633]/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#30363d] pb-3 text-[#f85149]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold">Reject Organization Registration</h2>
            </div>

            <p className="text-sm text-[#f0f6fc]">
              Are you sure you want to reject <strong className="text-[#f85149]">"{rejectConfirmTarget.name}"</strong>?
            </p>

            <div>
              <label className="text-xs text-[#8b949e] font-mono block mb-1">Rejection Reason / Notes (Optional)</label>
              <textarea
                rows={3}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="e.g. Invalid TIN number provided or unable to reach phone number."
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-[#f85149]"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#30363d] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectConfirmTarget(null)}
                className="border-[#30363d] !bg-transparent !text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReject}
                size="sm"
                className="bg-[#da3633] hover:bg-[#b82a28] text-white text-xs font-semibold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
