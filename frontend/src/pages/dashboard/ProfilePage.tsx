import { useState, useEffect, useRef, useCallback } from 'react'
import { PageMeta } from '@/components/PageMeta'
import { User, Building2, Phone, FileText, MapPin, Save, PenLine, Sparkles, Lock, Loader2 } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectUser, selectAuthLoading, updateProfile } from '@/store/slices/authSlice'
import { api, getApiError } from '@/lib/api'
import { toast } from 'sonner'
import type { User as UserType } from '@/types/api'

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
   Geoapify Autocomplete Component (same as Signup.tsx)
───────────────────────────────────────────────────────────── */
function AddressAutocomplete({
  initialValue,
  onSelect,
  disabled = false,
}: {
  initialValue: string
  onSelect: (val: string, details?: GeoapifyFeature['properties']) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<GeoapifyFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY as string

  // Keep query in sync if initialValue changes from outside
  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

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
          id="addressFormatted"
          type="text"
          placeholder="Search location in Addis Ababa..."
          value={query}
          onChange={handleChange}
          autoComplete="off"
          disabled={disabled}
          className="h-10 border-border pl-10 pr-9 text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
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

// ─── Profile Skeleton ─────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-52 bg-muted rounded" />
            <div className="h-4 w-72 bg-muted rounded" />
          </div>
          <div className="h-9 w-28 bg-muted rounded-md" />
        </div>
        {[1, 2].map((i) => (
          <Card key={i} className="border-border">
            <CardHeader>
              <div className="h-5 w-44 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectUser)
  const authLoading = useAppSelector(selectAuthLoading)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [addressMode, setAddressMode] = useState<'auto' | 'manual'>('manual')

  // ── Sync addressMode from user data ───────────────────────────────────────────
  useEffect(() => {
    if (currentUser) {
      setAddressMode(currentUser.address.addressType === 'autocomplete' ? 'auto' : 'manual')
    }
  }, [currentUser])

  // ── Initialize / sync form when user data arrives ─────────────────────────────
  const buildForm = (u: UserType) => ({
    organizationName: u.organizationName ?? '',
    // Normalize org type: the DB stores the display label directly ("University", etc.)
    organizationType: u.organizationType ?? '',
    phoneNumber: u.phoneNumber ?? '',
    tinNumber: u.tinNumber ?? '',
    email: u.email ?? '',
    addressFormatted: u.address?.addressFormatted ?? '',
    street: u.address?.street ?? '',
    subCity: u.address?.subCity ?? '',
    area: u.address?.area ?? '',
    city: u.address?.city ?? 'Addis Ababa',
    region: u.address?.region ?? 'Addis Ababa City Administration',
  })

  const [form, setForm] = useState(() =>
    currentUser ? buildForm(currentUser) : {
      organizationName: '',
      organizationType: '',
      phoneNumber: '',
      tinNumber: '',
      email: '',
      addressFormatted: '',
      street: '',
      subCity: '',
      area: '',
      city: 'Addis Ababa',
      region: 'Addis Ababa City Administration',
    }
  )

  useEffect(() => {
    if (currentUser) {
      setForm(buildForm(currentUser))
    }
  }, [currentUser])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const setSelectValue = (field: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.organizationName.trim()) errs.organizationName = 'Organization name is required'
    if (!form.organizationType) errs.organizationType = 'Select an organization type'
    if (!/^\d{10}$/.test(form.phoneNumber)) errs.phoneNumber = 'Phone number must be exactly 10 digits'
    if (addressMode === 'auto') {
      if (!form.addressFormatted.trim()) errs.addressFormatted = 'Please provide your address'
    } else {
      if (!form.street.trim()) errs.street = 'Street or Building name is required'
      if (!form.subCity.trim()) errs.subCity = 'Sub-city is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      const updates: Partial<UserType> = {
        organizationName: form.organizationName.trim(),
        organizationType: form.organizationType as UserType['organizationType'],
        phoneNumber: form.phoneNumber.trim(),
        tinNumber: form.tinNumber.trim(),
        email: form.email.trim(),
        address: {
          addressType: addressMode === 'auto' ? 'autocomplete' : 'manual',
          addressFormatted: addressMode === 'auto' ? form.addressFormatted.trim() : null,
          street: addressMode === 'manual' ? form.street.trim() : null,
          subCity: addressMode === 'manual' ? form.subCity.trim() : null,
          area: addressMode === 'manual' ? form.area.trim() || null : null,
          city: form.city,
          region: form.region,
        },
      }

      await dispatch(updateProfile(updates)).unwrap()

      setIsEditing(false)
      toast.success('Profile updated successfully!', {
        description: 'Your organization details have been saved.',
      })
    } catch (error) {
      toast.error('Failed to save profile', {
        description: typeof error === 'string' ? error : 'Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (currentUser) {
      setForm(buildForm(currentUser))
      setAddressMode(currentUser.address.addressType === 'autocomplete' ? 'auto' : 'manual')
    }
    setErrors({})
    setIsEditing(false)
  }

  // ── Show skeleton while initializing ──────────────────────────────────────────
  if (authLoading || !currentUser) {
    return <ProfileSkeleton />
  }

  return (
    <DashboardLayout>
      <PageMeta
        title="Profile"
        description="Manage your organization details, contact information, and account settings."
        path="/dashboard/profile"
      />
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Organization Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your organization details and delivery address
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2">
              <PenLine className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Verification Status Card */}
          <Card className="border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">Verification Status</h3>
                      {currentUser?.verificationStatus === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-success/15 text-success border border-success/30">
                          Verified & Approved
                        </span>
                      )}
                      {(currentUser?.verificationStatus === 'pending' || !currentUser?.verificationStatus) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-warning/15 text-warning border border-warning/30">
                          Pending Verification
                        </span>
                      )}
                      {currentUser?.verificationStatus === 'suspended' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-destructive/15 text-destructive border border-destructive/30">
                          Registration Rejected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {currentUser?.verificationStatus === 'approved'
                        ? 'Your organization TIN credentials have been verified by platform admins. You have full access to direct purchases and basket pooling.'
                        : currentUser?.verificationStatus === 'suspended'
                        ? 'Your organization verification was rejected. Please update your TIN credentials or contact support.'
                        : 'Your organization registration is currently undergoing admin verification. You can view catalog prices while pending review.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Details */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organization Details
              </CardTitle>
              <CardDescription>Basic information about your institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Organization Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="orgName" className="font-mono text-xs font-semibold text-foreground">
                    Organization Name
                  </Label>
                  <Input
                    id="orgName"
                    type="text"
                    value={form.organizationName}
                    onChange={setField('organizationName')}
                    disabled={!isEditing}
                    className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                  />
                  {errors.organizationName && <p className="text-xs text-error">{errors.organizationName}</p>}
                </div>

                {/* Organization Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="orgType" className="font-mono text-xs font-semibold text-foreground">
                    Organization Type
                  </Label>
                  <Select
                    value={form.organizationType}
                    onValueChange={setSelectValue('organizationType')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      id="orgType"
                      className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                    >
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.organizationType && <p className="text-xs text-error">{errors.organizationType}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="font-mono text-xs font-semibold text-foreground">
                    Official Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="phoneNumber"
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phoneNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setForm((f) => ({ ...f, phoneNumber: v }))
                        if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }))
                      }}
                      disabled={!isEditing}
                      className="h-10 border-border pl-10 font-mono text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-xs text-error">{errors.phoneNumber}</p>}
                </div>

                {/* TIN Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="tinNumber" className="font-mono text-xs font-semibold text-foreground">
                    TIN Number
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="tinNumber"
                      type="text"
                      value={form.tinNumber}
                      onChange={setField('tinNumber')}
                      disabled={!isEditing}
                      className="h-10 border-border pl-10 font-mono text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-mono text-xs font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  disabled={!isEditing}
                  className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </CardTitle>
              <CardDescription>Update your official delivery location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address mode toggle (only visible while editing) */}
              {isEditing && (
                <div className="grid grid-cols-2 p-1 bg-surface-muted rounded-md border border-border">
                  <button
                    type="button"
                    onClick={() => setAddressMode('auto')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                      addressMode === 'auto'
                        ? 'bg-card text-foreground border border-border shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    Autocomplete
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode('manual')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                      addressMode === 'manual'
                        ? 'bg-card text-foreground border border-border shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Manual Entry
                  </button>
                </div>
              )}

              {addressMode === 'auto' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="addressFormatted" className="font-mono text-xs font-semibold text-foreground">
                    Full Address
                  </Label>
                  {isEditing ? (
                    <>
                      <AddressAutocomplete
                        initialValue={form.addressFormatted}
                        onSelect={(val) => setForm((f) => ({ ...f, addressFormatted: val }))}
                      />
                      {errors.addressFormatted && (
                        <p className="text-xs text-error">{errors.addressFormatted}</p>
                      )}
                    </>
                  ) : (
                    <Input
                      id="addressFormatted"
                      type="text"
                      value={form.addressFormatted}
                      disabled
                      className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                    />
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="street" className="font-mono text-xs font-semibold text-foreground">
                      Street / Building
                    </Label>
                    <Input
                      id="street"
                      type="text"
                      value={form.street}
                      onChange={setField('street')}
                      disabled={!isEditing}
                      placeholder="e.g. Churchill Avenue"
                      className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                    />
                    {errors.street && <p className="text-xs text-error">{errors.street}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subCity" className="font-mono text-xs font-semibold text-foreground">
                      Sub-city (Kifle Ketema)
                    </Label>
                    <Input
                      id="subCity"
                      type="text"
                      value={form.subCity}
                      onChange={setField('subCity')}
                      disabled={!isEditing}
                      placeholder="e.g. Kirkos"
                      className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                    />
                    {errors.subCity && <p className="text-xs text-error">{errors.subCity}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="area" className="font-mono text-xs font-semibold text-foreground">
                      Area / Sefer
                    </Label>
                    <Input
                      id="area"
                      type="text"
                      value={form.area}
                      onChange={setField('area')}
                      disabled={!isEditing}
                      placeholder="e.g. Sidist Kilo"
                      className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="font-mono text-xs font-semibold text-foreground">
                      City
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={form.city}
                      disabled
                      className="h-10 border-border text-sm rounded-md bg-surface-muted cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              <div className="bg-primary-subtle border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Address changes will apply to all future orders. Current pending orders will use the previous address.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save / Cancel Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>

        {/* Password Change Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// ─── Password Change sub-form ─────────────────────────────────────────────────
function PasswordChangeForm() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isChanging, setIsChanging] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.current) errs.current = 'Current password is required'
    if (form.next.length < 8) errs.next = 'New password must be at least 8 characters'
    if (form.next !== form.confirm) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsChanging(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.current,
        newPassword: form.next,
      })
      setForm({ current: '', next: '', confirm: '' })
      toast.success('Password updated!', { description: 'Your new password is now active.' })
    } catch (error) {
      toast.error('Failed to update password', { description: getApiError(error) })
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="Enter your current password"
          value={form.current}
          onChange={(e) => { setForm((f) => ({ ...f, current: e.target.value })); setErrors((p) => ({ ...p, current: '' })) }}
          className="h-10"
        />
        {errors.current && <p className="text-xs text-error">{errors.current}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="Enter new password (min. 8 characters)"
          value={form.next}
          onChange={(e) => { setForm((f) => ({ ...f, next: e.target.value })); setErrors((p) => ({ ...p, next: '' })) }}
          className="h-10"
        />
        {errors.next && <p className="text-xs text-error">{errors.next}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={form.confirm}
          onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setErrors((p) => ({ ...p, confirm: '' })) }}
          className="h-10"
        />
        {errors.confirm && <p className="text-xs text-error">{errors.confirm}</p>}
      </div>

      <Button type="submit" disabled={isChanging} className="w-full sm:w-auto gap-2">
        {isChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        {isChanging ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}
