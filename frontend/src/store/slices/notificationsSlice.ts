import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

// ==================== TYPES ====================

export interface AppNotification {
  id: string
  notification_type: string
  category: 'order' | 'price' | 'basket' | 'account' | 'general'
  title: string
  message: string
  action_url: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface NotificationsState {
  items: AppNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  pagination: Pagination
  activeFilter: 'all' | 'unread' | 'order' | 'price' | 'basket' | 'account'
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
  activeFilter: 'all',
}

// ==================== ASYNC THUNKS ====================

export const fetchNotifications = createAsyncThunk<
  { notifications: AppNotification[]; unreadCount: number; page: number; pageSize: number; totalItems: number; totalPages: number },
  { category?: string; page?: number } | void
>(
  'notifications/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const category = (params as any)?.category || 'all'
      const page = (params as any)?.page || 1
      const response = await api.get<{
        success: boolean
        data: {
          notifications: AppNotification[]
          unreadCount: number
          page: number
          pageSize: number
          totalItems: number
          totalPages: number
        }
      }>(`/notifications/?category=${category}&page=${page}&pageSize=10`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications')
    }
  }
)

export const markOneAsRead = createAsyncThunk<
  { id: string; unreadCount: number },
  string
>(
  'notifications/markOneAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; unreadCount: number }>(`/notifications/${notificationId}/read/`)
      return { id: notificationId, unreadCount: response.data.unreadCount }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark as read')
    }
  }
)

export const markAllAsRead = createAsyncThunk<number>(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/read-all/')
      return 0
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark all as read')
    }
  }
)

// ==================== SLICE ====================

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload
      state.pagination.page = 1
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },
    // Clear notifications on user logout / user switch
    clearNotifications: (state) => {
      state.items = []
      state.unreadCount = 0
      state.pagination = { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 }
    },
    // Push real-time notification with strict ID deduplication
    pushRealtimeNotification: (state, action) => {
      const notif: AppNotification = action.payload.notification
      if (!notif || !notif.id) return

      const exists = state.items.some(item => String(item.id) === String(notif.id))
      if (!exists) {
        state.items.unshift(notif)
        state.unreadCount = action.payload.unreadCount ?? (state.unreadCount + 1)
        state.pagination.totalItems += 1
      }
    },
    setAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, is_read: true }))
      state.unreadCount = 0
    },
    addNotification: (state, action) => {
      const notif = action.payload
      if (!notif || !notif.id) return
      const exists = state.items.some(item => String(item.id) === String(notif.id))
      if (!exists) {
        state.items.unshift(notif)
        if (!notif.is_read) state.unreadCount += 1
      }
    },
    markAsRead: (state, action) => {
      const item = state.items.find(n => String(n.id) === String(action.payload))
      if (item && !item.is_read) {
        item.is_read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, is_read: true }))
      state.unreadCount = 0
    },
    deleteNotification: (state, action) => {
      const item = state.items.find(n => String(n.id) === String(action.payload))
      if (item && !item.is_read) state.unreadCount = Math.max(0, state.unreadCount - 1)
      state.items = state.items.filter(n => String(n.id) !== String(action.payload))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        // Deduplicate fetched list cleanly
        const uniqueItems: AppNotification[] = []
        const seenIds = new Set<string>()

        for (const item of action.payload.notifications) {
          const key = String(item.id)
          if (!seenIds.has(key)) {
            seenIds.add(key)
            uniqueItems.push(item)
          }
        }

        state.items = uniqueItems
        state.unreadCount = action.payload.unreadCount
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
        }
        state.error = null
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(markOneAsRead.fulfilled, (state, action) => {
        const item = state.items.find(n => String(n.id) === String(action.payload.id))
        if (item) item.is_read = true
        state.unreadCount = action.payload.unreadCount
      })

    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map(n => ({ ...n, is_read: true }))
        state.unreadCount = 0
      })
  },
})

export const {
  setActiveFilter,
  setUnreadCount,
  clearNotifications,
  pushRealtimeNotification,
  setAllRead,
  addNotification,
  markAsRead,
  markAllRead,
  deleteNotification,
} = notificationsSlice.actions

// ==================== SELECTORS ====================

export const selectAllNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items
export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.unreadCount
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) =>
  state.notifications.loading
export const selectNotificationsPagination = (state: { notifications: NotificationsState }) =>
  state.notifications.pagination
export const selectActiveFilter = (state: { notifications: NotificationsState }) =>
  state.notifications.activeFilter

export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications
export const selectUnreadNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items.filter(n => !n.is_read)

export default notificationsSlice.reducer
