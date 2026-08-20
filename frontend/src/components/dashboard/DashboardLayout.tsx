import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  History,
  CalendarDays,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
  User,
  Archive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout, selectUser } from '@/store/slices/authSlice'
import { selectUnreadCount } from '@/store/slices/notificationsSlice'

const NAV_ITEMS = [
  { label: 'Overview',              icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Direct Purchase',       icon: ShoppingCart,    to: '/dashboard/direct-purchase' },
  { label: 'Basket System',         icon: ShoppingBag,     to: '/dashboard/baskets' },
  { label: 'Market Intelligence',   icon: TrendingUp,      to: '/dashboard/market-intelligence' },
  { label: 'Order History',         icon: History,         to: '/dashboard/orders' },
  { label: 'Basket History',        icon: Archive,         to: '/dashboard/basket-history' },
  { label: 'Procurement Calendar',  icon: CalendarDays,    to: '/dashboard/calendar' },
  { label: 'Notifications',         icon: Bell,            to: '/dashboard/notifications', badge: 3 },
  { label: 'Profile',               icon: User,            to: '/dashboard/profile' },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeRoute = location.pathname
  const currentUser = useAppSelector(selectUser)
  const unreadCount = useAppSelector(selectUnreadCount)

  const navItems = NAV_ITEMS.map(item => 
    item.label === 'Notifications' ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined } : item
  )

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-sidebar-foreground" stroke="currentColor" strokeWidth={2.2}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-sidebar-foreground leading-none block">External Purchaser</span>
            <span className="text-[10px] text-sidebar-foreground/60 font-mono">Merkato Group Buying</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Org Badge */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-sidebar-accent/40">
          <div className="w-7 h-7 rounded bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-sidebar-foreground/80" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {currentUser?.organizationName || 'Organization'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.to === '/dashboard'
            ? activeRoute === '/dashboard'
            : activeRoute.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-sidebar-ring text-sidebar-foreground/90 rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-sidebar-foreground/40" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary/30 flex items-center justify-center shrink-0 text-xs font-bold text-sidebar-foreground">
            AA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">Procurement Officer</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">{currentUser?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await dispatch(logout())
            navigate('/login')
          }}
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 gap-2 h-8 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const unreadCount = useAppSelector(selectUnreadCount)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 h-full bg-sidebar">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-card border-b border-border shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-base text-foreground">External Purchaser</span>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/dashboard/notifications">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 gap-1">
                <Bell className="w-3 h-3" />{unreadCount}
              </Badge>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
