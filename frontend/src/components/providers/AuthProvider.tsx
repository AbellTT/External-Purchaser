import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { initializeAuth } from '@/store/slices/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider - Initializes authentication on app load in background
 *
 * Never blocks initial render with a full-screen loading spinner.
 * Session verification happens asynchronously in the background.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initialize = async () => {
      try {
        await dispatch(initializeAuth()).unwrap()
      } catch {
        // Silent fail — in mock mode or expired session, authSlice handles state
      }
    }

    initialize()
  }, [dispatch])

  return <>{children}</>
}
