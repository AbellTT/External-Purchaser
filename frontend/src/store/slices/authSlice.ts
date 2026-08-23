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
import { clearNotifications } from '@/store/slices/notificationsSlice'


// ==================== LOCALSTORAGE HELPERS ====================

/**
 * Attempt to restore the user object from localStorage.
 * Falls back to null if nothing is stored or the JSON is corrupt.
 */
function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      return JSON.parse(raw) as User
    }
  } catch {
    // Corrupt storage - treat as no user
  }
  return null
}

/**
 * Persist the user object to localStorage.
 */
function saveUserToStorage(user: User): void {
  localStorage.setItem('user', JSON.stringify(user))
}

/**
 * Clear auth-related tokens from localStorage.
 * We deliberately keep the 'user' object so the app remembers the user's
 * organization name for the sidebar and greetings even if they need to re-login.
 */
function clearAuthStorage(): void {
  // Refresh token is stored in an HttpOnly cookie,
  // so JavaScript does not manage it here.
}

// ==================== STATE INTERFACE ====================

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  loading: boolean
  error: string | null
}

/**
 * On page load we restore the user from localStorage so components like
 * DashboardLayout and ProfilePage always have data even after a hard refresh.
 * isAuthenticated is true only if we actually have a stored user — the
 * AuthProvider will verify the session by calling initializeAuth() which
 * also refreshes the accessToken from the refreshToken cookie.
 */
const storedUser = loadUserFromStorage()

const initialState: AuthState = {
  user: storedUser,
  accessToken: null,                      // Access tokens are NEVER persisted (memory-only)
  isAuthenticated: false,
  isInitialized: false,                   // Tracks whether initial cookie check has completed
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
      return response.data.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Invalid email or password. Please check your credentials.'
      return rejectWithValue(errorMsg)
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
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.errors ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Registration failed'
      )
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
      const response = await api.post<RefreshTokenResponse>(
        '/auth/refresh'
      )

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Token refresh failed'
      )
    }
  }
)

/**
 * Logout user
 */
export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      dispatch(clearNotifications())
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
      // Try to refresh to get new access token and user info
      const result = await dispatch(refreshToken()).unwrap()
      return result
    } catch (error: any) {
      return rejectWithValue('Session expired')
    }
  }
)

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk<User, Partial<User>, {rejectValue: string}>(
  'auth/updateProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ success: boolean; data: User }>(
        '/auth/me',
        updates
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Profile update failed'
      )
    }
  }
)

/**
 * Fetch current user profile
 */
export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: User }>('/auth/me')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch current user')
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
      localStorage.removeItem('user')
      clearAuthStorage()
    },

    /**
     * Update user in state and localStorage (e.g. after profile save via mock)
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      saveUserToStorage(action.payload)
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
        state.isInitialized = true
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
        saveUserToStorage(action.payload.user)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isInitialized = true
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
        state.isInitialized = true
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
        saveUserToStorage(action.payload.user)
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.isInitialized = true
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
        state.isInitialized = true
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
        if (action.payload.user) {
          state.user = action.payload.user
          saveUserToStorage(action.payload.user)
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false
        state.isInitialized = true
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
      })

    // ===== LOGOUT =====
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.isInitialized = true
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
        localStorage.removeItem('user')
        clearAuthStorage()
      })

    // ===== INITIALIZE AUTH =====
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.isInitialized = true
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        if (action.payload.user) {
          state.user = action.payload.user
          saveUserToStorage(action.payload.user)
        } else if (!state.user) {
          state.user = loadUserFromStorage()
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.isInitialized = true
        state.accessToken = null
        state.isAuthenticated = false
        clearAuthStorage()
      })

    // ===== UPDATE PROFILE =====
    builder
      .addCase(updateProfile.pending, (state) => {
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
        state.error = null
        // Keep localStorage in sync with profile edits
        saveUserToStorage(action.payload)
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // ===== GET CURRENT USER =====
    builder
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        saveUserToStorage(action.payload)
      })
  },
})

// ==================== ACTIONS ====================

export const { clearError, setAccessToken, clearAuth, setUser } = authSlice.actions

// ==================== SELECTORS ====================

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error

// ==================== EXPORT ====================

export default authSlice.reducer
