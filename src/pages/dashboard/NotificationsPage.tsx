import { useState, useEffect } from 'react'
import { Bell, Truck, ShoppingBag, TrendingUp, CheckCircle2, Clock, Trash2, Radio, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAllNotifications,
  selectUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
  addNotification,
} from '@/store/slices/notificationsSlice'
import notificationsMock from '@/data/notifications/notificationsList.json'

// ==================== SKELETON ====================

function NotificationsSkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-72 bg-muted rounded" />
          </div>
          <div className="h-9 w-28 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-md" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

type NotifType = 'delivery' | 'basket' | 'price' | 'system'

const TYPE_CONFIG: Record<NotifType, { icon: React.FC<{ className?: string }>; style: string }> = {
  delivery: { icon: Truck, style: 'text-info bg-info-bg' },
  basket: { icon: ShoppingBag, style: 'text-primary bg-primary-subtle' },
  price: { icon: TrendingUp, style: 'text-accent bg-accent-subtle' },
  system: { icon: CheckCircle2, style: 'text-success bg-success-bg' },
}

const PAGE_SIZE = 4 // Set to 4 so pagination controls are easily testable on mock datasets

export function NotificationsPage() {
  const dispatch = useAppDispatch()
  const reduxNotifs = useAppSelector(selectAllNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)

  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [filter, setFilter] = useState<'all' | NotifType>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setIsFirstLoad(true)
    // Seed Redux with mock notifications data
    dispatch({
      type: 'notifications/fetchNotifications/fulfilled',
      payload: {
        notifications: notificationsMock.data.notifications.map((n: any) => ({
          ...n,
          type: n.type === 'order_update' ? 'delivery' : n.type === 'basket_closing' ? 'basket' : n.type === 'price_alert' ? 'price' : n.type,
          body: n.message,
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
        unreadCount: notificationsMock.data.unreadCount,
        pagination: { currentPage: 1, totalPages: 1, totalNotifications: notificationsMock.data.notifications.length, pageSize: PAGE_SIZE },
      },
    })
    const timer = setTimeout(() => setIsFirstLoad(false), 600)
    return () => clearTimeout(timer)
  }, [dispatch])

  if (isFirstLoad) return <NotificationsSkeleton />

  const notifsList: any[] = reduxNotifs.length > 0 ? reduxNotifs : []

  const filtered = notifsList.filter((n) => filter === 'all' || n.type === filter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleMarkAllRead = () => {
    dispatch({
      type: 'notifications/markAllRead/fulfilled',
      payload: notifsList.map((n) => ({ ...n, read: true })),
    })
    dispatch(markAllRead())
  }

  const handleMarkRead = (id: string) => {
    const target = notifsList.find((n) => n.id === id)
    if (target) {
      dispatch({
        type: 'notifications/markAsRead/fulfilled',
        payload: { ...target, read: true },
      })
      dispatch(markAsRead(id))
    }
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    dispatch({
      type: 'notifications/deleteNotification/fulfilled',
      payload: id,
    })
    dispatch(deleteNotification(id))
  }

  // Simulate real-time stream incoming alert
  const handleSimulateStream = () => {
    const simulatedTypes: NotifType[] = ['basket', 'price', 'delivery', 'system']
    const randomType = simulatedTypes[Math.floor(Math.random() * simulatedTypes.length)]
    const newNotif = {
      id: `stream_${Date.now()}`,
      type: randomType,
      title: randomType === 'basket' ? 'New Group Basket Opened' : randomType === 'price' ? 'Price Alert: 8% Discount' : 'Delivery Dispatch Update',
      body: 'Live update received from server stream! Join or check details inside dashboard.',
      time: 'Just now',
      read: false,
      createdAt: new Date().toISOString(),
    }
    dispatch(addNotification(newNotif))
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Basket alerts, delivery updates, and live price notifications.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleSimulateStream} className="text-xs gap-1.5">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              Simulate Stream
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'delivery', 'basket', 'price', 'system'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => { setFilter(f); setPage(1) }}
              className="text-xs capitalize"
            >
              {f === 'all'
                ? 'All'
                : f === 'price'
                ? 'Price Alerts'
                : f === 'basket'
                ? 'Baskets'
                : f === 'delivery'
                ? 'Deliveries'
                : 'System'}
            </Button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {paginated.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No notifications in this category.</p>
            </div>
          ) : (
            paginated.map((n) => {
              const config = TYPE_CONFIG[n.type as NotifType] || TYPE_CONFIG.system
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors group ${
                    n.read
                      ? 'bg-card border-border opacity-70 hover:opacity-100'
                      : 'bg-card border-border hover:bg-surface-muted/40 ring-1 ring-primary/10'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.style}`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.body || n.message}</p>
                    <p className="text-[11px] text-muted-foreground/60 font-mono flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" />
                      {n.time || new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-sm font-mono text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
