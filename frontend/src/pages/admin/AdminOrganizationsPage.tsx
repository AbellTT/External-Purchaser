import { Building2, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAdminOrganizations, approveOrganization, suspendOrganization } from '@/store/slices/adminSlice'

export function AdminOrganizationsPage() {
  const dispatch = useAppDispatch()
  const organizations = useAppSelector(selectAdminOrganizations)

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Organization Verification & Accounts
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review registered schools, NGOs, government offices, and companies to grant platform access.
            </p>
          </div>
        </div>

        {/* Organizations List */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="py-4 px-6 border-b border-slate-800">
            <CardTitle className="text-sm text-white">Institutional Buyers Directory ({organizations.length})</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Only verified institutions can place orders and participate in bulk procurement baskets
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/40">
                    <th className="p-4">Organization Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">TIN & Contact</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {organizations.map((org) => (
                    <tr key={org.id} className="text-slate-300 hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white">{org.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Reg Date: {org.registeredDate}</p>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{org.type}</td>
                      <td className="p-4">
                        <p className="font-mono text-slate-200">{org.email}</p>
                        <p className="text-[11px] text-slate-400 font-mono">TIN: {org.tinNumber}</p>
                      </td>
                      <td className="p-4 text-slate-300">
                        {org.city}, {org.subCity}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={
                            org.verificationStatus === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : org.verificationStatus === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }
                        >
                          {org.verificationStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {org.verificationStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => dispatch(approveOrganization(org.id))}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                        )}
                        {org.verificationStatus === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dispatch(suspendOrganization(org.id))}
                            className="text-xs border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Suspend
                          </Button>
                        )}
                        {org.verificationStatus === 'suspended' && (
                          <Button
                            size="sm"
                            onClick={() => dispatch(approveOrganization(org.id))}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Re-Approve
                          </Button>
                        )}
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
