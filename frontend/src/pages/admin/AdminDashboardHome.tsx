import { useEffect } from 'react'
import { PageMeta } from '@/components/PageMeta'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  ShoppingCart,
  DollarSign,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchAdminOverview,
  selectAdminStats,
  selectAdminOrganizations,
  selectAdminOrders,
  selectAdminLoading,
} from '@/store/slices/adminSlice'

export function AdminDashboardHome() {
  const dispatch = useAppDispatch()
  const stats = useAppSelector(selectAdminStats)
  const pendingOrgs = useAppSelector(selectAdminOrganizations)
  const orders = useAppSelector(selectAdminOrders)
  const loading = useAppSelector(selectAdminLoading)

  useEffect(() => {
    dispatch(fetchAdminOverview())
  }, [dispatch])

  // Formatting GMV
  const gmvFormatted =
    stats.totalGmvEtb >= 1000000
      ? `${(stats.totalGmvEtb / 1000000).toFixed(2)}M`
      : `${(stats.totalGmvEtb / 1000).toFixed(1)}K`

  const savingsFormatted =
    stats.totalCapitalSavedEtb >= 1000000
      ? `${(stats.totalCapitalSavedEtb / 1000000).toFixed(2)}M`
      : `${(stats.totalCapitalSavedEtb / 1000).toFixed(1)}K`

  return (
    <AdminLayout>
      <PageMeta
        title="Admin Dashboard"
        description="Platform-wide overview of baskets, orders, organizations, and market data."
        path="/admin"
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Page Header Bar — Matching AdminOrganizationsPage */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#2f81f7]" />
              Super Admin Overview & Platform Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
              Live statistics, total fulfilled procurement volume, user capital saved via completed baskets, pending approvals, and active order processing queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchAdminOverview())}
              className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs h-9 gap-1.5 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </Button>
            <Link to="/admin/baskets">
              <Button size="sm" className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-9 font-semibold gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                Create New Basket
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview KPI Metrics Bar — Matching AdminOrganizationsPage card structure */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total GMV */}
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Total Fulfilled Volume (GMV)</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-[#f0f6fc] mt-1">
                  ETB {gmvFormatted}
                </p>
                <p className="text-[10px] font-mono text-[#3fb950] mt-0.5">
                  Completed baskets + delivered orders
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-[#3fb950] shrink-0" />
            </CardContent>
          </Card>

          {/* Card 2: User Capital Saved via Baskets */}
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">User Capital Saved via Baskets</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-[#3fb950] mt-1">
                  ETB {savingsFormatted}
                </p>
                <p className="text-[10px] font-mono text-[#8b949e] mt-0.5">
                  vs. Merkato Retailer pricing
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#3fb950] shrink-0" />
            </CardContent>
          </Card>

          {/* Card 3: Active Baskets */}
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Active Open Baskets</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-[#2f81f7] mt-1">
                  {stats.activeBasketsCount}
                </p>
                <p className="text-[10px] font-mono text-[#2f81f7] mt-0.5">
                  Pooling institutional demand
                </p>
              </div>
              <ShoppingBag className="w-5 h-5 text-[#2f81f7] shrink-0" />
            </CardContent>
          </Card>

          {/* Card 4: Pending Approvals */}
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e]">Pending Org Approvals</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-[#d29922] mt-1">
                  {stats.pendingApprovalsCount}
                </p>
                <p className="text-[10px] font-mono text-[#d29922] mt-0.5">
                  Awaiting TIN & registration review
                </p>
              </div>
              <Clock className="w-5 h-5 text-[#d29922] shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link to="/admin/baskets">
            <div className="bg-[#161b22] hover:bg-[#1f242c] p-4 rounded-lg border border-[#30363d] hover:border-[#2f81f7]/50 transition-all flex items-center justify-between group">
              <div>
                <p className="text-xs font-bold text-[#f0f6fc] group-hover:text-[#2f81f7] transition-colors">Basket Control Center</p>
                <p className="text-[11px] text-[#8b949e] font-mono mt-0.5">Open, fulfill, or manage bulk baskets</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8b949e] group-hover:text-[#2f81f7] shrink-0" />
            </div>
          </Link>

          <Link to="/admin/products">
            <div className="bg-[#161b22] hover:bg-[#1f242c] p-4 rounded-lg border border-[#30363d] hover:border-[#3fb950]/50 transition-all flex items-center justify-between group">
              <div>
                <p className="text-xs font-bold text-[#f0f6fc] group-hover:text-[#3fb950] transition-colors">Products & Pricing Management</p>
                <p className="text-[11px] text-[#8b949e] font-mono mt-0.5">Update Merkato & direct purchase prices</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8b949e] group-hover:text-[#3fb950] shrink-0" />
            </div>
          </Link>

          <Link to="/admin/organizations">
            <div className="bg-[#161b22] hover:bg-[#1f242c] p-4 rounded-lg border border-[#30363d] hover:border-[#d29922]/50 transition-all flex items-center justify-between group">
              <div>
                <p className="text-xs font-bold text-[#f0f6fc] group-hover:text-[#d29922] transition-colors">Verify Organizations</p>
                <p className="text-[11px] text-[#8b949e] font-mono mt-0.5">{stats.pendingApprovalsCount} orgs awaiting review</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8b949e] group-hover:text-[#d29922] shrink-0" />
            </div>
          </Link>
        </div>

        {/* Pending Organization Verifications Queue */}
        {pendingOrgs.length > 0 && (
          <Card className="bg-[#161b22] border-[#d29922]/40">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d29922]" />
                  <h2 className="text-sm font-bold text-[#f0f6fc]">
                    Pending Organization Verifications ({pendingOrgs.length})
                  </h2>
                </div>
                <Link to="/admin/organizations">
                  <Button variant="outline" size="sm" className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 text-xs h-8">
                    View All Orgs
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {pendingOrgs.map((org: any) => (
                  <div key={org.id} className="p-3 bg-[#0d1117] border border-[#30363d] rounded flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-[#f0f6fc]">{org.name}</p>
                      <p className="text-[11px] text-[#8b949e] font-mono mt-0.5">
                        {org.organizationType} · TIN: <strong className="text-[#f0f6fc]">{org.tinNumber}</strong> · Phone: {org.phoneNumber}
                      </p>
                    </div>
                    <Link to="/admin/organizations">
                      <Button size="sm" className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-8 gap-1 font-semibold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Review & Approve
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Live Orders Processing Queue */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#2f81f7]" />
                <h2 className="text-sm font-bold text-[#f0f6fc]">
                  Live Order Processing Queue
                </h2>
              </div>
              <Link to="/admin/orders">
                <Button variant="outline" size="sm" className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 text-xs h-8">
                  Manage Orders Queue ↗
                </Button>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-[#8b949e] font-mono text-xs">
                No active orders currently in the queue.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#30363d] text-[#8b949e]">
                      <th className="pb-2.5">Order #</th>
                      <th className="pb-2.5">Customer / Institution</th>
                      <th className="pb-2.5">Total Amount</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]/60">
                    {orders.map((ord: any) => {
                      const st = (ord.status || 'pending').toLowerCase()
                      const statusClass =
                        st === 'delivered'
                          ? 'border-[#238636] bg-[#238636]/10 text-[#3fb950]'
                          : st === 'out-for-delivery'
                          ? 'border-[#2f81f7] bg-[#2f81f7]/10 text-[#58a6ff]'
                          : st === 'accepted'
                          ? 'border-[#238636] bg-[#238636]/10 text-[#3fb950]'
                          : 'border-[#d29922] bg-[#d29922]/10 text-[#d29922]'

                      return (
                        <tr key={ord.id} className="text-[#c9d1d9] hover:bg-[#0d1117]/60">
                          <td className="py-3 font-semibold text-[#58a6ff]">{ord.orderNumber}</td>
                          <td className="py-3 text-[#f0f6fc]">{ord.customerName || ord.organizationName || 'Institutional Buyer'}</td>
                          <td className="py-3 font-bold text-[#f0f6fc]">ETB {(ord.totalAmount || ord.pricing?.total || 0).toLocaleString()}</td>
                          <td className="py-3">
                            <Badge variant="outline" className={`text-[10px] font-mono uppercase ${statusClass}`}>
                              {st}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Link to="/admin/orders">
                              <Button size="sm" variant="ghost" className="text-xs text-[#58a6ff] hover:text-[#79c0ff] hover:bg-white/10 h-7">
                                Update Status ↗
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
