import { useState, useRef } from 'react'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  User,
  Building2,
  MapPin,
  Landmark,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppSelector } from '@/store/hooks'
import {
  selectAdminAuthLoading,
  selectIsAdminAuthenticated,
  selectIsAdminInitialized,
} from '@/store/adminSlices/adminAuthSlice'
import { adminApi } from '@/lib/adminApi'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaxpayerResult {
  name: string
  taxAuthority: string
  taxCenter: string
  region: string
}

type VerifyState = 'idle' | 'loading' | 'success' | 'not_found' | 'error'

// ─── Page ────────────────────────────────────────────────────────────────────

export function AdminTINVerificationPage() {
  const isAuthenticated = useAppSelector(selectIsAdminAuthenticated)
  const authLoading = useAppSelector(selectAdminAuthLoading)
  const isInitialized = useAppSelector(selectIsAdminInitialized)

  const [tinInput, setTinInput] = useState('')
  const [verifyState, setVerifyState] = useState<VerifyState>('idle')
  const [taxpayer, setTaxpayer] = useState<TaxpayerResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastVerifiedTIN, setLastVerifiedTIN] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  // ── Guards ────────────────────────────────────────────────────────────────

  if (authLoading || !isInitialized) {
    return (
      <AdminLayout>
        <div className="p-8 text-[#8b949e] font-mono text-sm">Loading admin authorization...</div>
      </AdminLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="p-8 text-[#f85149] font-mono text-sm">Access Denied. Please log in as Admin.</div>
      </AdminLayout>
    )
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const trimmedTIN = tinInput.trim()

  const handleVerify = async () => {
    if (!trimmedTIN) return
    if (!/^\d{1,15}$/.test(trimmedTIN)) {
      setVerifyState('error')
      setErrorMessage('Invalid TIN format. TIN must contain digits only and must not be empty.')
      setTaxpayer(null)
      return
    }

    setVerifyState('loading')
    setTaxpayer(null)
    setErrorMessage('')
    setLastVerifiedTIN(trimmedTIN)

    try {
      const response = await adminApi.get('/organizations/admin/tin-verify/', {
        params: { tin: trimmedTIN },
      })

      if (response.data?.success && response.data?.taxpayer) {
        setTaxpayer(response.data.taxpayer)
        setVerifyState('success')
      } else {
        setVerifyState('not_found')
        setErrorMessage(response.data?.error || 'TIN not found. Please check the TIN and try again.')
      }
    } catch (err: any) {
      const serverError: string =
        err?.response?.data?.error ||
        err?.message ||
        'An unexpected error occurred during TIN verification.'

      if (err?.response?.status === 404) {
        setVerifyState('not_found')
        setErrorMessage(serverError)
      } else {
        setVerifyState('error')
        setErrorMessage(serverError)
      }
      setTaxpayer(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleVerify()
  }

  const handleReset = () => {
    setTinInput('')
    setVerifyState('idle')
    setTaxpayer(null)
    setErrorMessage('')
    setLastVerifiedTIN('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const isLoading = verifyState === 'loading'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#2f81f7]" />
              Ethiopian TIN Verification
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
              Verify a taxpayer's TIN against the Ethiopian Ministry of Revenue registry and retrieve their registered taxpayer information.
            </p>
          </div>
        </div>

        {/* ── Lookup Card ─────────────────────────────────────────── */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="p-5 space-y-4">

            {/* Card header label */}
            <div className="border-b border-[#30363d] pb-3">
              <h2 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#8b949e]" />
                TIN Lookup
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5 font-mono">
                Enter a valid Ethiopian Tax Identification Number (TIN) to retrieve the registered taxpayer name and authority details.
              </p>
            </div>

            {/* Input + Button row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={tinInput}
                  onChange={(e) => {
                    // Accept only digits — preserve leading zeros
                    const val = e.target.value.replace(/[^\d]/g, '')
                    setTinInput(val)
                    if (verifyState !== 'idle') {
                      setVerifyState('idle')
                      setTaxpayer(null)
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Ethiopian TIN (e.g. 0023905416)"
                  maxLength={15}
                  disabled={isLoading}
                  className="w-full pl-4 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#f0f6fc] disabled:opacity-50 font-mono tracking-wider"
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={isLoading || !trimmedTIN}
                className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-9 gap-1.5 font-semibold shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify TIN
                  </>
                )}
              </Button>
            </div>

            {/* Validation hint */}
            <p className="text-[10px] text-[#8b949e] font-mono">
              TIN must be numeric digits only. Leading zeros are preserved (e.g. "0023905416").
            </p>
          </CardContent>
        </Card>

        {/* ── Result States ────────────────────────────────────────── */}

        {/* SUCCESS */}
        {verifyState === 'success' && taxpayer && (
          <Card className="bg-[#161b22] border-[#238636]/50">
            <CardContent className="p-5 space-y-4">

              {/* Result header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <CheckCircle2 className="w-5 h-5 text-[#3fb950] shrink-0" />
                  <h3 className="text-base font-bold text-[#3fb950]">TIN Verified</h3>
                  <span className="border border-[#238636] bg-[#238636]/10 text-[#3fb950] text-xs font-semibold px-2 py-0.5 rounded-full font-mono">
                    {lastVerifiedTIN}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs h-8 shrink-0"
                >
                  Verify Another TIN
                </Button>
              </div>

              {/* Taxpayer details grid — same style as org details box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0d1117] rounded border border-[#30363d] text-xs font-mono">

                {/* Name — primary field, given prominence */}
                <div className="sm:col-span-2 pb-3 border-b border-[#30363d]">
                  <span className="text-[#8b949e] block text-[10px] flex items-center gap-1 mb-1">
                    <User className="w-3 h-3 text-[#2f81f7]" />
                    Registered Taxpayer Name
                  </span>
                  <span className="text-[#f0f6fc] font-bold text-sm">
                    {taxpayer.name || <span className="text-[#8b949e] italic">— not provided —</span>}
                  </span>
                </div>

                {/* Tax Authority */}
                <div>
                  <span className="text-[#8b949e] block text-[10px] flex items-center gap-1 mb-1">
                    <Building2 className="w-3 h-3 text-[#2f81f7]" />
                    Tax Authority
                  </span>
                  <span className="text-[#f0f6fc] font-semibold">
                    {taxpayer.taxAuthority || <span className="text-[#8b949e] italic">—</span>}
                  </span>
                </div>

                {/* Tax Center */}
                <div>
                  <span className="text-[#8b949e] block text-[10px] flex items-center gap-1 mb-1">
                    <Landmark className="w-3 h-3 text-[#2f81f7]" />
                    Tax Center
                  </span>
                  <span className="text-[#f0f6fc] font-semibold">
                    {taxpayer.taxCenter || <span className="text-[#8b949e] italic">—</span>}
                  </span>
                </div>

                {/* Region */}
                <div>
                  <span className="text-[#8b949e] block text-[10px] flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-[#2f81f7]" />
                    Region
                  </span>
                  <span className="text-[#f0f6fc] font-semibold">
                    {taxpayer.region || <span className="text-[#8b949e] italic">—</span>}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {/* NOT FOUND */}
        {verifyState === 'not_found' && (
          <Card className="bg-[#161b22] border-[#da3633]/40">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#f85149] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#f85149]">TIN Not Found</p>
                    <span className="border border-[#da3633]/40 bg-[#da3633]/10 text-[#f85149] text-xs font-semibold px-2 py-0.5 rounded-full font-mono">
                      {lastVerifiedTIN}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e]">
                    {errorMessage || 'TIN not found. Please check the TIN and try again.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs h-8 mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GENERIC ERROR */}
        {verifyState === 'error' && (
          <Card className="bg-[#161b22] border-[#d29922]/40">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#d29922] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#d29922]">Verification Failed</p>
                  <p className="text-xs text-[#8b949e]">
                    {errorMessage || 'An unexpected error occurred. Please try again.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 hover:!text-[#f0f6fc] text-xs h-8 mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* IDLE — help text */}
        {verifyState === 'idle' && (
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#0d1117] rounded border border-[#30363d] text-xs font-mono">
                <div>
                  <span className="text-[#8b949e] block text-[10px] mb-1">Source</span>
                  <span className="text-[#f0f6fc] font-semibold">Ethiopian Ministry of Revenue</span>
                </div>
                <div>
                  <span className="text-[#8b949e] block text-[10px] mb-1">Data Retrieved</span>
                  <span className="text-[#f0f6fc] font-semibold">Taxpayer name, authority, center, region</span>
                </div>
                <div>
                  <span className="text-[#8b949e] block text-[10px] mb-1">Access Level</span>
                  <span className="text-[#3fb950] font-semibold">Admin Only</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </AdminLayout>
  )
}
