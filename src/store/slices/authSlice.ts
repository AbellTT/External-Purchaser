import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
} from '@/types/api'
import { api } from '@/lib/api'

// ==================== STATE INTERFACE ====================

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

// ==================== ASYNC THUNKS ====================

/**
 * Login user
 */
export const login = createAsyncThunk<AuthResponse['data'], LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      
      // Store refresh token in localStorage
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed')
    }
  }
)

/**
 * Register new user
 */
export const register = createAsyncThunk<AuthResponse['data'], RegisterRequest>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData)
      
      // Store refresh token in localStorage
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed')
    }
  }
)

/**
 * Refresh access token
 */
export const refreshToken = createAsyncThunk<
  RefreshTokenResponse['data'],
  void,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken')
      
      if (!storedRefreshToken) {
        return rejectWithValue('No refresh token available')
      }

      const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken: storedRefreshToken,
      })
      
      // Update refresh token in localStorage
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      
      return response.data.data
    } catch (error: any) {
      // Clear invalid refresh token
      localStorage.removeItem('refreshToken')
      return rejectWithValue(error.response?.data?.error || 'Token refresh failed')
    }
  }
)

/**
 * Logout user
 */
export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    try {
      // Optional: Call backend to blacklist refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('refreshToken')
    }
  }
)

/**
 * Initialize auth from stored refresh token
 */
export const initializeAuth = createAsyncThunk<
  RefreshTokenResponse['data'],
  void,
  { rejectValue: string }
>(
  'auth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken')
      
      if (!storedRefreshToken) {
        return rejectWithValue('No stored session')
      }

      // Try to refresh to get new access token and user info
      const result = await dispatch(refreshToken()).unwrap()
      return result
    } catch (error: any) {
      localStorage.removeItem('refreshToken')
      return rejectWithValue('Session expired')
    }
  }
)

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk<User, Partial<User>>(
  'auth/updateProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await api.put<{ success: boolean; data: User }>(
        '/user/profile',
        updates
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Profile update failed')
    }
  }
)

// ==================== SLICE ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null
    },
    
    /**
     * Set access token (used by axios interceptor)
     */
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    
    /**
     * Clear auth state (force logout)
     */
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('refreshToken')
    },
  },
  extraReducers: (builder) => {
    // ===== LOGIN =====
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
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })

    // ===== REGISTER =====
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })

    // ===== REFRESH TOKEN =====
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })

    // ===== LOGOUT =====
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
      })

    // ===== INITIALIZE AUTH =====
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
      })

    // ===== UPDATE PROFILE =====
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// ==================== ACTIONS ====================

export const { clearError, setAccessToken, clearAuth } = authSlice.actions

// ==================== SELECTORS ====================

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error

// ==================== EXPORT ====================

export default authSlice.reducer
