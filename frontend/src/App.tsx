import { Toaster } from 'sonner'
import { Routes, Route, Outlet } from 'react-router-dom'

import { AuthProvider } from '@/components/providers/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'

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
import { AdminProtectedRoute } from '@/components/providers/AdminProtectedRoute'
import { AdminBasketHistoryPage } from '@/pages/admin/AdminBasketHistoryPage'
import { AdminTINVerificationPage } from '@/pages/admin/AdminTINVerificationPage'
import { NotFoundPage } from '@/pages/NotFoundPage'


function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Toaster position="top-right" richColors />
      <Outlet />
    </div>
  )
}


function App() {
  return (
    <AuthProvider>
      <Routes>

        <Route element={<RootLayout />}>

          {/* =====================================================
              PUBLIC USER ROUTES
          ===================================================== */}

          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />


          {/* =====================================================
              PROTECTED USER ROUTES
          ===================================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/direct-purchase"
            element={
              <ProtectedRoute>
                <DirectPurchasePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/baskets"
            element={
              <ProtectedRoute>
                <BasketSystemPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/market-intelligence"
            element={
              <ProtectedRoute>
                <MarketIntelligencePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/calendar"
            element={
              <ProtectedRoute>
                <ProcurementCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/basket-history"
            element={
              <ProtectedRoute>
                <BasketHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/company-loss-analysis"
            element={
              <ProtectedRoute>
                <CompanyLossAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/company-loss"
            element={
              <ProtectedRoute>
                <CompanyLossAnalysisPage />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              PUBLIC ADMIN LOGIN
          ===================================================== */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />


          {/* =====================================================
              PROTECTED ADMIN ROUTES
          ===================================================== */}

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
            path="/admin/tin-verification"
            element={
              <AdminProtectedRoute>
                <AdminTINVerificationPage />
              </AdminProtectedRoute>
            }
          />


          {/* =====================================================
              CATCH-ALL
          ===================================================== */}

          <Route
            path="*"
            element={<NotFoundPage />}
          />

        </Route>

      </Routes>
    </AuthProvider>
  )
}

export default App