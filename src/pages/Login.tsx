import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to auth backend
    console.log('Login submit', form)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">babi</span>
        </div>
        <p className="text-label text-muted-foreground">Group Procurement Platform</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
        <div className="mb-7">
          <h1 className="text-h1 text-foreground mb-1">Sign in</h1>
          <p className="text-body-md text-muted-foreground">
            Welcome back. Enter your credentials to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-label text-foreground">
              EMAIL ADDRESS
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="procurement@example.gov.et"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="h-10 border-border focus-visible:ring-primary/40"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-label text-foreground">
                PASSWORD
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:text-primary-hover transition-colors font-medium"
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
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className="h-10 border-border focus-visible:ring-primary/40 pr-10"
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
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 mt-2 font-semibold gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-7 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:text-primary-hover transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm">
        This platform is for institutional procurement officers and administrators only.
      </p>
    </div>
  )
}
