import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, MapPin, PenLine, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ─────────────────────────────────────────────────────────────
   Geoapify Autocomplete Types
───────────────────────────────────────────────────────────── */
interface GeoapifyFeature {
  properties: {
    formatted: string
    address_line1?: string
    address_line2?: string
    city?: string
    district?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
}

interface GeoapifyResponse {
  features: GeoapifyFeature[]
}

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const ORG_TYPES = [
  'School',
  'University',
  'Government Office',
  'NGO',
  'Private Company',
  'Bank & Financial Institution',
  'Hospital & Health Centre',
] as const

const REGIONS = [
  'Addis Ababa City Administration',
  'Dire Dawa City Administration',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'South Ethiopia',
  'SNNPR',
  'Tigray',
  'Central Ethiopia',
] as const

/* ─────────────────────────────────────────────────────────────
   Password Strength Indicator
───────────────────────────────────────────────────────────── */
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-error' }
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-warning' }
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-info' }
  return { score: 4, label: 'Strong', color: 'bg-success' }
}

/* ─────────────────────────────────────────────────────────────
   Section Header
───────────────────────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 bg-border" />
      <h2 className="text-label text-muted-foreground whitespace-nowrap">{children}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Geoapify Autocomplete Field
───────────────────────────────────────────────────────────── */
function AddressAutocomplete({ onSelect }: { onSelect: (val: string) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoapifyFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY as string

  const search = useCallback(
    async (text: string) => {
      if (text.length < 3) {
        setResults([])
        setIsOpen(false)
        return
      }
      setIsLoading(true)
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&country=et&format=geojson&apiKey=${apiKey}`
        const res = await fetch(url)
        const data: GeoapifyResponse = await res.json()
        setResults(data.features ?? [])
        setIsOpen(true)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [apiKey]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 350)
  }

  const handlePick = (feature: GeoapifyFeature) => {
    const formatted = feature.properties.formatted
    setQuery(formatted)
    setIsOpen(false)
    onSelect(formatted)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="address-autocomplete"
          type="text"
          placeholder="Start typing your address…"
          value={query}
          onChange={handleChange}
          autoComplete="off"
          className="h-10 border-border focus-visible:ring-primary/40 pl-9 pr-8"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
          {results.map((f, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handlePick(f)}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50 last:border-0"
              >
                <span className="font-medium">{f.properties.address_line1}</span>
                {f.properties.address_line2 && (
                  <span className="text-muted-foreground ml-1">— {f.properties.address_line2}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-md px-4 py-3 text-sm text-muted-foreground">
          No results found. Try manual entry below.
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Signup Page
───────────────────────────────────────────────────────────── */
export function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [addressMode, setAddressMode] = useState<'auto' | 'manual'>('auto')
  const [expandedAddress, setExpandedAddress] = useState(false)

  const [form, setForm] = useState({
    orgName: '',
    orgType: '',
    tinNumber: '',
    // Autocomplete
    addressFormatted: '',
    // Manual
    street: '',
    subCity: '',
    area: '',
    city: '',
    region: '',
    // Credentials
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Partial<typeof form & { confirmPassword: string }>>({})

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const setSelect = (field: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }))

  const passwordStrength = getPasswordStrength(form.password)

  const validate = () => {
    const e: Partial<typeof form & { confirmPassword: string }> = {}
    if (!form.orgName) e.orgName = 'Required'
    if (!form.orgType) e.orgType = 'Required'
    if (!/^\d{10}$/.test(form.tinNumber)) e.tinNumber = 'TIN must be exactly 10 digits'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // TODO: connect to auth backend
    console.log('Signup submit', form)
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
      <div className="w-full max-w-lg bg-card border border-border rounded-lg p-8 mb-6">
        <div className="mb-7">
          <h1 className="text-h1 text-foreground mb-1">Create an account</h1>
          <p className="text-body-md text-muted-foreground">
            Register your organization to start pooling procurement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ── ORGANIZATION DETAILS ── */}
          <SectionHeading>ORGANIZATION DETAILS</SectionHeading>

          <div className="space-y-4">
            {/* Org Name */}
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-label text-foreground">
                ORGANIZATION NAME
              </Label>
              <Input
                id="orgName"
                type="text"
                placeholder="e.g. Bekele Molla Primary School"
                value={form.orgName}
                onChange={set('orgName')}
                required
                className="h-10 border-border focus-visible:ring-primary/40"
              />
              {errors.orgName && <p className="text-xs text-error">{errors.orgName}</p>}
            </div>

            {/* Org Type */}
            <div className="space-y-1.5">
              <Label htmlFor="orgType" className="text-label text-foreground">
                ORGANIZATION TYPE
              </Label>
              <Select onValueChange={setSelect('orgType')}>
                <SelectTrigger id="orgType" className="h-10 border-border focus:ring-primary/40">
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.orgType && <p className="text-xs text-error">{errors.orgType}</p>}
            </div>

            {/* TIN Number */}
            <div className="space-y-1.5">
              <Label htmlFor="tinNumber" className="text-label text-foreground">
                TIN NUMBER
              </Label>
              <Input
                id="tinNumber"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit taxpayer ID"
                value={form.tinNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setForm((f) => ({ ...f, tinNumber: v }))
                }}
                required
                className="h-10 border-border focus-visible:ring-primary/40 font-mono tracking-widest"
              />
              {errors.tinNumber
                ? <p className="text-xs text-error">{errors.tinNumber}</p>
                : <p className="text-xs text-muted-foreground">Your 10-digit Ethiopian Tax Identification Number</p>
              }
            </div>
          </div>

          {/* ── ADDRESS ── */}
          <SectionHeading>ADDRESS</SectionHeading>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-1">
            <button
              type="button"
              onClick={() => setAddressMode('auto')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                addressMode === 'auto'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
              }`}
            >
              <MapPin className="w-3 h-3" />
              Search Address
            </button>
            <button
              type="button"
              onClick={() => setAddressMode('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                addressMode === 'manual'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
              }`}
            >
              <PenLine className="w-3 h-3" />
              Enter Manually
            </button>
          </div>

          <div className="space-y-4">
            {addressMode === 'auto' ? (
              <div className="space-y-1.5">
                <Label htmlFor="address-autocomplete" className="text-label text-foreground">
                  SEARCH YOUR ADDRESS
                </Label>
                <AddressAutocomplete
                  onSelect={(val) => setForm((f) => ({ ...f, addressFormatted: val }))}
                />
                <p className="text-xs text-muted-foreground">
                  Powered by Geoapify · Ethiopia addresses only
                </p>
                {/* Optional: reveal manual fields to refine */}
                <button
                  type="button"
                  onClick={() => setExpandedAddress((v) => !v)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors font-medium mt-1"
                >
                  {expandedAddress ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {expandedAddress ? 'Hide details' : 'Add specific details (sub-city, area)'}
                </button>

                {expandedAddress && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="subCity" className="text-label text-foreground">SUB-CITY</Label>
                        <Input id="subCity" placeholder="e.g. Bole" value={form.subCity} onChange={set('subCity')} className="h-10 border-border focus-visible:ring-primary/40" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="area" className="text-label text-foreground">AREA (SEFER)</Label>
                        <Input id="area" placeholder="e.g. CMC" value={form.area} onChange={set('area')} className="h-10 border-border focus-visible:ring-primary/40" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="street" className="text-label text-foreground">STREET / BUILDING</Label>
                  <Input id="street" placeholder="e.g. Bole Road, Bldg No. 42" value={form.street} onChange={set('street')} className="h-10 border-border focus-visible:ring-primary/40" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="subCityM" className="text-label text-foreground">SUB-CITY</Label>
                    <Input id="subCityM" placeholder="e.g. Bole" value={form.subCity} onChange={set('subCity')} className="h-10 border-border focus-visible:ring-primary/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="areaM" className="text-label text-foreground">AREA (SEFER)</Label>
                    <Input id="areaM" placeholder="e.g. CMC" value={form.area} onChange={set('area')} className="h-10 border-border focus-visible:ring-primary/40" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-label text-foreground">CITY / TOWN</Label>
                    <Input id="city" placeholder="e.g. Addis Ababa" value={form.city} onChange={set('city')} className="h-10 border-border focus-visible:ring-primary/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="region" className="text-label text-foreground">REGION</Label>
                    <Select onValueChange={setSelect('region')}>
                      <SelectTrigger id="region" className="h-10 border-border focus:ring-primary/40">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── ACCOUNT CREDENTIALS ── */}
          <SectionHeading>ACCOUNT CREDENTIALS</SectionHeading>

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="signupEmail" className="text-label text-foreground">EMAIL ADDRESS</Label>
              <Input
                id="signupEmail"
                type="email"
                autoComplete="email"
                placeholder="procurement@example.gov.et"
                value={form.email}
                onChange={set('email')}
                required
                className="h-10 border-border focus-visible:ring-primary/40"
              />
              {errors.email && <p className="text-xs text-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="signupPassword" className="text-label text-foreground">PASSWORD</Label>
              <div className="relative">
                <Input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={set('password')}
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
              {/* Strength meter */}
              {form.password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className="font-medium text-foreground">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-label text-foreground">CONFIRM PASSWORD</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  className="h-10 border-border focus-visible:ring-primary/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-10 font-semibold mt-2">
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-7 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:text-primary-hover transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
