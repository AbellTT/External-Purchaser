import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchNotifications,
  markOneAsRead,
  markAllAsRead,
  selectAllNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsPagination,
  selectActiveFilter,
  setActiveFilter,
  type AppNotification,
} from '@/store/slices/notificationsSlice'

// Category Icons & Styling Config
const CATEGORY_CONFIG: Record<
  string,
  { icon: React.FC<{ className?: string }>; style: string; badgeLabel: string }
> = {
  order: {
    icon: ShoppingCart,
    style: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    badgeLabel: 'Order Update',
  },
  price: {
    icon: TrendingUp,
    style: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    badgeLabel: 'Price Alert',
  },
  basket: {
    icon: ShoppingBag,
    style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    badgeLabel: 'Basket Alert',
  },
  account: {
    icon: ShieldCheck,
    style: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    badgeLabel: 'Account Status',
  },
  general: {
    icon: CheckCircle2,
    style: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    badgeLabel: 'System',
  },
}

function NotificationsSkeletonContent() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="h-9 w-28 bg-muted rounded" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 bg-muted rounded-md" />
        ))}
      </div>
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectAllNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)
  const loading = useAppSelector(selectNotificationsLoading)
  const pagination = useAppSelector(selectNotificationsPagination)
  const activeFilter = useAppSelector(selectActiveFilter)

  const [page, setPage] = useState(1)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  )

  // Fetch notifications when category or page changes
  useEffect(() => {
    dispatch(fetchNotifications({ category: activeFilter, page }))
  }, [activeFilter, page])

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setBrowserPermission(perm)
    }
  }

  const handleFilterChange = (filter: 'all' | 'unread' | 'order' | 'price' | 'basket' | 'account') => {
    dispatch(setActiveFilter(filter))
    setPage(1)
  }

  const handleMarkOneRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    dispatch(markOneAsRead(id))
  }

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead())
  }

  // Check if notification has a valid dashboard deep-link action URL
  const hasActionUrl = (url: string | null | undefined): boolean => {
    if (!url) return false
    const trimmed = url.trim()
    if (!trimmed || trimmed === '#' || trimmed === '/' || trimmed === '/dashboard' || trimmed === '/dashboard/') {
      return false
    }
    // Must start with /dashboard/ (e.g. /dashboard/orders, /dashboard/baskets, /dashboard/market-intelligence)
    return trimmed.startsWith('/dashboard/')
  }

  return (
    <DashboardLayout>
      {loading && notifications.length === 0 ? (
        <NotificationsSkeletonContent />
      ) : (
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                Notifications
                {unreadCount > 0 && (
                  <span className="text-xs font-bold font-mono bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 shadow-sm">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="py-2 text-sm sm:text-base text-muted-foreground mt-1 font-medium">
                Real-time alerts for procurement baskets, order status updates, weekly price changes, and account verification on MBE External Purchaser.
              </p> 
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-xs sm:text-sm font-semibold gap-1.5 border-border hover:bg-card h-9"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Browser Notification Permission Banner */}
          {browserPermission === 'default' && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">Enable Browser OS Desktop Notifications</h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Get instant desktop popup alerts on MBE External Purchaser even when working in another application.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={requestBrowserPermission}
                  className="text-xs font-semibold gap-1.5 h-8.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Enable Desktop Alerts
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: `Unread (${unreadCount})` },
              { key: 'order', label: 'Order Updates' },
              { key: 'price', label: 'Price Alerts' },
              { key: 'basket', label: 'Basket Alerts' },
              { key: 'account', label: 'Account' },
            ].map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                variant={activeFilter === tab.key ? 'default' : 'outline'}
                onClick={() => handleFilterChange(tab.key as any)}
                className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-lg shrink-0 transition-all ${
                  activeFilter === tab.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Compact Notification List */}
          <div className="space-y-2.5">
            {notifications.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-10 text-center space-y-2">
                  <div className="w-11 h-11 rounded-full bg-muted/30 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                    <Bell className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-foreground">No notifications in this category</p>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                    You are all caught up! Real-time alerts for basket discounts and order updates on MBE External Purchaser will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((n: AppNotification) => {
                const categoryConfig = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.general
                const Icon = categoryConfig.icon
                const canNavigate = hasActionUrl(n.action_url)

                return (
                  <Card
                    key={n.id}
                    onClick={(e) => handleMarkOneRead(e, n.id)}
                    className={`bg-card border transition-all cursor-pointer group ${
                      n.is_read
                        ? 'border-border/80 opacity-80 hover:opacity-100'
                        : 'border-primary/40 ring-1 ring-primary/20 shadow-sm'
                    }`}
                  >
                    <CardContent className="py-3 px-4 sm:py-3.5 sm:px-4.5 flex items-start gap-3.5">
                      {/* Compact Category Icon Badge */}
                      <div
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${categoryConfig.style}`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            {/* Larger, Bold Notification Title */}
                            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                              {n.title}
                            </h3>
                            {!n.is_read && (
                              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 animate-pulse" />
                            )}
                            <Badge variant="outline" className="text-xs font-mono font-semibold px-2 py-0.5 border-border">
                              {categoryConfig.badgeLabel}
                            </Badge>
                          </div>

                          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(n.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Larger Message Typography */}
                        <p className="text-sm sm:text-base text-muted-foreground/90 leading-relaxed font-normal">
                          {n.message}
                        </p>

                        {/* Action Link only for actionable notifications (orders, price alerts, baskets) */}
                        {canNavigate && (
                          <div className="pt-1">
                            <Link to={n.action_url} onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 h-7 px-2.5 gap-1.5"
                              >
                                View Details
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Pagination Controls (PageSize = 10) */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-border flex-wrap">
              <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.totalItems} total)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-xs sm:text-sm font-semibold gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="text-xs sm:text-sm font-semibold gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
