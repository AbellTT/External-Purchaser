import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Building2,
  TrendingUp,
  Truck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout, selectUser } from '@/store/slices/authSlice'

const ADMIN_NAV_ITEMS = [
  { label: 'Overview & Analytics', icon: LayoutDashboard, to: '/admin' },
  { label: 'Basket Control',      icon: ShoppingBag,     to: '/admin/baskets' },
  { label: 'Orders Processing',   icon: ShoppingCart,    to: '/admin/orders' },
  { label: 'Products & Pricing',  icon: Tag,             to: '/admin/products' },
  { label: 'Org Approvals',       icon: Building2,       to: '/admin/organizations' },
  { label: 'Market Data Entry',   icon: TrendingUp,      to: '/admin/market-data' },
  { label: 'Wholesale Suppliers', icon: Truck,           to: '/admin/suppliers' },
]

function AdminSidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectUser)
  const activeRoute = location.pathname

  const handleLogout = () => {
    localStorage.removeItem('isAdminSession')
    dispatch(logout())
    navigate('/admin/login')
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-800">
      {/* Header / Brand */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
              Super Admin
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Babi Management</p>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Management Suite</p>
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeRoute === item.to || (item.to !== '/admin' && activeRoute.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* User Portal Link & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="w-full text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white justify-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            Switch to User Portal
          </Button>
        </Link>
        <div className="px-3 py-2 bg-slate-900 rounded-md flex items-center justify-between border border-slate-800">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-white truncate">{currentUser?.email || 'admin@babi.et'}</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" /> Super Administrator
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-red-400 hover:bg-slate-800 shrink-0">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 z-30">
        <AdminSidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 max-w-full z-10">
            <AdminSidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-slate-950 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-300"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono font-medium text-slate-200 hidden sm:inline">
                Super Admin Operations & Platform Control
              </span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
