import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Valid official email address is required'
    }
    if (!form.password) {
      errs.password = 'Password is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    await new Promise((res) => setTimeout(res, 1000))
    setIsLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-neutral flex flex-col items-center justify-center px-4 py-12">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-xs group-hover:bg-primary-hover transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.2}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <span className="font-display font-bold text-2xl text-foreground tracking-tight">External Purchaser</span>
        </Link>
        <p className="text-body-md text-muted-foreground">
          Ethiopian Institutional Group Procurement Platform
        </p>
      </motion.div>

      {/* Card - DESIGN.md Level 1 Elevation */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-sm overflow-hidden p-8"
      >
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-h1 text-foreground">Log in</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-primary-subtle text-primary rounded-full">
              Member Portal
            </span>
          </div>
          <p className="text-body-md text-muted-foreground">
            Enter your administrative email and password to log in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-mono text-xs font-semibold text-foreground">
              Official email address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="procurement@example.gov.et"
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }))
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              required
              className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
            />
            {errors.email && <p className="text-xs text-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-mono text-xs font-semibold text-foreground">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }))
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                }}
                required
                className="h-10 border-border focus-visible:ring-primary/40 pr-10 text-sm rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error">{errors.password}</p>}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 font-semibold gap-2 text-sm rounded-md shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Log In to Dashboard
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              Register your organization
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
        Authorized access for Ethiopian schools, universities & organizations.
      </p>
    </div>
  )
}
