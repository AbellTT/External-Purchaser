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
 * Dashboard routes:
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

          {/* Catch-all */}
          <Route path="*" element={<Landing />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
