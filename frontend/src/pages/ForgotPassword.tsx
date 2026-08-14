import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid official email address')
      return
    }

    setIsSubmitting(true)
    setError('')
    await new Promise((res) => setTimeout(res, 1200))
    setIsSubmitting(false)
    setIsSubmitted(true)
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

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-sm p-8"
      >
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-4"
          >
            <div className="w-14 h-14 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-h2 text-foreground">Check Your Email</h2>
            <p className="text-body-md text-muted-foreground">
              Password recovery instructions have been sent to <span className="font-semibold text-foreground">{email}</span>.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full h-10 font-semibold gap-2">
                <Link to="/login">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Log In
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-primary-subtle text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-h2 text-foreground">Reset Password</h1>
              <p className="text-body-md text-muted-foreground">
                Enter your administrative email and we'll send you password recovery link.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="font-mono text-xs font-semibold text-foreground">
                  Official email address *
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="e.g. admin@school.edu.et"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                />
                {error && <p className="text-xs text-error">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-semibold shadow-xs rounded-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending Link...
                  </>
                ) : (
                  'Send Recovery Link'
                )}
              </Button>
            </form>

            <div className="pt-2 text-center border-t border-border">
              <Link to="/login" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Log In
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
