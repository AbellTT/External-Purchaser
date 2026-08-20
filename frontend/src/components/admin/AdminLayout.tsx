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
import { adminLogout, selectAdminUser } from '@/store/adminSlices/adminAuthSlice'

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
  const currentUser = useAppSelector(selectAdminUser)
  const activeRoute = location.pathname

  const handleLogout = () => {
    dispatch(adminLogout())
    navigate('/admin/login')
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] border-r border-[#30363d]">
      {/* Header / Brand */}
      <div className="px-5 py-5 border-b border-[#30363d] flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f0f6fc]/20 text-[#f0f6fc] border border-[#f0f6fc]/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#f0f6fc] tracking-wide flex items-center gap-1.5">
              Super Admin
            </h2>
            <p className="text-[11px] text-[#8b949e] font-mono">Babi Management</p>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-[#8b949e] hover:text-[#f0f6fc]">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-2">Management Suite</p>
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
                  ? 'bg-[#f0f6fc]/20 text-[#f0f6fc] font-semibold border border-[#f0f6fc]/40'
                  : 'text-[#c9d1d9] hover:bg-[#161b22] hover:text-[#f0f6fc]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#f0f6fc]' : 'text-[#8b949e]'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#f0f6fc]" />}
            </Link>
          )
        })}
      </nav>

      {/* User Portal Link & Logout */}
      <div className="p-3 border-t border-[#30363d] space-y-2">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="w-full text-xs bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#30363d] hover:text-[#ffffff] justify-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#f0f6fc]" />
            Switch to User Portal
          </Button>
        </Link>
        <div className="px-3 py-2 bg-[#161b22] rounded-md flex items-center justify-between border border-[#30363d]">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-[#f0f6fc] truncate">{currentUser?.email || 'admin@babi.et'}</p>
            <p className="text-[10px] text-[#8b949e] flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-[#f0f6fc]" /> Super Administrator
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] shrink-0">
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
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 z-30">
        <AdminSidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#0d1117]/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 max-w-full z-10">
            <AdminSidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-14 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[#c9d1d9]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#f0f6fc]" />
              <span className="text-xs font-mono font-medium text-[#c9d1d9] hidden sm:inline">
                Super Admin Operations & Platform Control
              </span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 bg-[#0d1117] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
