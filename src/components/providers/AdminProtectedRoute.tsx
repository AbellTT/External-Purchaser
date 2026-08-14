import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice'

interface AdminProtectedRouteProps {
  children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isAdminSession = localStorage.getItem('isAdminSession') === 'true'

  // Allow access if logged in as admin or if an active admin session flag is set
  const isAdmin = (isAuthenticated && user?.role === 'admin') || isAdminSession

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
