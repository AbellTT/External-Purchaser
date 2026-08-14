import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Notification } from '@/types/api'
import { api } from '@/lib/api'

// ==================== STATE INTERFACE ====================

interface Pagination {
  currentPage: number
  totalPages: number
  totalNotifications: number
  pageSize: number
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  pagination: Pagination
  filters: {
    type?: 'basket' | 'order' | 'price_alert' | 'system'
    read?: boolean
  }
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: { currentPage: 1, totalPages: 1, totalNotifications: 0, pageSize: 10 },
  filters: {},
}

// ==================== ASYNC THUNKS ====================

/**
 * Fetch notifications with optional filters
 */
export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; unreadCount: number; pagination: Pagination },
  { type?: string; read?: boolean; limit?: number; page?: number } | void
>(
  'notifications/fetchNotifications',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.type) params.append('type', filters.type)
        if (filters.read !== undefined) params.append('read', filters.read.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.page) params.append('page', filters.page.toString())
      }

      const response = await api.get<{ 
        success: boolean
        data: { notifications: Notification[]; unreadCount: number; pagination: Pagination } 
      }>(
        `/notifications?${params.toString()}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications')
    }
  }
)

/**
 * Mark a notification as read
 */
export const markAsRead = createAsyncThunk<Notification, string>(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ success: boolean; data: Notification }>(
        `/notifications/${notificationId}/read`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark as read')
    }
  }
)

/**
 * Mark all notifications as read
 */
export const markAllRead = createAsyncThunk<Notification[]>(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ success: boolean; data: Notification[] }>(
        '/notifications/read-all'
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark all as read')
    }
  }
)

/**
 * Delete a notification
 */
export const deleteNotification = createAsyncThunk<string, string>(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      return notificationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete notification')
    }
  }
)

/**
 * Delete all read notifications
 */
export const deleteAllRead = createAsyncThunk<string[]>(
  'notifications/deleteAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete<{ success: boolean; data: { deletedIds: string[] } }>(
        '/notifications/read'
      )
      return response.data.data.deletedIds
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete read notifications')
    }
  }
)

/**
 * Fetch unread count only (for badge)
 */
export const fetchUnreadCount = createAsyncThunk<number>(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: { count: number } }>(
        '/notifications/unread-count'
      )
      return response.data.data.count
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch unread count')
    }
  }
)

// ==================== SLICE ====================

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null
    },
    setNotificationFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearNotificationFilters: (state) => {
      state.filters = {}
    },
    /**
     * Add a new notification (for real-time updates via WebSocket/polling)
     */
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.read) {
        state.unreadCount += 1
      }
    },
  },
  extraReducers: (builder) => {
    // ===== FETCH NOTIFICATIONS =====
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
        state.error = null
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== MARK AS READ =====
    builder
      .addCase(markAsRead.pending, (state) => {
        state.error = null
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        // Update notification in the list
        const index = state.notifications.findIndex(n => n.id === action.payload.id)
        if (index !== -1) {
          const wasUnread = !state.notifications[index].read
          state.notifications[index] = action.payload
          if (wasUnread && action.payload.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }
        state.error = null
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // ===== MARK ALL READ =====
    builder
      .addCase(markAllRead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markAllRead.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
        state.unreadCount = 0
        state.error = null
      })
      .addCase(markAllRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== DELETE NOTIFICATION =====
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.error = null
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        // Find and remove notification
        const notification = state.notifications.find(n => n.id === action.payload)
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload)
        state.error = null
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // ===== DELETE ALL READ =====
    builder
      .addCase(deleteAllRead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAllRead.fulfilled, (state, action) => {
        state.loading = false
        // Remove all deleted notifications
        state.notifications = state.notifications.filter(
          n => !action.payload.includes(n.id)
        )
        state.error = null
      })
      .addCase(deleteAllRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== FETCH UNREAD COUNT =====
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
  },
})

// ==================== ACTIONS ====================

export const { 
  clearNotificationsError, 
  setNotificationFilters, 
  clearNotificationFilters,
  addNotification,
} = notificationsSlice.actions

// ==================== SELECTORS ====================

export const selectNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications
export const selectAllNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications
export const selectUnreadNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications.filter(n => !n.read)
export const selectUnreadCount = (state: { notifications: NotificationsState }) => 
  state.notifications.unreadCount
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) => 
  state.notifications.loading
export const selectNotificationsError = (state: { notifications: NotificationsState }) => 
  state.notifications.error
export const selectNotificationFilters = (state: { notifications: NotificationsState }) => 
  state.notifications.filters
export const selectNotificationsPagination = (state: { notifications: NotificationsState }) => 
  state.notifications.pagination

// ==================== EXPORT ====================

export default notificationsSlice.reducer
