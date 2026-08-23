import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import type { RootState } from '@/store'

export interface UserBasket {
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
  userCommittedQuantity: number
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
  participatingOrganizations?: string[]
}

export interface BasketsPagination {
  currentPage: number
  totalPages: number
  totalBaskets: number
  pageSize: number
}

interface BasketsState {
  openBaskets: UserBasket[]
  openPagination: BasketsPagination
  userActiveBaskets: UserBasket[]
  activePagination: BasketsPagination
  userCompletedBaskets: UserBasket[]
  completedPagination: BasketsPagination
  platformHistoryBaskets: UserBasket[]
  historyPagination: BasketsPagination
  loading: boolean
  historyLoading: boolean
  committing: boolean
  error: string | null
}

const defaultPagination: BasketsPagination = {
  currentPage: 1,
  totalPages: 1,
  totalBaskets: 0,
  pageSize: 6,
}

const initialState: BasketsState = {
  openBaskets: [],
  openPagination: { ...defaultPagination },
  userActiveBaskets: [],
  activePagination: { ...defaultPagination },
  userCompletedBaskets: [],
  completedPagination: { ...defaultPagination },
  platformHistoryBaskets: [],
  historyPagination: { ...defaultPagination },
  loading: false,
  historyLoading: false,
  committing: false,
  error: null,
}

// Fetch user baskets by tab: 'active', 'open', or 'completed'
export const fetchUserBaskets = createAsyncThunk(
  'baskets/fetchUserBaskets',
  async (
    {
      tab = 'open',
      page = 1,
      pageSize = 6,
      search,
      duration_type,
      silent = false,
    }: {
      tab?: 'active' | 'open' | 'completed'
      page?: number
      pageSize?: number
      search?: string
      duration_type?: string
      silent?: boolean
    },
    { rejectWithValue }
  ) => {
    try {
      const params: Record<string, any> = { tab, page, pageSize }
      if (search && search.trim()) params.search = search.trim()
      if (duration_type && duration_type !== 'ALL') params.duration_type = duration_type

      const response = await api.get('/baskets/', { params })
      return { tab, ...response.data.data }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch baskets.')
    }
  }
)

// Fetch all historical platform baskets (completed, closed, cancelled)
export const fetchPlatformBasketHistory = createAsyncThunk(
  'baskets/fetchPlatformBasketHistory',
  async (
    {
      page = 1,
      pageSize = 6,
      search,
      duration_type,
      silent = false,
    }: {
      page?: number
      pageSize?: number
      search?: string
      duration_type?: string
      silent?: boolean
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params: Record<string, any> = { page, pageSize }
      if (search && search.trim()) params.search = search.trim()
      if (duration_type && duration_type !== 'ALL') params.duration_type = duration_type

      const response = await api.get('/baskets/history/', { params })
      return response.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch basket history.')
    }
  }
)

// User join & commit quantity (or quantity=0 to leave)
export const commitBasketQuantity = createAsyncThunk(
  'baskets/commitBasketQuantity',
  async (
    { basketId, quantity }: { basketId: number | string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/baskets/${basketId}/join/`, { quantity })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to commit quantity.')
    }
  }
)

const basketsSlice = createSlice({
  name: 'baskets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserBaskets.pending, (state, action) => {
      if (!action.meta.arg?.silent) state.loading = true
      state.error = null
    })
    builder.addCase(fetchUserBaskets.fulfilled, (state, action) => {
      state.loading = false
      if (action.payload.tab === 'completed') {
        state.userCompletedBaskets = action.payload.baskets || []
        state.completedPagination = action.payload.pagination || state.completedPagination
      } else if (action.payload.tab === 'active') {
        state.userActiveBaskets = action.payload.baskets || []
        state.activePagination = action.payload.pagination || state.activePagination
      } else {
        state.openBaskets = action.payload.baskets || []
        state.openPagination = action.payload.pagination || state.openPagination
      }
    })
    builder.addCase(fetchUserBaskets.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Platform history
    builder.addCase(fetchPlatformBasketHistory.pending, (state, action) => {
      if (!action.meta.arg?.silent) state.historyLoading = true
      state.error = null
    })
    builder.addCase(fetchPlatformBasketHistory.fulfilled, (state, action) => {
      state.historyLoading = false
      state.platformHistoryBaskets = action.payload.baskets || []
      state.historyPagination = action.payload.pagination || state.historyPagination
    })
    builder.addCase(fetchPlatformBasketHistory.rejected, (state, action) => {
      state.historyLoading = false
      state.error = action.payload as string
    })

    // Commit
    builder.addCase(commitBasketQuantity.pending, (state) => {
      state.committing = true
    })
    builder.addCase(commitBasketQuantity.fulfilled, (state) => {
      state.committing = false
    })
    builder.addCase(commitBasketQuantity.rejected, (state, action) => {
      state.committing = false
      state.error = action.payload as string
    })
  },
})

export default basketsSlice.reducer

export const selectOpenBaskets = (state: RootState) => state.baskets.openBaskets
export const selectOpenPagination = (state: RootState) => state.baskets.openPagination
export const selectActiveUserBaskets = (state: RootState) => state.baskets.userActiveBaskets
export const selectActivePagination = (state: RootState) => state.baskets.activePagination
export const selectUserCompletedBaskets = (state: RootState) => state.baskets.userCompletedBaskets
export const selectCompletedPagination = (state: RootState) => state.baskets.completedPagination
export const selectPlatformHistoryBaskets = (state: RootState) => state.baskets.platformHistoryBaskets
export const selectHistoryPagination = (state: RootState) => state.baskets.historyPagination
export const selectBasketsLoading = (state: RootState) => state.baskets.loading
export const selectBasketsHistoryLoading = (state: RootState) => state.baskets.historyLoading

// Aliases for legacy selector names
export const selectBasketHistory = selectPlatformHistoryBaskets
export const selectBasketHistoryPagination = selectHistoryPagination
export const selectActiveBaskets = selectActiveUserBaskets
export const selectCompletedBaskets = selectUserCompletedBaskets
