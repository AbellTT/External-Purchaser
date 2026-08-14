import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes from unauthorized access.
 * For now, this is a basic implementation that checks localStorage.
 * In production, this should verify with backend authentication.
 * 
 * Usage:
 * <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
 */
export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  // Check if user is authenticated
  // For now, checking localStorage for a token
  // In production, this should verify with backend
  const isAuthenticated = localStorage.getItem('authToken') !== null

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" replace />
  }

  // User is authenticated or auth not required, render children
  return <>{children}</>
}
