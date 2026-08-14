import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Basket, BasketCommitment, CompletedBasket } from '@/types/api'
import { api } from '@/lib/api'

// ==================== STATE INTERFACE ====================

interface FetchBasketsResponse {
  activeBaskets: Basket[]
  openBaskets: Basket[]
  completedBaskets: Basket[]
}

interface BasketHistoryResponse {
  baskets: CompletedBasket[]
  pagination: { currentPage: number; totalPages: number; totalBaskets: number; pageSize: number }
}

interface BasketsState {
  activeBaskets: Basket[]
  openBaskets: Basket[]
  completedBaskets: Basket[]
  basketHistory: CompletedBasket[]
  basketHistoryPagination: { currentPage: number; totalPages: number; totalBaskets: number; pageSize: number }
  selectedBasket: Basket | null
  loading: boolean
  historyLoading: boolean
  error: string | null
}

const initialState: BasketsState = {
  activeBaskets: [],
  openBaskets: [],
  completedBaskets: [],
  basketHistory: [],
  basketHistoryPagination: { currentPage: 1, totalPages: 1, totalBaskets: 0, pageSize: 10 },
  selectedBasket: null,
  loading: false,
  historyLoading: false,
  error: null,
}

// ==================== ASYNC THUNKS ====================

/**
 * Fetch all active baskets
 */
export const fetchBaskets = createAsyncThunk<FetchBasketsResponse>(
  'baskets/fetchBaskets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: FetchBasketsResponse }>(
        '/baskets'
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch baskets')
    }
  }
)

/**
 * Fetch basket history (completed baskets)
 */
export const fetchBasketHistory = createAsyncThunk<BasketHistoryResponse, { page?: number } | void>(
  'baskets/fetchBasketHistory',
  async (params, { rejectWithValue }) => {
    try {
      const query = params?.page ? `?page=${params.page}` : ''
      const response = await api.get<{ success: boolean; data: BasketHistoryResponse }>(
        `/baskets/history${query}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch basket history')
    }
  }
)

/**
 * Fetch single basket by ID
 */
export const fetchBasketById = createAsyncThunk<Basket, string>(
  'baskets/fetchBasketById',
  async (basketId, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: Basket }>(
        `/baskets/${basketId}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch basket')
    }
  }
)

/**
 * Join a basket
 */
export const joinBasket = createAsyncThunk<
  Basket,
  { basketId: string; commitment: BasketCommitment }
>(
  'baskets/joinBasket',
  async ({ basketId, commitment }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: Basket }>(
        `/baskets/${basketId}/join`,
        { commitment }
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to join basket')
    }
  }
)

/**
 * Leave a basket
 */
export const leaveBasket = createAsyncThunk<Basket, string>(
  'baskets/leaveBasket',
  async (basketId, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: Basket }>(
        `/baskets/${basketId}/leave`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to leave basket')
    }
  }
)

/**
 * Update commitment in a basket
 */
export const updateCommitment = createAsyncThunk<
  Basket,
  { basketId: string; commitment: BasketCommitment }
>(
  'baskets/updateCommitment',
  async ({ basketId, commitment }, { rejectWithValue }) => {
    try {
      const response = await api.put<{ success: boolean; data: Basket }>(
        `/baskets/${basketId}/commitment`,
        { commitment }
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update commitment')
    }
  }
)

/**
 * Create a new basket
 */
export const createBasket = createAsyncThunk<
  Basket,
  {
    productId: string
    targetQuantity: number
    endDate: string
    minParticipants: number
  }
>(
  'baskets/createBasket',
  async (basketData, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: Basket }>(
        '/baskets',
        basketData
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create basket')
    }
  }
)

// ==================== SLICE ====================

