import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { initializeAuth, selectAccessToken, selectIsInitialized } from '@/store/slices/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const accessToken = useAppSelector(selectAccessToken)
  const isInitialized = useAppSelector(selectIsInitialized)

  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (!isAdminRoute && !accessToken && !isInitialized) {
      dispatch(initializeAuth())
    }
  }, [dispatch, accessToken, isInitialized, isAdminRoute])

  return <>{children}</>
}