import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { adminApi } from '@/lib/adminApi'
import type { RootState } from '@/store'

export interface AdminOrganization {
  id: number
  name: string
  organizationType: string
  tinNumber: string
  phoneNumber: string
  addressType?: string
  addressFormatted?: string
  street?: string
  subCity?: string
  area?: string
  city: string
  region?: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'
  verificationNotes?: string
  verifiedAt?: string | null
  createdAt: string
}

export interface AdminOrganizationsSummary {
  total: number
  pending: number
  verified: number
  rejected: number
}

interface AdminOrganizationsState {
  organizations: AdminOrganization[]
  summary: AdminOrganizationsSummary
  pagination: {
    currentPage: number
    totalPages: number
    totalOrganizations: number
    pageSize: number
  }
  loading: boolean
  updating: boolean
  error: string | null
  filterStatus: string
}

const initialState: AdminOrganizationsState = {
  organizations: [],
  summary: { total: 0, pending: 0, verified: 0, rejected: 0 },
  pagination: { currentPage: 1, totalPages: 1, totalOrganizations: 0, pageSize: 10 },
  loading: false,
  updating: false,
  error: null,
  filterStatus: 'all',
}

// Fetch registered organizations for admin
export const fetchAdminOrganizations = createAsyncThunk(
  'adminOrganizations/fetchAdminOrganizations',
  async (
    {
      status,
      search,
      page = 1,
    }: {
      status?: string
      search?: string
      page?: number
      silent?: boolean
    },
    { rejectWithValue }
  ) => {
    try {
      const params: Record<string, any> = { page, pageSize: 10 }
      if (status && status !== 'all') params.status = status
      if (search && search.trim()) params.search = search.trim()

      const response = await adminApi.get('/organizations/admin/', { params })
      return response.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch organizations.')
    }
  }
)

// Approve organization
export const approveAdminOrganization = createAsyncThunk(
  'adminOrganizations/approveAdminOrganization',
  async (orgId: number | string, { rejectWithValue }) => {
    try {
      const response = await adminApi.post(`/organizations/admin/${orgId}/approve/`)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to approve organization.')
    }
  }
)

// Reject organization
export const rejectAdminOrganization = createAsyncThunk(
  'adminOrganizations/rejectAdminOrganization',
  async (
    { orgId, notes }: { orgId: number | string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.post(`/organizations/admin/${orgId}/reject/`, { notes })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to reject organization.')
    }
  }
)

const adminOrganizationsSlice = createSlice({
  name: 'adminOrganizations',
  initialState,
  reducers: {
    setOrgFilterStatus(state, action: PayloadAction<string>) {
      state.filterStatus = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminOrganizations.pending, (state, action) => {
      if (!action.meta.arg?.silent) state.loading = true
      state.error = null
    })
    builder.addCase(fetchAdminOrganizations.fulfilled, (state, action) => {
      state.loading = false
      state.organizations = action.payload.organizations || []
      state.pagination = action.payload.pagination || state.pagination
      state.summary = action.payload.summary || state.summary
    })
    builder.addCase(fetchAdminOrganizations.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Approve
    builder.addCase(approveAdminOrganization.pending, (state) => {
      state.updating = true
    })
    builder.addCase(approveAdminOrganization.fulfilled, (state) => {
      state.updating = false
    })
    builder.addCase(approveAdminOrganization.rejected, (state, action) => {
      state.updating = false
      state.error = action.payload as string
    })

    // Reject
    builder.addCase(rejectAdminOrganization.pending, (state) => {
      state.updating = true
    })
    builder.addCase(rejectAdminOrganization.fulfilled, (state) => {
      state.updating = false
    })
    builder.addCase(rejectAdminOrganization.rejected, (state, action) => {
      state.updating = false
      state.error = action.payload as string
    })
  },
})

export const { setOrgFilterStatus } = adminOrganizationsSlice.actions
export default adminOrganizationsSlice.reducer

export const selectAdminOrganizations = (state: RootState) => state.adminOrganizations.organizations
export const selectAdminOrganizationsSummary = (state: RootState) => state.adminOrganizations.summary
export const selectAdminOrganizationsPagination = (state: RootState) => state.adminOrganizations.pagination
export const selectAdminOrganizationsLoading = (state: RootState) => state.adminOrganizations.loading
export const selectAdminOrganizationsFilterStatus = (state: RootState) => state.adminOrganizations.filterStatus
