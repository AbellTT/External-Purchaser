import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { initializeAuth, selectAuthLoading } from '@/store/slices/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider - Initializes authentication on app load
 * 
 * Checks for stored refresh token and attempts to restore session
 * Shows loading state while initializing
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const authLoading = useAppSelector(selectAuthLoading)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize auth on mount
    const initialize = async () => {
      try {
        await dispatch(initializeAuth()).unwrap()
      } catch (error) {
        // Silent fail - user will see login page
        console.log('No stored session or session expired')
      } finally {
        setIsInitialized(true)
      }
    }

    initialize()
  }, [dispatch])

  // Show loading spinner while initializing
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
