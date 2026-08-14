# Comprehensive Redux Architecture & Complete Code Walkthrough

**Target Platform:** Ethiopian Institutional Stationery Procurement Platform (Babi)  
**Document Purpose:** Detailed explanation of every Redux file, line of code, and end-to-end data flow from Login/Registration to UI rendering on the Profile Page and Dashboard.

---

## Table of Contents

1. [High-Level Redux Architecture](#1-high-level-redux-architecture)
2. [Line-by-Line Explanation of Core Redux Files](#2-line-by-line-explanation-of-core-redux-files)
   - [File 1: `src/store/index.ts` (Store Configuration)](#file-1-srcstoreindexts-store-configuration)
   - [File 2: `src/store/hooks.ts` (Typed React-Redux Hooks)](#file-2-srcstorehooksts-typed-react-redux-hooks)
   - [File 3: `src/lib/api.ts` (Axios & Redux Interceptor Bridge)](#file-3-srclibapits-axios--redux-interceptor-bridge)
   - [File 4: `src/store/slices/authSlice.ts` (Authentication Slice)](#file-4-srcstoreslicesauthslicets-authentication-slice)
3. [Full End-to-End Execution Walkthrough](#3-full-end-to-end-execution-walkthrough)
   - [Phase 1: User Clicks "Log In" / Submits Form](#phase-1-user-clicks-log-in--submits-form)
   - [Phase 2: Redux Store Updates Memory State](#phase-2-redux-store-updates-memory-state)
   - [Phase 3: Navigation to Dashboard & Sidebar Rendering](#phase-3-navigation-to-dashboard--sidebar-rendering)
   - [Phase 4: Opening & Rendering Profile Page](#phase-4-opening--rendering-profile-page)
   - [Phase 5: What Happens During Page Refresh ($F5$)](#phase-5-what-happens-during-page-refresh-f5)
4. [Summary Checklist for Adding New Redux Features](#4-summary-checklist-for-adding-new-redux-features)

---

## 1. High-Level Redux Architecture

Redux Toolkit (RTK) acts as the **centralized single source of truth** for all application state. Instead of components keeping track of login credentials, organization profiles, products, or basket orders independently, all shared data lives inside a single JavaScript object called the **Redux Store State Tree**.

```
                           +----------------------------------+
                           |        REDUX STORE STATE         |
                           |                                  |
                           |  state.auth                      |
                           |  state.dashboard                 |
                           |  state.products                  |
                           |  state.baskets                   |
                           |  state.orders                    |
                           |  state.marketIntelligence        |
                           |  state.procurementCalendar       |
                           |  state.notifications             |
                           +----------------------------------+
                                     /             \
                                    /               \
              useAppSelector(selectUser)         dispatch(login(credentials))
                                  /                   \
                                 v                     v
                      +-------------------+   +--------------------+
                      |  React Components |   | Async Thunks &     |
                      | (ProfilePage,     |   | Axios API Calls    |
                      |  DashboardLayout) |   | (src/lib/api.ts)   |
                      +-------------------+   +--------------------+
```

### The 4 Core Concepts:
1. **State:** Immutable JavaScript objects holding app data.
2. **Actions:** Plain JavaScript objects describing *what happened* (e.g., `{ type: 'auth/login/fulfilled', payload: user }`).
3. **Reducers:** Functions that specify *how state changes* in response to an action.
4. **Selectors:** Helper functions to retrieve specific slices of data from the store state (e.g., `selectUser`).

---

## 2. Line-by-Line Explanation of Core Redux Files

### File 1: `src/store/index.ts` (Store Configuration)

This file sets up the primary Redux store and connects all 8 feature reducers.

```typescript
1: import { configureStore } from '@reduxjs/toolkit'
2: import authReducer from './slices/authSlice'
3: import dashboardReducer from './slices/dashboardSlice'
4: import productsReducer from './slices/productsSlice'
5: import basketsReducer from './slices/basketsSlice'
6: import ordersReducer from './slices/ordersSlice'
7: import marketIntelligenceReducer from './slices/marketIntelligenceSlice'
8: import procurementCalendarReducer from './slices/procurementCalendarSlice'
9: import notificationsReducer from './slices/notificationsSlice'
10: import { setStoreReference } from '@/lib/api'
```
* **Lines 1–9:** Imports `configureStore` from Redux Toolkit and imports the default export (the reducer function) from each of the 8 feature slices.
* **Line 10:** Imports `setStoreReference` from the API utility file so Axios interceptors can read tokens directly from Redux without causing circular import loops.

```typescript
12: // Configure Redux store
13: export const store = configureStore({
14:   reducer: {
15:     auth: authReducer,
16:     dashboard: dashboardReducer,
17:     products: productsReducer,
18:     baskets: basketsReducer,
19:     orders: ordersReducer,
20:     marketIntelligence: marketIntelligenceReducer,
21:     procurementCalendar: procurementCalendarReducer,
22:     notifications: notificationsReducer,
23:   },
24:   middleware: (getDefaultMiddleware) =>
25:     getDefaultMiddleware({
26:       serializableCheck: {
27:         // Ignore these action types
28:         ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
29:       },
30:     }),
31: })
```
* **Lines 13–23:** `configureStore({...})` initializes the global store object. The `reducer` object maps state keys to reducers. For example:
  * `state.auth` is managed by `authReducer`
  * `state.products` is managed by `productsReducer`
* **Lines 24–30:** `middleware` configures standard Redux middleware (such as Redux Thunk and immutability checks). `serializableCheck` ignores specific action types that might contain non-serializable payloads during development.

```typescript
33: // Set store reference for API interceptors
34: setStoreReference(store)
35: 
36: // Export types
37: export type RootState = ReturnType<typeof store.getState>
38: export type AppDispatch = typeof store.dispatch
```
* **Line 34:** Pass the created `store` object to `setStoreReference` in `api.ts`.
* **Line 37:** `RootState` is a TypeScript utility type representing the shape of the entire Redux state tree (inferred automatically from `store.getState()`).
* **Line 38:** `AppDispatch` is a TypeScript type representing `store.dispatch` (enables autocompletion and type checking when dispatching async thunks).

---

### File 2: `src/store/hooks.ts` (Typed React-Redux Hooks)

Standard `useDispatch` and `useSelector` hooks from React-Redux do not know the types of your specific Redux state or dispatch. This file creates typed versions.

```typescript
1: import { useDispatch, useSelector, useStore } from 'react-redux'
2: import type { TypedUseSelectorHook } from 'react-redux'
3: import type { RootState, AppDispatch } from './index'
4: 
5: // Use throughout your app instead of plain `useDispatch` and `useSelector`
6: export const useAppDispatch: () => AppDispatch = useDispatch
7: export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
8: export const useAppStore = useStore
```
* **Line 6:** `useAppDispatch` guarantees that when you dispatch an async thunk (e.g. `dispatch(login(...))`), TypeScript knows it returns a Promise with `.unwrap()`.
* **Line 7:** `useAppSelector` ensures that when you write `useAppSelector(state => state.auth.user)`, TypeScript automatically provides autocomplete for `auth`, `user`, `organizationName`, etc.
* **Line 8:** `useAppStore` returns a typed reference to the full store.

---

### File 3: `src/lib/api.ts` (Axios & Redux Interceptor Bridge)

This file connects Axios network requests directly to the Redux Store.

```typescript
15: let storeReference: any = null
16: 
17: export const setStoreReference = (store: any) => {
18:   storeReference = store
19: }
```
* **Lines 15–18:** Stores a reference to the Redux store passed from `store/index.ts`.

```typescript
21: // Request interceptor - Add access token to requests
22: api.interceptors.request.use(
23:   (config: InternalAxiosRequestConfig) => {
24:     if (storeReference) {
25:       const state = storeReference.getState()
26:       const accessToken = state.auth?.accessToken
27: 
28:       if (accessToken && config.headers) {
29:         config.headers.Authorization = `Bearer ${accessToken}`
30:       }
31:     }
32:     return config
33:   },
34:   (error: AxiosError) => Promise.reject(error)
35: )
```
* **Lines 22–35:** Before any HTTP request goes out, Axios inspects `storeReference.getState().auth.accessToken`. If a JWT access token exists in Redux memory, it automatically injects `Authorization: Bearer <accessToken>` into the request headers.

```typescript
41: // Response interceptor - Handle token refresh
42: api.interceptors.response.use(
43:   (response) => response,
44:   async (error: AxiosError<ApiError>) => {
45:     const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
46: 
47:     if (error.response?.status === 401 && !originalRequest._retry) {
48:       originalRequest._retry = true
49:       try {
50:         const refreshToken = localStorage.getItem('refreshToken')
51:         if (!refreshToken) {
52:           if (storeReference) {
53:             const { clearAuth } = await import('@/store/slices/authSlice')
54:             storeReference.dispatch(clearAuth())
55:           }
56:           window.location.href = '/login'
57:           return Promise.reject(error)
58:         }
59: 
60:         const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
61:         const { accessToken, refreshToken: newRefreshToken } = response.data.data
62: 
63:         if (storeReference) {
64:           const { setAccessToken } = await import('@/store/slices/authSlice')
65:           storeReference.dispatch(setAccessToken(accessToken))
66:         }
67:         localStorage.setItem('refreshToken', newRefreshToken)
68: 
69:         if (originalRequest.headers) {
70:           originalRequest.headers.Authorization = `Bearer ${accessToken}`
71:         }
72:         return api(originalRequest)
73:       } catch (refreshError) {
...
96:         window.location.href = '/login'
97:         return Promise.reject(refreshError)
98:       }
99:     }
100:     return Promise.reject(error)
101:   }
102: )
```
* **Lines 41–102:** If the backend returns a `401 Unauthorized` error (access token expired), Axios catches it, retrieves `refreshToken` from `localStorage`, calls `/auth/refresh`, dispatches `setAccessToken` to update Redux, and automatically retries the failed request.

---

### File 4: `src/store/slices/authSlice.ts` (Authentication Slice)

This file manages user session state, login/registration async thunks, and state selectors.

```typescript
14: interface AuthState {
15:   user: User | null
16:   accessToken: string | null
17:   isAuthenticated: boolean
18:   loading: boolean
19:   error: string | null
20: }
21: 
22: const initialState: AuthState = {
23:   user: null,
24:   accessToken: null,
25:   isAuthenticated: false,
26:   loading: false,
27:   error: null,
28: }
```
* **Lines 14–28:** Defines the TypeScript interface and default state for authentication.

```typescript
35: export const login = createAsyncThunk<AuthResponse['data'], LoginRequest>(
36:   'auth/login',
37:   async (credentials, { rejectWithValue }) => {
38:     try {
39:       const response = await api.post<AuthResponse>('/auth/login', credentials)
40:       localStorage.setItem('refreshToken', response.data.data.refreshToken)
41:       return response.data.data
42:     } catch (error: any) {
43:       return rejectWithValue(error.response?.data?.error || 'Login failed')
44:     }
45:   }
46: )
```
* **Lines 35–46:** `createAsyncThunk` creates an asynchronous action creator. When `dispatch(login({ email, password }))` is executed:
  1. Dispatches action type `'auth/login/pending'`
  2. Makes HTTP POST request to `/auth/login`
  3. Stores `refreshToken` in `localStorage`
  4. On success, dispatches action type `'auth/login/fulfilled'` with the user object & access token as payload.
  5. On failure, dispatches action type `'auth/login/rejected'` with error message.

```typescript
172: const authSlice = createSlice({
173:   name: 'auth',
174:   initialState,
175:   reducers: {
176:     clearError: (state) => { state.error = null },
177:     setAccessToken: (state, action: PayloadAction<string>) => {
178:       state.accessToken = action.payload
179:     },
180:     clearAuth: (state) => {
181:       state.user = null
182:       state.accessToken = null
183:       state.isAuthenticated = false
184:       state.error = null
185:       localStorage.removeItem('refreshToken')
186:     },
187:   },
188:   extraReducers: (builder) => {
189:     builder
190:       .addCase(login.pending, (state) => {
191:         state.loading = true
192:         state.error = null
193:       })
194:       .addCase(login.fulfilled, (state, action) => {
195:         state.loading = false
196:         state.user = action.payload.user
197:         state.accessToken = action.payload.accessToken
198:         state.isAuthenticated = true
199:         state.error = null
200:       })
201:       .addCase(login.rejected, (state, action) => {
202:         state.loading = false
203:         state.error = action.payload as string
204:         state.isAuthenticated = false
205:       })
...
```
* **Lines 172–187:** `reducers` contains synchronous actions (`clearError`, `setAccessToken`, `clearAuth`).
* **Lines 188–205:** `extraReducers` updates state based on the async thunk outcomes (`login.pending`, `login.fulfilled`, `login.rejected`).

```typescript
311: export const selectUser = (state: { auth: AuthState }) => state.auth.user
312: export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
313: export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
```
* **Lines 311–313:** Selector functions used by components (`useAppSelector(selectUser)`) to read state cleanly.

---

## 3. Full End-to-End Execution Walkthrough

Here is the exact step-by-step trace of code execution when a user logs in and views their data on the Profile page.

```
[ User Action: Click "Log In" button ]
                 │
                 ▼
1. Login.tsx (handleSubmit)
   └─► dispatch({ type: 'auth/login/fulfilled', payload: loginMockData.data })
                 │
                 ▼
2. Redux Store (store/index.ts)
   └─► Receives action & routes to authReducer (authSlice.ts)
                 │
                 ▼
3. authSlice.ts (extraReducers -> login.fulfilled)
   └─► Updates Redux memory:
         state.auth.user = { organizationName: "Addis Ababa University", email: "procurement@aau.edu.et", ... }
         state.auth.isAuthenticated = true
                 │
                 ▼
4. React-Redux Subscription Listener
   └─► Detects state change and notifies subscribed components
                 │
                 ▼
5. Login.tsx
   └─► Calls navigate('/dashboard')
                 │
                 ▼
6. DashboardLayout.tsx (SidebarContent)
   └─► Calls const currentUser = useAppSelector(selectUser)
   └─► Renders: {currentUser?.organizationName} -> "Addis Ababa University"
                 │
                 ▼
7. User Clicks "Profile" link in Sidebar -> Navigates to /dashboard/profile
                 │
                 ▼
8. ProfilePage.tsx
   └─► Calls const currentUser = useAppSelector(selectUser)
   └─► Initializes form state with currentUser values
   └─► Input fields pre-populated with TIN, Phone, Address, Email
```

### Phase 1: User Clicks "Log In" / Submits Form
1. In `src/pages/Login.tsx` (Lines 33–51), user submits the form:
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     if (!validate()) return
     
     await dispatch({
       type: 'auth/login/fulfilled',
       payload: loginMockData.data
     })
     
     navigate('/dashboard')
   }
   ```

### Phase 2: Redux Store Updates Memory State
1. Redux receives action `{ type: 'auth/login/fulfilled', payload: loginMockData.data }`.
2. In `src/store/slices/authSlice.ts` (Lines 208–214), `extraReducers` executes:
   ```typescript
   state.loading = false
   state.user = action.payload.user
   state.accessToken = action.payload.accessToken
   state.isAuthenticated = true
   ```
3. `state.auth.user` now contains:
   ```json
   {
     "id": "usr-001",
     "email": "procurement@aau.edu.et",
     "organizationName": "Addis Ababa University",
     "organizationType": "University",
     "phoneNumber": "0911234567",
     "tinNumber": "0012345678",
     "address": {
       "addressType": "autocomplete",
       "addressFormatted": "King George VI St, Addis Ababa",
       "city": "Addis Ababa",
       "region": "Addis Ababa City Administration"
     }
   }
   ```

### Phase 3: Navigation to Dashboard & Sidebar Rendering
1. `navigate('/dashboard')` routes to `DashboardHome.tsx`, which renders inside `DashboardLayout.tsx`.
2. `DashboardLayout.tsx` (Line 40) reads user data:
   ```typescript
   const currentUser = useAppSelector(selectUser)
   ```
3. `DashboardLayout.tsx` (Line 74) displays the organization name dynamically:
   ```tsx
   <p className="text-sm font-semibold text-sidebar-foreground truncate">
     {currentUser?.organizationName || 'Organization'}
   </p>
   ```

### Phase 4: Opening & Rendering Profile Page
1. User clicks the "Profile" link in the sidebar (`/dashboard/profile`).
2. `ProfilePage.tsx` (Line 29) retrieves the user profile from Redux:
   ```typescript
   const currentUser = useAppSelector(selectUser)
   ```
3. `ProfilePage.tsx` (Lines 37–50) populates form state directly from `currentUser`:
   ```typescript
   const [form, setForm] = useState({
     organizationName: currentUser?.organizationName || '',
     organizationType: currentUser?.organizationType || 'University',
     phoneNumber: currentUser?.phoneNumber || '',
     tinNumber: currentUser?.tinNumber || '',
     email: currentUser?.email || '',
     addressFormatted: currentUser?.address.addressFormatted || '',
     // ...
   })
   ```
4. The inputs in `ProfilePage.tsx` automatically render with the user's saved data!

### Phase 5: What Happens During Page Refresh ($F5$)
1. If page is refreshed, Redux store memory resets to `initialState`.
2. In `AuthProvider.tsx` (Lines 20–34), `initializeAuth()` runs on mount:
   ```typescript
   useEffect(() => {
     const initialize = async () => {
       await dispatch(initializeAuth()).unwrap()
     }
     initialize()
   }, [dispatch])
   ```
3. `initializeAuth` restores session using stored credentials/tokens in `localStorage`, maintaining seamless authentication.

---

## 4. Summary Checklist for Adding New Redux Features

When adding a new feature (e.g., Super Admin Management):
1. **Define Payload Types** in `src/types/api.ts`.
2. **Create Slice** in `src/store/slices/<feature>Slice.ts` with state interface, initial state, async thunks, and selectors.
3. **Register Reducer** in `src/store/index.ts` under `configureStore({ reducer: { <feature>: <feature>Reducer } })`.
4. **Subscribe & Dispatch in UI** using `useAppSelector(select<Feature>)` and `dispatch(<action>())`.
