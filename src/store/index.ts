import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import productsReducer from './slices/productsSlice'
import basketsReducer from './slices/basketsSlice'
import ordersReducer from './slices/ordersSlice'
import marketIntelligenceReducer from './slices/marketIntelligenceSlice'
import procurementCalendarReducer from './slices/procurementCalendarSlice'
import notificationsReducer from './slices/notificationsSlice'
import adminReducer from './slices/adminSlice'
import { setStoreReference } from '@/lib/api'

// Configure Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productsReducer,
    baskets: basketsReducer,
    orders: ordersReducer,
    marketIntelligence: marketIntelligenceReducer,
    procurementCalendar: procurementCalendarReducer,
    notifications: notificationsReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
})

// Set store reference for API interceptors
setStoreReference(store)

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