const basketsSlice = createSlice({
  name: 'baskets',
  initialState,
  reducers: {
    clearBasketsError: (state) => {
      state.error = null
    },
    clearSelectedBasket: (state) => {
      state.selectedBasket = null
    },
  },
  extraReducers: (builder) => {
    // ===== FETCH BASKETS =====
    builder
      .addCase(fetchBaskets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBaskets.fulfilled, (state, action) => {
        state.loading = false
        state.activeBaskets = action.payload.activeBaskets
        state.openBaskets = action.payload.openBaskets
        state.completedBaskets = action.payload.completedBaskets
        state.error = null
      })
      .addCase(fetchBaskets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== FETCH BASKET HISTORY =====
    builder
      .addCase(fetchBasketHistory.pending, (state) => {
        state.historyLoading = true
        state.error = null
      })
      .addCase(fetchBasketHistory.fulfilled, (state, action) => {
        state.historyLoading = false
        state.basketHistory = action.payload.baskets
        state.basketHistoryPagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchBasketHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.error = action.payload as string
      })

    // ===== FETCH BASKET BY ID =====
    builder
      .addCase(fetchBasketById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBasketById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedBasket = action.payload
        state.error = null
      })
      .addCase(fetchBasketById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== JOIN BASKET =====
    builder
      .addCase(joinBasket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(joinBasket.fulfilled, (state, action) => {
        state.loading = false
        // Move basket from openBaskets to activeBaskets
        const index = state.openBaskets.findIndex(b => b.id === action.payload.id)
        if (index !== -1) {
          state.openBaskets.splice(index, 1)
          state.activeBaskets.push(action.payload)
        } else {
          // If it was somehow already in activeBaskets, update it
          const activeIndex = state.activeBaskets.findIndex(b => b.id === action.payload.id)
          if (activeIndex !== -1) {
            state.activeBaskets[activeIndex] = action.payload
          }
        }
        // Update selected basket if it's the same
        if (state.selectedBasket?.id === action.payload.id) {
          state.selectedBasket = action.payload
        }
        state.error = null
      })
      .addCase(joinBasket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== LEAVE BASKET =====
    builder
      .addCase(leaveBasket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(leaveBasket.fulfilled, (state, action) => {
        state.loading = false
        // Move basket from activeBaskets to openBaskets
        const index = state.activeBaskets.findIndex(b => b.id === action.payload.id)
        if (index !== -1) {
          state.activeBaskets.splice(index, 1)
          state.openBaskets.push(action.payload)
        } else {
          // Update in open if it was somehow already there
          const openIndex = state.openBaskets.findIndex(b => b.id === action.payload.id)
          if (openIndex !== -1) {
            state.openBaskets[openIndex] = action.payload
          }
        }
        // Update selected basket if it's the same
        if (state.selectedBasket?.id === action.payload.id) {
          state.selectedBasket = action.payload
        }
        state.error = null
      })
      .addCase(leaveBasket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== UPDATE COMMITMENT =====
    builder
      .addCase(updateCommitment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCommitment.fulfilled, (state, action) => {
        state.loading = false
        // Update basket in activeBaskets
        const index = state.activeBaskets.findIndex(b => b.id === action.payload.id)
        if (index !== -1) {
          state.activeBaskets[index] = action.payload
        }
        // Update selected basket if it's the same
        if (state.selectedBasket?.id === action.payload.id) {
          state.selectedBasket = action.payload
        }
        state.error = null
      })
      .addCase(updateCommitment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== CREATE BASKET =====
    builder
      .addCase(createBasket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBasket.fulfilled, (state, action) => {
        state.loading = false
        state.openBaskets.unshift(action.payload) // Add to beginning of open baskets
        state.error = null
      })
      .addCase(createBasket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// ==================== ACTIONS ====================

export const { clearBasketsError, clearSelectedBasket } = basketsSlice.actions

// ==================== SELECTORS ====================

export const selectActiveBaskets = (state: { baskets: BasketsState }) => state.baskets.activeBaskets
export const selectOpenBaskets = (state: { baskets: BasketsState }) => state.baskets.openBaskets
export const selectCompletedBaskets = (state: { baskets: BasketsState }) => state.baskets.completedBaskets
export const selectBasketHistory = (state: { baskets: BasketsState }) => state.baskets.basketHistory
export const selectBasketHistoryPagination = (state: { baskets: BasketsState }) => state.baskets.basketHistoryPagination
export const selectSelectedBasket = (state: { baskets: BasketsState }) => state.baskets.selectedBasket
export const selectBasketsLoading = (state: { baskets: BasketsState }) => state.baskets.loading
export const selectHistoryLoading = (state: { baskets: BasketsState }) => state.baskets.historyLoading
export const selectBasketsError = (state: { baskets: BasketsState }) => state.baskets.error

// ==================== EXPORT ====================

export default basketsSlice.reducer
