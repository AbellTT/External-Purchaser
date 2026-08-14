# Redux Setup Guide for Babi Platform

**Purpose:** Step-by-step guide to setup Redux Toolkit with mock data

---

## Installation

```bash
npm install @reduxjs/toolkit react-redux
npm install @types/react-redux --save-dev
```

---

## Step 1: Create Store Structure

### File: `src/store/index.ts`
```typescript
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import productsReducer from './slices/productsSlice'
import basketsReducer from './slices/basketsSlice'
import ordersReducer from './slices/ordersSlice'
import marketIntelligenceReducer from './slices/marketIntelligenceSlice'
import procurementCalendarReducer from './slices/procurementCalendarSlice'
import notificationsReducer from './slices/notificationsSlice'

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
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

---

## Step 2: Create Custom Hooks

### File: `src/store/hooks.ts`
```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

---

## Step 3: Wrap App with Provider

### File: `src/main.tsx`
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
```

---

## Step 4: Example Slice - Auth

### File: `src/store/slices/authSlice.ts`
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import mockLoginResponse from '@/data/auth/loginResponse.json'

interface User {
  id: string
  email: string
  organizationName: string
  role: 'buyer' | 'admin'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // TODO: Replace with actual API call
    // const response = await api.post('/auth/login', credentials)
    // return response.data
    
    // For now, use mock data
    return mockLoginResponse.data
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('refreshToken')
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        // Store refresh token in localStorage
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Login failed'
      })
  },
})

export const { logout, setAccessToken } = authSlice.actions
export default authSlice.reducer
```

---

## Step 5: Using Redux in Components

### Example: Login Page
```typescript
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login } from '@/store/slices/authSlice'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    
    if (login.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email" 
      />
      <input 
        type="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password" 
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Example: Dashboard Page
```typescript
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDashboardOverview } from '@/store/slices/dashboardSlice'

export function DashboardHome() {
  const dispatch = useAppDispatch()
  const { overview, loading } = useAppSelector((state) => state.dashboard)

  useEffect(() => {
    // Fetch data on mount
    dispatch(fetchDashboardOverview())
  }, [dispatch])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Total Savings: ETB {overview?.totalSavings.amount}</h1>
      <p>Active Orders: {overview?.activeOrders.count}</p>
      {/* Use overview data */}
    </div>
  )
}
```

---

## Step 6: Create Mock Data Files

### File: `src/data/auth/loginResponse.json`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock",
    "refreshToken": "refresh_token_mock_12345",
    "user": {
      "id": "user_001",
      "email": "demo@company.com",
      "organizationName": "Demo Company Ltd",
      "role": "buyer"
    }
  }
}
```

### File: `src/data/dashboard/overview.json`
```json
{
  "success": true,
  "data": {
    "totalSavings": {
      "amount": 45234,
      "percentage": 23,
      "trend": "up",
      "comparedTo": "last_month"
    },
    "activeOrders": {
      "count": 5,
      "totalValue": 123450,
      "orders": [
        {
          "id": "ORD001",
          "orderNumber": "2026-001234",
          "date": "2026-08-05",
          "status": "processing",
          "total": 12500,
          "items": 3
        }
      ]
    },
    "basketParticipation": {
      "activeBaskets": 3,
      "totalCommitted": 45000,
      "upcomingDeliveries": 2,
      "baskets": []
    },
    "avgDiscountRate": {
      "percentage": 18,
      "yourAverage": 21,
      "calculation": {
        "merkato_avg": 850,
        "platform_avg": 697
      }
    },
    "recentOrders": [],
    "priceAlerts": []
  }
}
```

---

## Step 7: Complete Slice Template

```typescript
// src/store/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import mockData from '@/data/dashboard/overview.json'

interface DashboardState {
  overview: any | null  // Replace 'any' with proper type
  loading: boolean
  lastFetched: number | null
  error: string | null
}

const initialState: DashboardState = {
  overview: null,
  loading: false,
  lastFetched: null,
  error: null,
}

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async () => {
    // Mock: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockData.data
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.overview = null
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false
        state.overview = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch dashboard data'
      })
  },
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
```

---

## Step 8: Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Usage in App.tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Signup />} />
  <Route 
    path="/dashboard/*" 
    element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    } 
  />
</Routes>
```

---

## Step 9: Redux DevTools

Redux DevTools Browser Extension allows you to:
- See all Redux state
- Track actions dispatched
- Time-travel debugging
- Inspect state changes

**Install:**
- Chrome: https://chrome.google.com/webstore (search "Redux DevTools")
- Firefox: https://addons.mozilla.org/firefox/ (search "Redux DevTools")

**Usage:**
1. Open browser DevTools (F12)
2. Go to "Redux" tab
3. See state tree, actions log
4. Click actions to see before/after state

---

## Step 10: Caching Strategy

### Smart Caching with Timestamp
```typescript
// In component
useEffect(() => {
  const fiveMinutes = 5 * 60 * 1000
  const now = Date.now()
  const lastFetch = dashboardState.lastFetched
  
  // Only fetch if:
  // 1. Never fetched before, OR
  // 2. Last fetch > 5 minutes ago
  if (!lastFetch || (now - lastFetch > fiveMinutes)) {
    dispatch(fetchDashboardOverview())
  }
}, [])
```

### Force Refresh
```typescript
// Add manual refresh button
<button onClick={() => dispatch(fetchDashboardOverview())}>
  Refresh
</button>
```

---

## Complete File Structure

```
src/
├── store/
│   ├── index.ts                    # Store configuration
│   ├── hooks.ts                    # Custom hooks
│   └── slices/
│       ├── authSlice.ts
│       ├── dashboardSlice.ts
│       ├── productsSlice.ts
│       ├── basketsSlice.ts
│       ├── ordersSlice.ts
│       ├── marketIntelligenceSlice.ts
│       ├── procurementCalendarSlice.ts
│       └── notificationsSlice.ts
├── data/
│   ├── auth/
│   │   ├── loginResponse.json
│   │   └── userProfile.json
│   ├── dashboard/
│   │   └── overview.json
│   ├── products/
│   │   ├── productsList.json
│   │   └── searchResults.json
│   ├── baskets/
│   │   └── basketsList.json
│   ├── orders/
│   │   └── orderHistory.json
│   ├── marketIntelligence/
│   │   └── products.json
│   └── procurementCalendar/
│       └── products.json
└── components/
    └── ProtectedRoute.tsx
```

---

## Common Patterns

### 1. Loading States
```typescript
{loading && <Skeleton />}
{error && <ErrorMessage message={error} />}
{data && <DataDisplay data={data} />}
```

### 2. Selective Updates
```typescript
// Update single basket in list
.addCase(updateBasket.fulfilled, (state, action) => {
  const index = state.list.findIndex(b => b.id === action.payload.id)
  if (index !== -1) {
    state.list[index] = action.payload
  }
})
```

### 3. Optimistic Updates
```typescript
// Update UI immediately, rollback on error
.addCase(joinBasket.pending, (state, action) => {
  const basket = state.list.find(b => b.id === action.meta.arg.basketId)
  if (basket) {
    basket.userParticipation = {
      isParticipating: true,
      commitment: action.meta.arg.commitment
    }
  }
})
.addCase(joinBasket.rejected, (state, action) => {
  // Rollback on error
  const basket = state.list.find(b => b.id === action.meta.arg.basketId)
  if (basket) {
    basket.userParticipation.isParticipating = false
  }
})
```

---

**Ready to start!** Follow these steps in order and you'll have Redux setup with mock data.
