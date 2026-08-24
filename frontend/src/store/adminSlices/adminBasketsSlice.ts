import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { adminApi } from '@/lib/adminApi'
import type { RootState } from '@/store'

export interface AdminBasketParticipant {
  id: number
  userName: string
  organizationName: string
  committed_quantity: number
  joined_at: string
}

export interface AdminBasket {
  id: number
  name: string
  durationType: 'WEEKLY' | 'MONTHLY' | 'SIX_MONTH'
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'
  productName: string
  productCategory: string
  unitOfMeasure?: string
  brandName: string
  targetQuantity: number
  currentQuantity: number
  merkatoRetailerPrice: number
  regularMarketPrice: number
  babiPlatformPrice?: number | null
  supplierCost?: number | null
  progressPercentage: number
  isTargetReached: boolean
  publishedAt?: string | null
  closedAt?: string | null
  createdAt: string
  deliveryDate?: string | null
  carrierName?: string
  trackingNumber?: string
  deliveryNotes?: string
  deliveryStatus?: string
  participantCount: number
  participants?: AdminBasketParticipant[]
}

export interface AdminBasketsSummary {
  total: number
  open: number
  completed: number
  draft: number
  cancelled: number
}

interface AdminBasketsState {
  baskets: AdminBasket[]
  summary: AdminBasketsSummary
  pagination: {
    currentPage: number
    totalPages: number
    totalBaskets: number
    pageSize: number
  }
  loading: boolean
  creating: boolean
  closing: boolean
  cancelling: boolean
  updatingDelivery: boolean
  error: string | null
  filterStatus: string
  filterDuration: string
}

const initialState: AdminBasketsState = {
  baskets: [],
  summary: { total: 0, open: 0, completed: 0, draft: 0, cancelled: 0 },
  pagination: { currentPage: 1, totalPages: 1, totalBaskets: 0, pageSize: 10 },
  loading: false,
  creating: false,
  closing: false,
  cancelling: false,
  updatingDelivery: false,
  error: null,
  filterStatus: 'all',
  filterDuration: 'ALL',
}

// Fetch all baskets for admin with server-side pagination, status, duration, and search
export const fetchAdminBaskets = createAsyncThunk(
  'adminBaskets/fetchAdminBaskets',
  async (
    {
      status,
      duration_type,
      search,
      page = 1,
    }: {
      status?: string
      duration_type?: string
      search?: string
      page?: number
      silent?: boolean
    },
    { rejectWithValue }
  ) => {
    try {
      const params: Record<string, any> = { page, pageSize: 10 }
      if (status && status !== 'all') params.status = status
      if (duration_type && duration_type !== 'ALL') params.duration_type = duration_type
      if (search && search.trim()) params.search = search.trim()

      const response = await adminApi.get('/baskets/admin/', { params })
      return response.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch admin baskets.')
    }
  }
)

// Create basket
export const createAdminBasket = createAsyncThunk(
  'adminBaskets/createAdminBasket',
  async (
    payload: {
      name: string
      durationType: string
      targetQuantity: number
      productId: number | string
      brandId: number | string
      publish?: boolean
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.post('/baskets/admin/create/', payload)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create basket.')
    }
  }
)

// Close / fulfill basket
export const closeAdminBasket = createAsyncThunk(
  'adminBaskets/closeAdminBasket',
  async (
    {
      basketId,
      babiPlatformPrice,
      supplierCost,
    }: {
      basketId: number | string
      babiPlatformPrice: number
      supplierCost: number
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.patch(`/baskets/admin/${basketId}/close/`, {
        babiPlatformPrice,
        supplierCost,
      })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fulfill basket.')
    }
  }
)

// Cancel basket
export const cancelAdminBasket = createAsyncThunk(
  'adminBaskets/cancelAdminBasket',
  async (basketId: number | string, { rejectWithValue }) => {
    try {
      const response = await adminApi.post(`/baskets/admin/${basketId}/cancel/`)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to cancel basket.')
    }
  }
)

// Update delivery details
export const updateAdminBasketDelivery = createAsyncThunk(
  'adminBaskets/updateAdminBasketDelivery',
  async (
    {
      basketId,
      deliveryDate,
      carrierName,
      trackingNumber,
      deliveryNotes,
      deliveryStatus,
    }: {
      basketId: number | string
      deliveryDate?: string
      carrierName?: string
      trackingNumber?: string
      deliveryNotes?: string
      deliveryStatus?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.post(`/baskets/admin/${basketId}/delivery/`, {
        deliveryDate,
        carrierName,
        trackingNumber,
        deliveryNotes,
        deliveryStatus,
      })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update delivery details.')
    }
  }
)

const adminBasketsSlice = createSlice({
  name: 'adminBaskets',
  initialState,
  reducers: {
    setFilterStatus(state, action: PayloadAction<string>) {
      state.filterStatus = action.payload
    },
    setFilterDuration(state, action: PayloadAction<string>) {
      state.filterDuration = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminBaskets.pending, (state, action) => {
      if (!action.meta.arg?.silent) state.loading = true
      state.error = null
    })
    builder.addCase(fetchAdminBaskets.fulfilled, (state, action) => {
      state.loading = false
      state.baskets = action.payload.baskets || []
      state.pagination = action.payload.pagination || state.pagination
      state.summary = action.payload.summary || state.summary
    })
    builder.addCase(fetchAdminBaskets.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create
    builder.addCase(createAdminBasket.pending, (state) => {
      state.creating = true
    })
    builder.addCase(createAdminBasket.fulfilled, (state) => {
      state.creating = false
    })
    builder.addCase(createAdminBasket.rejected, (state, action) => {
      state.creating = false
      state.error = action.payload as string
    })

    // Close
    builder.addCase(closeAdminBasket.pending, (state) => {
      state.closing = true
    })
    builder.addCase(closeAdminBasket.fulfilled, (state) => {
      state.closing = false
    })
    builder.addCase(closeAdminBasket.rejected, (state, action) => {
      state.closing = false
      state.error = action.payload as string
    })

    // Cancel
    builder.addCase(cancelAdminBasket.pending, (state) => {
      state.cancelling = true
    })
    builder.addCase(cancelAdminBasket.fulfilled, (state) => {
      state.cancelling = false
    })
    builder.addCase(cancelAdminBasket.rejected, (state, action) => {
      state.cancelling = false
      state.error = action.payload as string
    })

    // Delivery
    builder.addCase(updateAdminBasketDelivery.pending, (state) => {
      state.updatingDelivery = true
    })
    builder.addCase(updateAdminBasketDelivery.fulfilled, (state) => {
      state.updatingDelivery = false
    })
    builder.addCase(updateAdminBasketDelivery.rejected, (state, action) => {
      state.updatingDelivery = false
      state.error = action.payload as string
    })
  },
})

export const { setFilterStatus, setFilterDuration } = adminBasketsSlice.actions
export default adminBasketsSlice.reducer

export const selectAdminBaskets = (state: RootState) => state.adminBaskets.baskets
export const selectAdminBasketsSummary = (state: RootState) => state.adminBaskets.summary
export const selectAdminBasketsPagination = (state: RootState) => state.adminBaskets.pagination
export const selectAdminBasketsLoading = (state: RootState) => state.adminBaskets.loading
export const selectAdminBasketsFilterStatus = (state: RootState) => state.adminBaskets.filterStatus
export const selectAdminBasketsFilterDuration = (state: RootState) => state.adminBaskets.filterDuration
