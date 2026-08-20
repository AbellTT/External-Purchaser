import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Order } from '@/types/api'
import { adminApi } from '@/lib/adminApi'

export interface AdminOrdersPagination {
  currentPage: number
  totalPages: number
  totalOrders: number
  pageSize: number
}

export interface AdminOrdersState {
  orders: Order[]
  filterStatus: string
  currentPage: number
  totalPages: number
  totalOrders: number
  loading: boolean
  initialized: boolean
  error: string | null
}

const initialState: AdminOrdersState = {
  orders: [],
  filterStatus: 'all',
  currentPage: 1,
  totalPages: 1,
  totalOrders: 0,
  loading: false,
  initialized: false,
  error: null,
}

export const fetchAdminOrders = createAsyncThunk<
  { orders: Order[]; pagination: any },
  { status?: string; page?: number; pageSize?: number; silent?: boolean } | void,
  { rejectValue: string }
>(
  'adminOrders/fetchAdminOrders',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.status) params.append('status', filters.status)
        if (filters.page) params.append('page', String(filters.page))
        if (filters.pageSize) params.append('pageSize', String(filters.pageSize))
      }

      const response = await adminApi.get<{
        success: boolean
        data: { orders: Order[]; pagination: any }
      }>(`/orders/admin/?${params.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin orders')
    }
  }
)

export const updateAdminOrderStatus = createAsyncThunk<
  Order,
  { orderId: string; status: 'pending' | 'accepted' | 'out-for-delivery' | 'delivered' | 'cancelled' },
  { rejectValue: string }
>('adminOrders/updateStatus', async ({ orderId, status }, { rejectWithValue }) => {
  try {
    const response = await adminApi.patch<{ success: boolean; data: Order }>(
      `/orders/${orderId}/status/`,
      { status }
    )
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Unable to update order status.')
  }
})

const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    setAdminOrdersFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload
      state.currentPage = 1
    },
    setAdminOrdersPage: (state, action: PayloadAction<number>) => {
      state.currentPage = Math.max(1, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.orders = action.payload.orders || []
        if (action.payload.pagination) {
          state.currentPage = action.payload.pagination.currentPage
          state.totalPages = action.payload.pagination.totalPages
          state.totalOrders = action.payload.pagination.totalOrders
        }
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message || 'Failed to load admin orders.'
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id || o.orderNumber === action.payload.orderNumber)
        if (index >= 0) {
          state.orders[index] = action.payload
        }
      })
  },
})

export const { setAdminOrdersFilterStatus, setAdminOrdersPage } = adminOrdersSlice.actions

export const selectAdminOrdersState = (state: { adminOrders: AdminOrdersState }) => state.adminOrders
export const selectAdminOrdersList = (state: { adminOrders: AdminOrdersState }) => state.adminOrders.orders
export const selectAdminOrdersLoading = (state: { adminOrders: AdminOrdersState }) => state.adminOrders.loading

export default adminOrdersSlice.reducer
