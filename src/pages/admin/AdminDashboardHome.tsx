import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  ShoppingCart,
  Building2,
  DollarSign,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAdminStats,
  selectAdminOrganizations,
  selectAdminOrders,
  approveOrganization,
} from '@/store/slices/adminSlice'

export function AdminDashboardHome() {
  const dispatch = useAppDispatch()
  const stats = useAppSelector(selectAdminStats)
  const organizations = useAppSelector(selectAdminOrganizations)
  const orders = useAppSelector(selectAdminOrders)

  const pendingOrgs = organizations.filter((o) => o.verificationStatus === 'pending')

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Super Admin Overview & Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live statistics, platform revenue, pending approvals, and active order processing queue.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/baskets">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" />
                Create New Basket
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Platform GMV</p>
                <p className="text-lg font-bold text-white font-mono">ETB {(stats.totalGmvEtb / 1000000).toFixed(2)}M</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">Total orders volume</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Active Baskets</p>
                <p className="text-lg font-bold text-white font-mono">{stats.activeBasketsCount}</p>
                <p className="text-[10px] text-blue-400 mt-0.5">Pooling institutional demand</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Pending Approvals</p>
                <p className="text-lg font-bold text-white font-mono">{pendingOrgs.length}</p>
                <p className="text-[10px] text-amber-400 mt-0.5">Newly registered orgs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">User Capital Saved</p>
                <p className="text-lg font-bold text-white font-mono">ETB {(stats.totalCapitalSavedEtb / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-purple-400 mt-0.5">Vs Merkato retail pricing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/admin/baskets">
            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-all border-l-4 border-l-blue-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Basket Control Center</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Open, close, or extend bulk baskets</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/products">
            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-all border-l-4 border-l-emerald-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Daily Price Management</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Update Merkato & direct prices</p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/organizations">
            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-all border-l-4 border-l-amber-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Verify Organizations</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{pendingOrgs.length} accounts awaiting review</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Section: Pending Organization Verification Queue */}
        {pendingOrgs.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs text-amber-400 flex items-center gap-2 font-semibold">
                  <Clock className="w-4 h-4" />
                  Pending Organization Verifications ({pendingOrgs.length})
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  New institutional buyer registrations requiring Super Admin approval
                </CardDescription>
              </div>
              <Link to="/admin/organizations">
                <Button size="sm" variant="outline" className="text-xs border-amber-500/30 text-amber-300 bg-slate-900 hover:bg-slate-800">
                  View All Orgs
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {pendingOrgs.map((org) => (
                  <div key={org.id} className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white">{org.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {org.type} • TIN: {org.tinNumber} • {org.city}, {org.subCity}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => dispatch(approveOrganization(org.id))}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shrink-0 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Institution
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders Processing Queue */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm text-white flex items-center gap-2 font-semibold">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                Live Order Processing Queue
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Institutional purchase orders awaiting status updates or delivery assignment
              </CardDescription>
            </div>
            <Link to="/admin/orders">
              <Button size="sm" variant="outline" className="text-xs border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800 hover:text-white">
                Manage Orders Queue
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2">Order #</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Delivery Address</th>
                    <th className="pb-2">Total (ETB)</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="text-slate-300 hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-semibold text-blue-400">{ord.orderNumber}</td>
                      <td className="py-3 text-slate-400 font-mono">{ord.date}</td>
                      <td className="py-3 text-slate-300 max-w-xs truncate">{ord.delivery.address}</td>
                      <td className="py-3 font-mono font-bold text-white">ETB {ord.pricing.total.toLocaleString()}</td>
                      <td className="py-3">
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
                      <td className="py-3 text-right">
                        <Link to="/admin/orders">
                          <Button size="sm" variant="ghost" className="text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800">
                            Update Status ↗
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
