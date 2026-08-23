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
import adminAuthReducer from './adminSlices/adminAuthSlice'
import adminProductsPricingReducer from './adminSlices/productsPricingSlice'
import adminOrdersReducer from './adminSlices/adminOrdersSlice'
import adminBasketsReducer from './adminSlices/adminBasketsSlice'
import adminOrganizationsReducer from './adminSlices/adminOrganizationsSlice'
import adminMarketDataReducer from './adminSlices/adminMarketDataSlice'
import { setStoreReference } from '@/lib/api'
import { setAdminStoreReference } from '@/lib/adminApi'

// Configure Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer,
    dashboard: dashboardReducer,
    products: productsReducer,
    baskets: basketsReducer,
    orders: ordersReducer,
    marketIntelligence: marketIntelligenceReducer,
    procurementCalendar: procurementCalendarReducer,
    notifications: notificationsReducer,
    admin: adminReducer,
    adminProductsPricing: adminProductsPricingReducer,
    adminOrders: adminOrdersReducer,
    adminBaskets: adminBasketsReducer,
    adminOrganizations: adminOrganizationsReducer,
    adminMarketData: adminMarketDataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'adminAuth/login/fulfilled',
        ],
      },
    }),
})

// Set store reference for API interceptors
setStoreReference(store)
setAdminStoreReference(store)

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
