import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'

// ============================================================
// AXIOS INSTANCE
// ============================================================

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8001/api',

  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// REDUX STORE REFERENCE
// ============================================================

let storeReference: any = null

export const setStoreReference = (store: any) => {
  storeReference = store
}

// Single-flight refresh token lock
let activeUserRefreshPromise: Promise<string> | null = null

async function getRefreshedUserAccessToken(): Promise<string> {
  if (!activeUserRefreshPromise) {
    activeUserRefreshPromise = (async () => {
      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        const { accessToken } = refreshResponse.data.data

        if (storeReference) {
          const { setAccessToken } = await import('@/store/slices/authSlice')
          storeReference.dispatch(setAccessToken(accessToken))
        }

        return accessToken
      } finally {
        activeUserRefreshPromise = null
      }
    })()
  }
  return activeUserRefreshPromise
}

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (storeReference) {
      const state = storeReference.getState()
      const accessToken = state.auth?.accessToken

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }

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

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response
  },

  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean
        })
      | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url || ''

    if (
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register')
    ) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const accessToken = await getRefreshedUserAccessToken()

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
      }

      return api(originalRequest)
    } catch (refreshError) {
      if (storeReference) {
        const { clearAuth } = await import('@/store/slices/authSlice')
        storeReference.dispatch(clearAuth())
      }

      return Promise.reject(refreshError)
    }
  }
)

// ============================================================
// API ERROR HELPER
// ============================================================

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
