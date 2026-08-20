import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User, LoginRequest, AuthResponse, RefreshTokenResponse } from '@/types/api'
import { adminApi } from '@/lib/adminApi'

function loadAdminUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem('adminUser')
    if (raw) {
      return JSON.parse(raw) as User
    }
  } catch {
    // Treat corrupt storage as null
  }
  return null
}

function saveAdminUserToStorage(user: User): void {
  localStorage.setItem('adminUser', JSON.stringify(user))
}

interface AdminAuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  loading: boolean
  error: string | null
}

const storedAdminUser = loadAdminUserFromStorage()

const initialState: AdminAuthState = {
  user: storedAdminUser,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
}

export const adminLogin = createAsyncThunk<AuthResponse['data'], LoginRequest>(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminApi.post<AuthResponse>('/auth/admin/login', credentials)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Admin login failed')
    }
  }
)

export const adminRefreshToken = createAsyncThunk<
  RefreshTokenResponse['data'],
  void,
  { rejectValue: string }
>(
  'adminAuth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const storedToken = localStorage.getItem('adminRefreshToken')
      const response = await adminApi.post<RefreshTokenResponse>(
        '/auth/admin/refresh',
        storedToken ? { refreshToken: storedToken } : {}
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Admin token refresh failed')
    }
  }
)

export const adminLogout = createAsyncThunk<void, void>(
  'adminAuth/logout',
  async () => {
    try {
      await adminApi.post('/auth/admin/logout')
    } catch (error) {
      console.error('Admin logout API call failed:', error)
    }
  }
)

export const initializeAdminAuth = createAsyncThunk<
  RefreshTokenResponse['data'],
  void,
  { rejectValue: string }
>(
  'adminAuth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(adminRefreshToken()).unwrap()
      return result
    } catch (error: any) {
      return rejectWithValue('Admin session expired')
    }
  }
)

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null
    },
    setAdminAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    clearAdminAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('adminUser')
    },
    setAdminUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      saveAdminUserToStorage(action.payload)
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false
        state.isInitialized = true
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
        saveAdminUserToStorage(action.payload.user)
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false
        state.isInitialized = true
        state.error = action.payload as string
        state.isAuthenticated = false
      })

    // REFRESH TOKEN
    builder
      .addCase(adminRefreshToken.pending, (state) => {
        state.loading = true
      })
      .addCase(adminRefreshToken.fulfilled, (state, action) => {
        state.loading = false
        state.isInitialized = true
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
        if (action.payload.user) {
          state.user = action.payload.user
          saveAdminUserToStorage(action.payload.user)
        }
      })
      .addCase(adminRefreshToken.rejected, (state) => {
        state.loading = false
        state.isInitialized = true
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
      })

    // LOGOUT
    builder
      .addCase(adminLogout.fulfilled, (state) => {
        state.loading = false
        state.isInitialized = true
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
        localStorage.removeItem('adminUser')
      })

    // INITIALIZE AUTH
    builder
      .addCase(initializeAdminAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAdminAuth.fulfilled, (state, action) => {
        state.loading = false
        state.isInitialized = true
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        if (action.payload.user) {
          state.user = action.payload.user
          saveAdminUserToStorage(action.payload.user)
        } else if (!state.user) {
          state.user = loadAdminUserFromStorage()
        }
      })
      .addCase(initializeAdminAuth.rejected, (state) => {
        state.loading = false
        state.isInitialized = true
        state.accessToken = null
        state.isAuthenticated = false
      })
  },
})

export const {
  clearAdminError,
  setAdminAccessToken,
  clearAdminAuth,
  setAdminUser,
} = adminAuthSlice.actions

export const selectAdminAuth = (state: { adminAuth: AdminAuthState }) => state.adminAuth
export const selectAdminUser = (state: { adminAuth: AdminAuthState }) => state.adminAuth.user
export const selectIsAdminAuthenticated = (state: { adminAuth: AdminAuthState }) => state.adminAuth.isAuthenticated
export const selectIsAdminInitialized = (state: { adminAuth: AdminAuthState }) => state.adminAuth.isInitialized
export const selectAdminAccessToken = (state: { adminAuth: AdminAuthState }) => state.adminAuth.accessToken
export const selectAdminAuthLoading = (state: { adminAuth: AdminAuthState }) => state.adminAuth.loading
export const selectAdminAuthError = (state: { adminAuth: AdminAuthState }) => state.adminAuth.error

export default adminAuthSlice.reducer
