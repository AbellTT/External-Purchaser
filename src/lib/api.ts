import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Store for Redux store reference (set by store configuration)
let storeReference: any = null

export const setStoreReference = (store: any) => {
  storeReference = store
}

// Request interceptor - Add access token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get access token from Redux store
    if (storeReference) {
      const state = storeReference.getState()
      const accessToken = state.auth?.accessToken

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }

      // Mark dashboard as stale after any mutating request so the overview
      // page re-fetches fresh data on the next visit
      const method = (config.method || 'get').toUpperCase()
      if (method !== 'GET') {
        const { markDashboardStale } = await import('@/store/slices/dashboardSlice')
        storeReference.dispatch(markDashboardStale())
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // No refresh token, redirect to login
          if (storeReference) {
            const { clearAuth } = await import('@/store/slices/authSlice')
            storeReference.dispatch(clearAuth())
          }
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Try to refresh the token
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data.data

        // Update tokens
        if (storeReference) {
          const { setAccessToken } = await import('@/store/slices/authSlice')
          storeReference.dispatch(setAccessToken(accessToken))
        }
        localStorage.setItem('refreshToken', newRefreshToken)

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        if (storeReference) {
          const { clearAuth } = await import('@/store/slices/authSlice')
          storeReference.dispatch(clearAuth())
        }
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API errors
export const getApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      'An unexpected error occurred'
    )
  }
  return 'An unexpected error occurred'
}
