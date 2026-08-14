import { Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { DirectPurchasePage } from '@/pages/dashboard/DirectPurchasePage'
import { BasketSystemPage } from '@/pages/dashboard/BasketSystemPage'
import { MarketIntelligencePage } from '@/pages/dashboard/MarketIntelligencePage'
import { OrderHistoryPage } from '@/pages/dashboard/OrderHistoryPage'
import { ProcurementCalendarPage } from '@/pages/dashboard/ProcurementCalendarPage'
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage'
import { ProfilePage } from '@/pages/dashboard/ProfilePage'
import { BasketHistoryPage } from '@/pages/dashboard/BasketHistoryPage'
import { CompanyLossAnalysisPage } from '@/pages/dashboard/CompanyLossAnalysisPage'

// Admin
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminDashboardHome } from '@/pages/admin/AdminDashboardHome'
import { AdminBasketsPage } from '@/pages/admin/AdminBasketsPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminProductsPricingPage } from '@/pages/admin/AdminProductsPricingPage'
import { AdminOrganizationsPage } from '@/pages/admin/AdminOrganizationsPage'
import { AdminMarketDataPage } from '@/pages/admin/AdminMarketDataPage'
import { AdminSuppliersPage } from '@/pages/admin/AdminSuppliersPage'
import { AdminProtectedRoute } from '@/components/providers/AdminProtectedRoute'
import { AdminBasketHistoryPage } from '@/pages/admin/AdminBasketHistoryPage'

/**
 * Root layout — provides the base background and font shell.
 */
function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Outlet />
    </div>
  )
}

/**
 * App.tsx — root router
 *
 * Public routes:
 *   /              → Landing page
 *   /login         → Login
 *   /signup        → Registration wizard
 *   /forgot-password → Password reset
 *
 * Dashboard routes (authenticated users):
 *   /dashboard                    → Home overview
 *   /dashboard/direct-purchase    → 4-step direct purchase
 *   /dashboard/baskets            → Basket pooling system
 *   /dashboard/market-intelligence → Price charts & loss analysis
 *   /dashboard/orders             → Order history
 *   /dashboard/calendar           → Procurement calendar
 *   /dashboard/notifications      → Notification center
 *   /dashboard/profile            → Edit profile/organization details
 *   /dashboard/basket-history     → Completed/cancelled baskets
 *   /dashboard/company-loss-analysis → 500 companies capital loss analysis
 *
 * Admin routes (super admin only):
 *   /admin/login          → Admin login (public)
 *   /admin                → Admin dashboard home
 *   /admin/baskets        → Basket management
 *   /admin/orders         → Order processing
 *   /admin/products       → Products & pricing
 *   /admin/organizations  → Organization verification
 *   /admin/market-data    → Historical market data entry
 *   /admin/suppliers      → Wholesale supplier directory
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public */}
          <Route path="/"                element={<Landing />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dashboard — layout is embedded inside each page via DashboardLayout */}
          <Route path="/dashboard"                        element={<DashboardHome />} />
          <Route path="/dashboard/direct-purchase"        element={<DirectPurchasePage />} />
          <Route path="/dashboard/baskets"                element={<BasketSystemPage />} />
          <Route path="/dashboard/market-intelligence"    element={<MarketIntelligencePage />} />
          <Route path="/dashboard/orders"                 element={<OrderHistoryPage />} />
          <Route path="/dashboard/calendar"               element={<ProcurementCalendarPage />} />
          <Route path="/dashboard/notifications"          element={<NotificationsPage />} />
          <Route path="/dashboard/profile"                element={<ProfilePage />} />
          <Route path="/dashboard/basket-history"         element={<BasketHistoryPage />} />
          <Route path="/dashboard/company-loss-analysis"  element={<CompanyLossAnalysisPage />} />

          {/* Admin login — public */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin protected routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboardHome />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/baskets"
            element={
              <AdminProtectedRoute>
                <AdminBasketsPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/baskets/history"
            element={
              <AdminProtectedRoute>
                <AdminBasketHistoryPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrdersPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <AdminProductsPricingPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/organizations"
            element={
              <AdminProtectedRoute>
                <AdminOrganizationsPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/market-data"
            element={
              <AdminProtectedRoute>
                <AdminMarketDataPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              <AdminProtectedRoute>
                <AdminSuppliersPage />
              </AdminProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Landing />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
