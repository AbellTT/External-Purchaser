import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import {
  selectIsAuthenticated,
  selectIsInitialized,
  selectAuthLoading,
} from '@/store/slices/authSlice'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const location = useLocation()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isInitialized = useAppSelector(selectIsInitialized)
  const loading = useAppSelector(selectAuthLoading)

  /*
   * AuthProvider handles the initial refresh on page reload.
   * While that is happening, do not prematurely redirect.
   */
  if (requireAuth && (!isInitialized || loading)) {
    return null
  }

  /*
   * No valid authenticated session.
   */
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  return <>{children}</>
}