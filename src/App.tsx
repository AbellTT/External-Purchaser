import { Routes, Route, Outlet } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { DashboardPreview } from '@/pages/DashboardPreview'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'

/**
 * Root layout — provides the base background and font shell.
 * Uses Outlet for nested routes per React Router docs.
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
 * /         → Landing page
 * /dashboard → Dashboard preview (dev/test)
 */
function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/"          element={<Landing />} />
        <Route path="/dashboard" element={<DashboardPreview />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="*"          element={<Landing />} />
      </Route>
    </Routes>
  )
}

export default App
