import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  initializeAdminAuth,
  selectAdminUser,
  selectIsAdminAuthenticated,
  selectIsAdminInitialized,
  selectAdminAuthLoading,
  selectAdminAccessToken,
} from '@/store/adminSlices/adminAuthSlice'

interface AdminProtectedRouteProps {
  children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAdminUser)
  const isAuthenticated = useAppSelector(selectIsAdminAuthenticated)
  const isInitialized = useAppSelector(selectIsAdminInitialized)
  const loading = useAppSelector(selectAdminAuthLoading)
  const accessToken = useAppSelector(selectAdminAccessToken)

  useEffect(() => {
    if (!accessToken && !isInitialized) {
      dispatch(initializeAdminAuth())
    }
  }, [dispatch, accessToken, isInitialized])

  if (!isInitialized || loading) {
    return null
  }

  const roleLower = (user?.role || '').toLowerCase()
  const isAdmin = isAuthenticated && Boolean(accessToken) && (roleLower === 'admin' || user?.is_staff || user?.is_superuser)

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
