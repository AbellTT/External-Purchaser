import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { setStoreReference } from '@/lib/api'

// Configure Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // More slices will be added here:
    // dashboard: dashboardReducer,
    // products: productsReducer,
    // baskets: basketsReducer,
    // orders: ordersReducer,
    // marketIntelligence: marketIntelligenceReducer,
    // procurementCalendar: procurementCalendarReducer,
    // notifications: notificationsReducer,
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
