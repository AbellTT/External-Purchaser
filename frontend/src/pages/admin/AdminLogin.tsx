import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, KeyRound, Mail, ArrowRight, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { adminLogin, selectAdminUser } from '@/store/adminSlices/adminAuthSlice'

export function AdminLogin() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const adminUser = useAppSelector(selectAdminUser)

  const [email, setEmail] = useState('admin@babi.et')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // If admin is already authenticated (e.g. pressed browser Back from /admin),
  // redirect back to admin dashboard immediately.
  useEffect(() => {
    if (adminUser) {
      navigate('/admin', { replace: true })
    }
  }, [adminUser, navigate])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await dispatch(adminLogin({ email: email.trim(), password: password.trim() })).unwrap()
      setLoading(false)
      // replace:true removes /admin/login from the history stack so Back
      // from the admin dashboard does NOT return to the login form.
      navigate('/admin', { replace: true })
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Invalid admin email or password')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Portal</h1>
          <p className="text-xs text-slate-400">Stationery Procurement System Administration</p>
        </div>

        {/* Login Form Card */}
        <Card className="border-slate-800 bg-slate-900 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Administrator Credentials
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your credentials to access system control panels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="admin@babi.et"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In as Super Admin'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-3 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 font-mono">
                Use an account with real super-admin access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
