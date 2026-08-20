import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Order, CreateOrderRequest } from '@/types/api'
import { api } from '@/lib/api'

// ==================== STATE INTERFACE ====================

interface Pagination {
  currentPage: number
  totalPages: number
  totalOrders: number
  pageSize: number
}

interface SummaryStats {
  totalSpend: number
  savingsVsRegular: number
  savingsVsMerkato: number
}

interface OrdersState {
  orders: Order[]
  selectedOrder: Order | null
  loading: boolean
  error: string | null
  pagination: Pagination
  summaryStats: SummaryStats
  filters: {
    status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
    startDate?: string
    endDate?: string
  }
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  pagination: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 5 },
  summaryStats: { totalSpend: 0, savingsVsRegular: 0, savingsVsMerkato: 0 },
  filters: {},
}

// ==================== ASYNC THUNKS ====================

/**
 * Fetch order history with optional filters & pagination
 */
export const fetchOrderHistory = createAsyncThunk<
  { orders: Order[]; pagination: Pagination; summaryStats?: SummaryStats },
  { status?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number; silent?: boolean } | void,
  { rejectValue: string }
>(
  'orders/fetchOrderHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.status) params.append('status', filters.status)
        if (filters.startDate) params.append('startDate', filters.startDate)
        if (filters.endDate) params.append('endDate', filters.endDate)
        if (filters.page) params.append('page', String(filters.page))
        if (filters.pageSize) params.append('pageSize', String(filters.pageSize))
      }

      const response = await api.get<{
        success: boolean
        data: { orders: Order[]; pagination: Pagination; summaryStats?: SummaryStats }
      }>(`/orders?${params.toString()}`)

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders')
    }
  }
)

/**
 * Fetch single order by ID
 */
export const fetchOrderById = createAsyncThunk<Order, string>(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: Order }>(
        `/orders/${orderId}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch order')
    }
  }
)

/**
 * Create a new order
 */
export const createOrder = createAsyncThunk<Order, CreateOrderRequest>(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: Order }>(
        '/orders',
        orderData
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create order')
    }
  }
)

/**
 * Reorder (duplicate an existing order)
 */
export const reorder = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/reorder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: Order }>(
        `/orders/${orderId}/reorder/`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reorder')
    }
  }
)

/**
 * Cancel an order permanently
 */
export const cancelOrder = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: Order }>(
        `/orders/${orderId}/cancel/`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel order')
    }
  }
)

// ==================== SLICE ====================

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null
    },
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearOrderFilters: (state) => {
      state.filters = {}
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null
    },
  },
  extraReducers: (builder) => {
    // ===== FETCH ORDER HISTORY =====
    builder
      .addCase(fetchOrderHistory.pending, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders || []
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
        if (action.payload.summaryStats) {
          state.summaryStats = action.payload.summaryStats
        }
        state.error = null
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== FETCH ORDER BY ID =====
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedOrder = action.payload
        state.error = null
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== CREATE ORDER =====
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.orders.unshift(action.payload)
        state.error = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== REORDER =====
    builder
      .addCase(reorder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(reorder.fulfilled, (state, action) => {
        state.loading = false
        state.orders.unshift(action.payload)
        state.error = null
      })
      .addCase(reorder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== CANCEL ORDER =====
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.orders.findIndex(
          (o) => o.id === action.payload.id || o.orderNumber === action.payload.orderNumber
        )
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (
          state.selectedOrder?.id === action.payload.id ||
          state.selectedOrder?.orderNumber === action.payload.orderNumber
        ) {
          state.selectedOrder = action.payload
        }
        state.error = null
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// ==================== ACTIONS ====================

export const { clearOrdersError, setOrderFilters, clearOrderFilters, clearSelectedOrder } = ordersSlice.actions

// ==================== SELECTORS ====================

export const selectOrders = (state: { orders: OrdersState }) => state.orders
export const selectAllOrders = (state: { orders: OrdersState }) => state.orders.orders
export const selectSelectedOrder = (state: { orders: OrdersState }) => state.orders.selectedOrder
export const selectOrdersLoading = (state: { orders: OrdersState }) => state.orders.loading
export const selectOrdersError = (state: { orders: OrdersState }) => state.orders.error
export const selectOrderFilters = (state: { orders: OrdersState }) => state.orders.filters
export const selectOrdersPagination = (state: { orders: OrdersState }) => state.orders.pagination
export const selectOrdersSummaryStats = (state: { orders: OrdersState }) => state.orders.summaryStats

// ==================== EXPORT ====================

export default ordersSlice.reducer
