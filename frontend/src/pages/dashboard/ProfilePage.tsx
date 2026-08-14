import { useState, useEffect } from 'react'
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
import { selectUser, selectAuthLoading, setUser } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import type { User as UserType } from '@/types/api'
import loginMockData from '@/data/auth/loginResponse.json'

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

  // ── 1. Self-Hydration: if Redux has no user (edge case), load from mock ──────
  useEffect(() => {
    if (!currentUser) {
      // In production this should be: dispatch(fetchProfile()) → GET /api/user/profile
      // For now: load from mock login response which mirrors the GET /api/user/profile response
      const mockUser = loginMockData.data.user as UserType
      dispatch(setUser(mockUser))
    }
  }, [currentUser, dispatch])

  // ── 2. Sync addressMode from user data ────────────────────────────────────────
  useEffect(() => {
    if (currentUser) {
      setAddressMode(currentUser.address.addressType === 'autocomplete' ? 'auto' : 'manual')
    }
  }, [currentUser])

  // ── 3. Initialize form when user data arrives ─────────────────────────────────
  const [form, setForm] = useState({
    organizationName: '',
    organizationType: 'University',
    phoneNumber: '',
    tinNumber: '',
    email: '',
    addressFormatted: '',
    street: '',
    subCity: '',
    area: '',
    city: '',
    region: '',
  })

  useEffect(() => {
    if (currentUser) {
      setForm({
        organizationName: currentUser.organizationName,
        organizationType: currentUser.organizationType,
        phoneNumber: currentUser.phoneNumber,
        tinNumber: currentUser.tinNumber,
        email: currentUser.email,
        addressFormatted: currentUser.address.addressFormatted ?? '',
        street: currentUser.address.street ?? '',
        subCity: currentUser.address.subCity ?? '',
        area: currentUser.address.area ?? '',
        city: currentUser.address.city,
        region: currentUser.address.region,
      })
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
      // Production: dispatch(updateProfile({ ... })).unwrap()
      // Mock: build the updated user and dispatch setUser directly
      const updatedUser: UserType = {
        ...currentUser!,
        organizationName: form.organizationName,
        organizationType: form.organizationType as UserType['organizationType'],
        phoneNumber: form.phoneNumber,
        address: {
          addressType: addressMode === 'auto' ? 'autocomplete' : 'manual',
          addressFormatted: addressMode === 'auto' ? form.addressFormatted : null,
          street: addressMode === 'manual' ? form.street : null,
          subCity: addressMode === 'manual' ? form.subCity : null,
          area: form.area || null,
          city: form.city,
          region: form.region,
        },
      }

      // Simulate API call delay
      await new Promise((res) => setTimeout(res, 700))

      dispatch(setUser(updatedUser))
      setIsEditing(false)
      toast.success('Profile updated successfully!', {
        description: 'Your organization details have been saved.',
      })
    } catch {
      toast.error('Failed to save profile', {
        description: 'Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form back to current Redux user data
    if (currentUser) {
      setForm({
        organizationName: currentUser.organizationName,
        organizationType: currentUser.organizationType,
        phoneNumber: currentUser.phoneNumber,
        tinNumber: currentUser.tinNumber,
        email: currentUser.email,
        addressFormatted: currentUser.address.addressFormatted ?? '',
        street: currentUser.address.street ?? '',
        subCity: currentUser.address.subCity ?? '',
        area: currentUser.address.area ?? '',
        city: currentUser.address.city,
        region: currentUser.address.region,
      })
      setAddressMode(currentUser.address.addressType === 'autocomplete' ? 'auto' : 'manual')
    }
    setErrors({})
    setIsEditing(false)
  }

  // ── Show skeleton while fetching ──────────────────────────────────────────────
  if (authLoading || !currentUser) {
    return <ProfileSkeleton />
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
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
                    <SelectTrigger id="orgType" className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default">
                      <SelectValue />
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

                {/* TIN Number (Read-only always) */}
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
                      disabled
                      className="h-10 border-border pl-10 font-mono text-sm rounded-md bg-surface-muted cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    TIN cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              {/* Email (Read-only always) */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-mono text-xs font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  disabled
                  className="h-10 border-border text-sm rounded-md bg-surface-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  To change email, please contact support for verification.
                </p>
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
                  <Input
                    id="addressFormatted"
                    type="text"
                    value={form.addressFormatted}
                    onChange={setField('addressFormatted')}
                    disabled={!isEditing}
                    placeholder="Search location in Addis Ababa..."
                    className="h-10 border-border text-sm rounded-md disabled:opacity-100 disabled:cursor-default"
                  />
                  {errors.addressFormatted && <p className="text-xs text-error">{errors.addressFormatted}</p>}
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
      // Production: call POST /api/auth/change-password
      await new Promise((res) => setTimeout(res, 700))
      setForm({ current: '', next: '', confirm: '' })
      toast.success('Password updated!', { description: 'Your new password is now active.' })
    } catch {
      toast.error('Failed to update password', { description: 'Please try again.' })
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
