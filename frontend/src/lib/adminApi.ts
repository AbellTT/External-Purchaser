import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'

const getAdminApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${hostname}:8001/api`
}

export const adminApi = axios.create({
  baseURL: getAdminApiBaseUrl(),
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let storeReference: any = null

export const setAdminStoreReference = (store: any) => {
  storeReference = store
}

let activeAdminRefreshPromise: Promise<string> | null = null

async function getRefreshedAdminAccessToken(): Promise<string> {
  if (!activeAdminRefreshPromise) {
    activeAdminRefreshPromise = (async () => {
      try {
        const refreshResponse = await axios.post(
          `${adminApi.defaults.baseURL}/auth/admin/refresh`,
          {},
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        )

        const { accessToken } = refreshResponse.data.data

        if (storeReference) {
          const { setAdminAccessToken } = await import('@/store/adminSlices/adminAuthSlice')
          storeReference.dispatch(setAdminAccessToken(accessToken))
        }

        return accessToken
      } finally {
        activeAdminRefreshPromise = null
      }
    })()
  }
  return activeAdminRefreshPromise
}

adminApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (storeReference) {
      const state = storeReference.getState()
      const accessToken = state.adminAuth?.accessToken

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

adminApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url || ''

    if (
      requestUrl.includes('/auth/admin/refresh') ||
      requestUrl.includes('/auth/admin/logout') ||
      requestUrl.includes('/auth/admin/login')
    ) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const accessToken = await getRefreshedAdminAccessToken()

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
      }

      return adminApi(originalRequest)
    } catch (refreshError) {
      if (storeReference) {
        const { clearAdminAuth } = await import('@/store/adminSlices/adminAuthSlice')
        storeReference.dispatch(clearAdminAuth())
      }
      return Promise.reject(refreshError)
    }
  }
)
