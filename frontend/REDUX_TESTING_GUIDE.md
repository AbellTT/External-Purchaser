# Redux Testing Guide

Complete guide for testing Redux state management in the Babi frontend.

## Prerequisites

1. **Install Redux DevTools Extension**
   - Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
   - Firefox: [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

2. **Start Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Redux DevTools**
   - Press `F12` to open browser DevTools
   - Click on the "Redux" tab
   - You should see the Redux state tree

---

## Redux Store Structure

After setup, your Redux store contains 8 slices:

```javascript
{
  auth: { ... },                    // Authentication state
  dashboard: { ... },               // Dashboard overview
  products: { ... },                // Products catalog
  baskets: { ... },                 // Basket system
  orders: { ... },                  // Order history
  marketIntelligence: { ... },     // Market data & price trends
  procurementCalendar: { ... },    // Calendar events
  notifications: { ... }            // Notifications & alerts
}
```

---

## Testing Each Slice

### 1. Auth Slice (Already Working)

**Current State:**
- ✅ Login/Register actions
- ✅ Token refresh
- ✅ Session restoration
- ✅ Auto logout on 401

**Test in DevTools:**
1. Open Redux DevTools
2. Navigate to "State" tab
3. Expand `auth` object
4. You should see: `user`, `accessToken`, `isAuthenticated`, `loading`, `error`

**Verify Actions:**
1. Go to "Action" tab in Redux DevTools
2. Click "Start recording"
3. Try logging in
4. You should see actions: `auth/login/pending` → `auth/login/fulfilled`

---

### 2. Dashboard Slice

**Test Location:** `/dashboard` or `/dashboard/home`

**Actions to Test:**
- `fetchDashboardOverview` - Loads overview data

**How to Test:**

**Option 1: Using Browser Console**
```javascript
// Import hooks
import { useAppDispatch } from '@/store/hooks'
import { fetchDashboardOverview } from '@/store/slices/dashboardSlice'

// In a component or console:
const dispatch = useAppDispatch()
dispatch(fetchDashboardOverview())
```

**Option 2: Manual API Simulation**
Since we don't have a backend yet, you need to mock the API response:

1. Open `src/lib/api.ts`
2. Temporarily add mock interceptor:
```typescript
// Add after existing interceptors
api.interceptors.response.use(
  (response) => {
    // Mock dashboard data
    if (response.config.url?.includes('/dashboard/overview')) {
      const mockData = require('@/data/dashboard/dashboardOverview.json')
      return { ...response, data: mockData }
    }
    return response
  }
)
```

**Verify in Redux DevTools:**
1. Go to "State" tab
2. Expand `dashboard` object
3. Check `overview` contains:
   - `totalSavings`
   - `activeOrders`
   - `basketParticipation`
   - `avgDiscountRate`
   - `priceAlerts`

---

### 3. Products Slice

**Test Location:** `/dashboard/direct-purchase`

**Actions to Test:**
- `fetchProducts` - Load all products
- `searchProducts` - Search by query
- `fetchProductById` - Load single product

**How to Test:**

**Method 1: Direct Dispatch (Browser Console)**
```javascript
// Open browser console on /dashboard/direct-purchase
// Access store from window (if exposed) or use React DevTools

// Dispatch action
store.dispatch({ type: 'products/fetchProducts/pending' })

// Simulate fulfilled
const mockProducts = require('./data/products/productsList.json')
store.dispatch({ 
  type: 'products/fetchProducts/fulfilled',
  payload: mockProducts.data.products
})
```

**Method 2: Create Test Component**
```typescript
// src/components/TestProductsRedux.tsx
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProducts, selectAllProducts } from '@/store/slices/productsSlice'

export function TestProductsRedux() {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectAllProducts)
  
  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])
  
  return (
    <div>
      <h2>Products Count: {products.length}</h2>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  )
}
```

**Verify in Redux DevTools:**
1. Check `products.products` array is populated
2. Verify each product has `id`, `name`, `category`, `brands`

---

### 4. Baskets Slice

**Test Location:** `/dashboard/basket-system`

**Actions to Test:**
- `fetchBaskets` - Load active baskets
- `fetchBasketHistory` - Load completed baskets
- `joinBasket` - Join a basket
- `leaveBasket` - Leave a basket
- `updateCommitment` - Update commitment

**How to Test:**

**Using Redux DevTools Dispatcher:**
1. Open Redux DevTools
2. Go to "Dispatcher" tab
3. Type action:
```json
{
  "type": "baskets/fetchBaskets/fulfilled",
  "payload": [/* paste from basketsList.json */]
}
```
4. Click "Dispatch"

**Verify State Changes:**
- `baskets.baskets` should contain active baskets
- `baskets.basketHistory` should contain completed baskets
- When you join: `userParticipation.isParticipating` should be `true`

**Expected State Structure:**
```javascript
{
  baskets: Basket[],
  basketHistory: CompletedBasket[],
  selectedBasket: Basket | null,
  loading: boolean,
  historyLoading: boolean,
  error: string | null
}
```

---

### 5. Orders Slice

**Test Location:** `/dashboard/order-history`

**Actions to Test:**
- `fetchOrderHistory` - Load all orders
- `createOrder` - Create new order
- `reorder` - Duplicate existing order
- `cancelOrder` - Cancel order

**How to Test:**

**Using Mock Data:**
```typescript
// In OrderHistoryPage.tsx, add:
import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { fetchOrderHistory } from '@/store/slices/ordersSlice'
import mockOrders from '@/data/orders/orderHistory.json'

export function OrderHistoryPage() {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    // Simulate API success
    dispatch({ 
      type: 'orders/fetchOrderHistory/fulfilled',
      payload: mockOrders.data.orders
    })
  }, [])
  
  // ... rest of component
}
```

**Verify in Redux DevTools:**
- Check `orders.orders` array
- Verify order structure: `id`, `orderNumber`, `status`, `items`, `pricing`, `delivery`, `savings`
- Filter by status should work

---

### 6. Market Intelligence Slice

**Test Location:** `/dashboard/market-intelligence`

**Actions to Test:**
- `fetchMarketData` - Load price trends
- `fetchCompanyLossData` - Load company losses
- `fetchPriceComparison` - Compare product prices

**How to Test:**

**Using Existing Mock Data:**
```typescript
// In MarketIntelligencePage.tsx
import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import biMonthlyData from '@/data/MI/bi-monthly_data.json'

export function MarketIntelligencePage() {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch({
      type: 'marketIntelligence/fetchMarketData/fulfilled',
      payload: biMonthlyData
    })
  }, [])
}
```

**Verify:**
- `marketIntelligence.marketData` contains price history
- `marketIntelligence.companyLossData` contains loss analysis
- `selectedPeriod` can be changed

---

### 7. Procurement Calendar Slice

**Test Location:** `/dashboard/procurement-calendar`

**Actions to Test:**
- `fetchProcurementCalendar` - Load events
- `createCalendarEvent` - Add new event
- `updateCalendarEvent` - Update event
- `deleteCalendarEvent` - Delete event

**How to Test:**

**Load Mock Events:**
```typescript
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectCalendarEvents } from '@/store/slices/procurementCalendarSlice'
import mockEvents from '@/data/calendar/procurementEvents.json'

export function ProcurementCalendarPage() {
  const dispatch = useAppDispatch()
  const events = useAppSelector(selectCalendarEvents)
  
  useEffect(() => {
    dispatch({
      type: 'procurementCalendar/fetchEvents/fulfilled',
      payload: mockEvents.data.events
    })
  }, [])
  
  return <div>Events: {events.length}</div>
}
```

**Verify:**
- `procurementCalendar.events` contains 15 events
- Events have types: `basket`, `order`, `deadline`, `reminder`

---

### 8. Notifications Slice

**Test Location:** `/dashboard/notifications`

**Actions to Test:**
- `fetchNotifications` - Load notifications
- `markAsRead` - Mark single notification as read
- `markAllRead` - Mark all as read
- `deleteNotification` - Delete single
- `fetchUnreadCount` - Get unread count

**How to Test:**

**Load Mock Notifications:**
```typescript
import mockNotifications from '@/data/notifications/notificationsList.json'

// In component:
useEffect(() => {
  dispatch({
    type: 'notifications/fetchNotifications/fulfilled',
    payload: mockNotifications.data
  })
}, [])
```

**Test Mark as Read:**
```typescript
// In Redux DevTools Dispatcher
{
  "type": "notifications/markAsRead/fulfilled",
  "payload": {
    "id": "notif_001",
    "read": true,
    // ... rest of notification
  }
}
```

**Verify:**
- `notifications.unreadCount` decreases when marking as read
- `notifications.notifications` updates accordingly

---

## Common Redux DevTools Features

### 1. Time Travel Debugging
- Click any action in the history
- State rewinds to that point
- See exactly what state looked like then

### 2. Action Filtering
- Filter actions by type: `@@redux/INIT` → clear
- Search: Type `basket` to see all basket actions

### 3. State Diff
- Click an action
- See "Diff" tab
- Shows what changed (green = added, red = removed)

### 4. Export/Import State
- Export: Click "Export" button → Save state as JSON
- Import: Click "Import" button → Load saved state
- Useful for testing specific scenarios

### 5. Dispatcher
- Manually dispatch actions
- Test edge cases
- Simulate API responses

---

## Testing Checklist

### ✅ Auth Flow
- [ ] Login dispatches `auth/login/fulfilled`
- [ ] Token stored in Redux state
- [ ] Session restored on page reload
- [ ] Logout clears state

### ✅ Dashboard
- [ ] `fetchDashboardOverview` loads data
- [ ] State shows: savings, orders, baskets, alerts
- [ ] Loading state works

### ✅ Products
- [ ] `fetchProducts` loads all products
- [ ] Search filters products
- [ ] Product selection works

### ✅ Baskets
- [ ] Active baskets load
- [ ] History loads separately
- [ ] Join/leave updates state immediately
- [ ] Commitment updates reflect in UI

### ✅ Orders
- [ ] Order history loads
- [ ] Filters work (status, date range)
- [ ] Create order adds to list
- [ ] Reorder duplicates order

### ✅ Market Intelligence
- [ ] Price trends load
- [ ] Company loss data loads
- [ ] Period selection changes data

### ✅ Calendar
- [ ] Events load
- [ ] Create/update/delete events work
- [ ] Filters by type work

### ✅ Notifications
- [ ] Notifications load
- [ ] Unread count is accurate
- [ ] Mark as read decreases count
- [ ] Delete removes from list

---

## Quick Testing Script

Run this in browser console after navigating to dashboard:

```javascript
// Test all slices at once
async function testAllSlices() {
  const store = window.__REDUX_DEVTOOLS_EXTENSION__?.();
  
  // Check store structure
  const state = store.getState();
  console.log('Store slices:', Object.keys(state));
  
  // Verify each slice exists
  const requiredSlices = [
    'auth', 'dashboard', 'products', 'baskets',
    'orders', 'marketIntelligence', 'procurementCalendar', 'notifications'
  ];
  
  const missingSlices = requiredSlices.filter(slice => !state[slice]);
  
  if (missingSlices.length === 0) {
    console.log('✅ All slices registered!');
  } else {
    console.error('❌ Missing slices:', missingSlices);
  }
  
  // Check action history
  console.log('Recent actions:', /* last 10 actions */);
}

testAllSlices();
```

---

## Troubleshooting

### Issue: Redux DevTools shows "No store found"
**Solution:** Ensure dev server is running and extension is installed

### Issue: Actions not appearing
**Solution:** Check if thunk is properly dispatched with `await dispatch(action())`

### Issue: State not updating
**Solution:** 
1. Check reducer is registered in `store/index.ts`
2. Verify action type matches exactly
3. Check for typos in action names

### Issue: "Cannot find module '@/lib/api'"
**Solution:** 
1. Restart TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Check `tsconfig.app.json` has path alias configured
3. Restart dev server

### Issue: Mock data not loading
**Solution:** Mock interceptor needs to be added temporarily to `api.ts` OR backend needs to be running

---

## Next Steps

1. **Connect to Real Backend:**
   - Remove mock interceptors
   - Update `VITE_API_BASE_URL` in `.env`
   - Backend API should match response structure in `types/api.ts`

2. **Add Loading States to UI:**
   - Use `selectProductsLoading`, `selectBasketsLoading`, etc.
   - Show spinners while `loading === true`

3. **Error Handling:**
   - Display errors from Redux state
   - Use `selectProductsError`, `selectBasketsError`, etc.

4. **Optimistic Updates:**
   - Update UI immediately on user action
   - Revert if API call fails

5. **Polling for Notifications:**
   - Add interval to fetch notifications every 30s
   - Use `fetchUnreadCount` for badge

---

## Summary

✅ **8 Redux slices created:**
1. authSlice - User authentication
2. dashboardSlice - Dashboard overview
3. productsSlice - Products catalog
4. basketsSlice - Basket system
5. ordersSlice - Order management
6. marketIntelligenceSlice - Market data
7. procurementCalendarSlice - Calendar events
8. notificationsSlice - Notifications

✅ **7 Mock JSON files created:**
1. `dashboardOverview.json`
2. `productsList.json`
3. `basketsList.json`
4. `basketHistory.json`
5. `orderHistory.json`
6. `notificationsList.json`
7. `procurementEvents.json`

✅ **All reducers registered in store**

✅ **Build successful:** 2998 modules, 3.62s

---

**Ready to integrate with UI!** 🎉

Next step: Update dashboard pages to dispatch actions and consume Redux state instead of hardcoded data.
