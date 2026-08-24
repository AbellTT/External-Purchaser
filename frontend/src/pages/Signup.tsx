import { useState, useEffect, useRef, useCallback } from 'react'
import { PageMeta } from '@/components/PageMeta'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  MapPin,
  PenLine,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone
} from 'lucide-react'
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
import { useAppDispatch } from '@/store/hooks'
import { register } from '@/store/slices/authSlice'

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

/* ─────────────────────────────────────────────────────────────
   Password Strength Meter
───────────────────────────────────────────────────────────── */
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-error' }
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-accent' }
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-info' }
  return { score: 4, label: 'Strong', color: 'bg-success' }
}

/* ─────────────────────────────────────────────────────────────
   Geoapify Autocomplete Component
───────────────────────────────────────────────────────────── */
function AddressAutocomplete({
  initialValue,
  onSelect
}: {
  initialValue: string
  onSelect: (val: string, details?: GeoapifyFeature['properties']) => void
}) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<GeoapifyFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY as string

  const search = useCallback(
    async (text: string) => {
      if (text.length < 3 || !apiKey) {
        setResults([])
        setIsOpen(false)
        return
      }
      setIsLoading(true)
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&country=et&format=geojson&apiKey=${apiKey}`
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
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handlePick = (feature: GeoapifyFeature) => {
    const formatted = feature.properties.formatted
    setQuery(formatted)
    setIsOpen(false)
    onSelect(formatted, feature.properties)
  }

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
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="address-autocomplete"
          type="text"
          placeholder="Search location in Addis Ababa (e.g. Bole Road, Kirkos)..."
          value={query}
          onChange={handleChange}
          autoComplete="off"
          className="h-10 border-border focus-visible:ring-primary/40 pl-10 pr-9 text-sm rounded-md"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto p-1 divide-y divide-border/40">
          {results.map((f, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handlePick(f)}
                className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-surface-muted transition-colors rounded-md flex flex-col gap-0.5"
              >
                <span className="font-medium text-foreground">
                  {f.properties.address_line1 || f.properties.formatted}
                </span>
                {f.properties.address_line2 && (
                  <span className="text-xs text-muted-foreground">{f.properties.address_line2}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-md shadow-lg px-4 py-3 text-sm text-muted-foreground">
          No matches found. Switch to manual address entry below.
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Step Wizard Signup Component
───────────────────────────────────────────────────────────── */
export function Signup() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [addressMode, setAddressMode] = useState<'auto' | 'manual'>('auto')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [form, setForm] = useState({
    // Step 1: Organization
    orgName: '',
    orgType: '',
    phoneNumber: '',
    tinNumber: '',

    // Step 2: Address (Defaulted to Addis Ababa)
    addressFormatted: '',
    street: '',
    subCity: '',
    area: '',
    city: 'Addis Ababa',
    region: 'Addis Ababa City Administration',

    // Step 3: Credentials
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Automatically redirect to dashboard upon successful registration
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

  const setField = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const setSelectValue = (field: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [field]: val }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const passwordStrength = getPasswordStrength(form.password)

  /* Validate Step 1 */
  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!form.orgName.trim()) errs.orgName = 'Organization name is required'
    if (!form.orgType) errs.orgType = 'Select an organization type'
    if (!/^\d{10}$/.test(form.phoneNumber)) {
      errs.phoneNumber = 'Phone number must be exactly 10 digits (e.g. 0911234567)'
    }
    if (!/^\d{10}$/.test(form.tinNumber)) {
      errs.tinNumber = 'TIN must be exactly 10 digits (e.g. 0012345678)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* Validate Step 2 */
  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (addressMode === 'auto') {
      if (!form.addressFormatted.trim()) {
        errs.addressFormatted = 'Please search and select your location'
      }
    } else {
      if (!form.street.trim()) errs.street = 'Street or Building name is required'
      if (!form.subCity.trim()) errs.subCity = 'Sub-city (Kifle Ketema) is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* Validate Step 3 */
  const validateStep3 = () => {
    const errs: Record<string, string> = {}
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Enter a valid official email address'
    }
    if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2)
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return

    setIsSubmitting(true)
    setErrors((prev) => ({ ...prev, general: '' }))
    
    try {
      await dispatch(register({
        organizationName: form.orgName,
        organizationType: form.orgType,
        phoneNumber: form.phoneNumber,
        tinNumber: form.tinNumber,
        addressType: addressMode === 'auto' ? 'autocomplete' : 'manual',
        addressFormatted: form.addressFormatted || undefined,
        street: form.street || undefined,
        subCity: form.subCity || undefined,
        area: form.area || undefined,
        city: form.city,
        region: form.region,
        email: form.email,
        password: form.password
      })).unwrap()
      
      setIsSubmitting(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsSubmitting(false)
      if (typeof error === 'object' && error !== null) {
        setErrors((prev) => ({
          ...prev,
          email: error.email ? (Array.isArray(error.email) ? error.email[0] : error.email) : '',
          tinNumber: error.tinNumber ? (Array.isArray(error.tinNumber) ? error.tinNumber[0] : error.tinNumber) : '',
          general: typeof error === 'string' ? error : (error.general || 'Registration failed. Please check the fields and try again.')
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          general: typeof error === 'string' ? error : 'Registration failed. Please try again.'
        }))
      }
      console.error('Registration failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral flex flex-col items-center justify-center px-4 py-12">
      <PageMeta
        title="Create Account"
        description="Register your organization on MBE Extra Purchaser and start saving through collective stationery procurement."
        path="/signup"
      />
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

      {/* Main Wizard Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-xl bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      >
        {/* Creative Progress Stepper Header */}
        <div className="bg-surface-muted border-b border-border p-5 space-y-4">
          {/* Step Counter & Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-primary font-semibold">
                Step {currentStep} of 3 — {currentStep === 1 ? 'Organization Details' : currentStep === 2 ? 'Location & Address' : 'Account Credentials'}
              </span>
              <span className="text-muted-foreground font-medium">
                {currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-border/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}
              />
            </div>
          </div>

          {/* Step Badges Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) setCurrentStep(1)
              }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                currentStep === 1
                  ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xs'
                  : currentStep > 1
                  ? 'bg-primary-subtle/50 border-primary/30 text-primary cursor-pointer hover:bg-primary-subtle'
                  : 'bg-card/40 border-border opacity-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                  currentStep === 1
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : <Building2 className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">1. Organization</p>
                <p className="text-[10px] text-muted-foreground truncate">Details & TIN</p>
              </div>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 2 && validateStep1()) setCurrentStep(2)
              }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                currentStep === 2
                  ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xs'
                  : currentStep > 2
                  ? 'bg-primary-subtle/50 border-primary/30 text-primary cursor-pointer hover:bg-primary-subtle'
                  : 'bg-card/40 border-border opacity-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                  currentStep === 2
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > 2
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">2. Address</p>
                <p className="text-[10px] text-muted-foreground truncate">Location & Map</p>
              </div>
            </button>

            {/* Step 3 Pill */}
            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                currentStep === 3
                  ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xs'
                  : 'bg-card/40 border-border opacity-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                  currentStep === 3
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">3. Account</p>
                <p className="text-[10px] text-muted-foreground truncate">Credentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Form Content */}
        <div className="p-8">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-h2 text-foreground">Registration Complete!</h2>
              <p className="text-body-md text-muted-foreground max-w-md mx-auto">
                Your organization <span className="font-semibold text-foreground">{form.orgName}</span> has been successfully registered.
              </p>
              <div className="pt-4 flex items-center justify-center gap-2 text-primary font-mono text-sm font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to Dashboard...
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
                {/* STEP 1: ORGANIZATION DETAILS */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-h2 text-foreground">Organization Details</h2>
                      <p className="text-body-md text-muted-foreground mt-0.5">
                        Tell us about your institution to begin pooled procurement.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Org Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="orgName" className="font-mono text-xs font-semibold text-foreground">
                          Organization name *
                        </Label>
                        <Input
                          id="orgName"
                          type="text"
                          placeholder="e.g. Bekele Molla Primary School / Ministry of Education"
                          value={form.orgName}
                          onChange={setField('orgName')}
                          className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                        />
                        {errors.orgName && <p className="text-xs text-error">{errors.orgName}</p>}
                      </div>

                      {/* Org Type */}
                      <div className="space-y-1.5">
                        <Label htmlFor="orgType" className="font-mono text-xs font-semibold text-foreground">
                          Organization type *
                        </Label>
                        <Select value={form.orgType} onValueChange={setSelectValue('orgType')}>
                          <SelectTrigger id="orgType" className="h-10 border-border focus:ring-primary/40 text-sm rounded-md">
                            <SelectValue placeholder="Select organization category…" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORG_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.orgType && <p className="text-xs text-error">{errors.orgType}</p>}
                      </div>

                      {/* Phone Number Field (10 Digits) */}
                      <div className="space-y-1.5">
                        <Label htmlFor="phoneNumber" className="font-mono text-xs font-semibold text-foreground">
                          Official phone number (10 digits) *
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="phoneNumber"
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="e.g. 0911234567"
                            value={form.phoneNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                              setForm((f) => ({ ...f, phoneNumber: v }))
                              if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }))
                            }}
                            className="h-10 border-border focus-visible:ring-primary/40 pl-10 font-mono tracking-wider text-sm rounded-md"
                          />
                        </div>
                        {errors.phoneNumber ? (
                          <p className="text-xs text-error">{errors.phoneNumber}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            10-digit number. Our procurement team calls each organization to confirm delivery.
                          </p>
                        )}
                      </div>

                      {/* TIN Number */}
                      <div className="space-y-1.5">
                        <Label htmlFor="tinNumber" className="font-mono text-xs font-semibold text-foreground">
                          TIN number (10 digits) *
                        </Label>
                        <Input
                          id="tinNumber"
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="e.g. 0012345678"
                          value={form.tinNumber}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setForm((f) => ({ ...f, tinNumber: v }))
                            if (errors.tinNumber) setErrors((prev) => ({ ...prev, tinNumber: '' }))
                          }}
                          className="h-10 border-border focus-visible:ring-primary/40 font-mono tracking-widest text-sm rounded-md"
                        />
                        {errors.tinNumber ? (
                          <p className="text-xs text-error">{errors.tinNumber}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Official 10-digit Ethiopian Tax Identification Number.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="button" onClick={handleNext} className="h-10 px-7 font-semibold gap-2 rounded-md shadow-xs">
                        Continue to Address
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: ADDRESS INFORMATION */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-h2 text-foreground">Location & Address</h2>
                      <p className="text-body-md text-muted-foreground mt-0.5">
                        Set your official delivery location in Addis Ababa.
                      </p>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-surface-muted rounded-md border border-border">
                      <button
                        type="button"
                        onClick={() => setAddressMode('auto')}
                        className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-md transition-colors ${
                          addressMode === 'auto'
                            ? 'bg-card text-foreground border border-border shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">Address Autocomplete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressMode('manual')}
                        className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-md transition-colors ${
                          addressMode === 'manual'
                            ? 'bg-card text-foreground border border-border shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <PenLine className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Manual Entry</span>
                      </button>
                    </div>

                    {addressMode === 'auto' ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="address-autocomplete" className="font-mono text-xs font-semibold text-foreground">
                            Search address in Addis Ababa
                          </Label>
                          <AddressAutocomplete
                            initialValue={form.addressFormatted}
                            onSelect={(val, details) => {
                              setForm((f) => ({
                                ...f,
                                addressFormatted: val,
                                city: details?.city || 'Addis Ababa',
                                region: details?.state || 'Addis Ababa City Administration',
                              }))
                              if (errors.addressFormatted) {
                                setErrors((prev) => ({ ...prev, addressFormatted: '' }))
                              }
                            }}
                          />
                          {errors.addressFormatted && (
                            <p className="text-xs text-error">{errors.addressFormatted}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Live location search powered by Geoapify maps service.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="subCity" className="font-mono text-xs font-semibold text-foreground">
                              Sub-city (Kifle Ketema)
                            </Label>
                            <Input
                              id="subCity"
                              placeholder="e.g. Bole / Kirkos"
                              value={form.subCity}
                              onChange={setField('subCity')}
                              className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="area" className="font-mono text-xs font-semibold text-foreground">
                              Area / Sefer
                            </Label>
                            <Input
                              id="area"
                              placeholder="e.g. CMC / Gerji"
                              value={form.area}
                              onChange={setField('area')}
                              className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="street" className="font-mono text-xs font-semibold text-foreground">
                            Street / Building name *
                          </Label>
                          <Input
                            id="street"
                            placeholder="e.g. Ras Desta Damtew St, Bldg No. 4"
                            value={form.street}
                            onChange={setField('street')}
                            className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                          />
                          {errors.street && <p className="text-xs text-error">{errors.street}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="subCityM" className="font-mono text-xs font-semibold text-foreground">
                              Sub-city (Kifle Ketema) *
                            </Label>
                            <Input
                              id="subCityM"
                              placeholder="e.g. Bole / Kirkos"
                              value={form.subCity}
                              onChange={setField('subCity')}
                              className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                            />
                            {errors.subCity && <p className="text-xs text-error">{errors.subCity}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="areaM" className="font-mono text-xs font-semibold text-foreground">
                              Area / Sefer
                            </Label>
                            <Input
                              id="areaM"
                              placeholder="e.g. CMC / Gerji"
                              value={form.area}
                              onChange={setField('area')}
                              className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-surface-muted rounded-md border border-border/80 text-xs text-muted-foreground flex items-center justify-between">
                          <span>City & Region fixed to:</span>
                          <span className="font-semibold text-foreground font-mono">Addis Ababa, Ethiopia</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 border-t border-border">
                      <Button type="button" variant="outline" onClick={handleBack} className="h-10 px-6 font-semibold gap-2 rounded-md w-full sm:w-auto">
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button type="button" onClick={handleNext} className="h-10 px-7 font-semibold gap-2 rounded-md shadow-xs w-full sm:w-auto">
                        Continue to Account
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: CREDENTIALS & SUBMIT */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-h2 text-foreground">Account Credentials</h2>
                      <p className="text-body-md text-muted-foreground mt-0.5">
                        Set up your login details for administrative access.
                      </p>
                    </div>

                    {errors.general && (
                      <div className="p-3 bg-error/10 border border-error/20 rounded-md">
                        <p className="text-xs text-error">{errors.general}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Summary box */}
                      <div className="p-4 bg-surface-muted rounded-md border border-border space-y-1.5 text-xs text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Organization:</span> {form.orgName || 'N/A'} ({form.orgType})</p>
                        <p><span className="font-semibold text-foreground">Phone:</span> <span className="font-mono text-foreground">{form.phoneNumber || 'N/A'}</span></p>
                        <p><span className="font-semibold text-foreground">TIN:</span> <span className="font-mono text-foreground">{form.tinNumber}</span></p>
                        <p><span className="font-semibold text-foreground">Location:</span> {addressMode === 'auto' ? form.addressFormatted || 'Auto-searched' : `${form.street}, ${form.subCity ? form.subCity + ', ' : ''}Addis Ababa`}</p>
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label htmlFor="signupEmail" className="font-mono text-xs font-semibold text-foreground">
                          Official email address *
                        </Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          autoComplete="email"
                          placeholder="e.g. procurement@school.edu.et"
                          value={form.email}
                          onChange={setField('email')}
                          className="h-10 border-border focus-visible:ring-primary/40 text-sm rounded-md"
                        />
                        {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="signupPassword" className="font-mono text-xs font-semibold text-foreground">
                          Create password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="signupPassword"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            value={form.password}
                            onChange={setField('password')}
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

                        {/* Password strength meter */}
                        {form.password && (
                          <div className="space-y-1 pt-1">
                            <div className="flex gap-1 h-1.5">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className={`flex-1 rounded-full transition-all duration-300 ${
                                    i <= passwordStrength.score ? passwordStrength.color : 'bg-border'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Password Strength: <span className="font-semibold text-foreground">{passwordStrength.label}</span>
                            </p>
                          </div>
                        )}
                        {errors.password && <p className="text-xs text-error">{errors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="font-mono text-xs font-semibold text-foreground">
                          Confirm password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Re-enter password to confirm"
                            value={form.confirmPassword}
                            onChange={setField('confirmPassword')}
                            className="h-10 border-border focus-visible:ring-primary/40 pr-10 text-sm rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-error">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 border-t border-border">
                      <Button type="button" variant="outline" onClick={handleBack} className="h-10 px-6 font-semibold gap-2 rounded-md w-full sm:w-auto">
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="h-10 px-8 font-semibold gap-2 rounded-md shadow-xs w-full sm:w-auto">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="bg-surface-muted border-t border-border p-4 text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Log in to your account
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
