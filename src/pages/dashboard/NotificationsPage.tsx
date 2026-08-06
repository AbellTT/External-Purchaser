import { useState } from 'react'
import { Bell, Truck, ShoppingBag, TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

type NotifType = 'delivery' | 'basket' | 'price' | 'system'

interface Notif {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
}

const TYPE_CONFIG: Record<NotifType, { icon: React.FC<{ className?: string }>, style: string }> = {
  delivery: { icon: Truck,        style: 'text-info bg-info-bg' },
  basket:   { icon: ShoppingBag,  style: 'text-primary bg-primary-subtle' },
  price:    { icon: TrendingUp,   style: 'text-accent bg-accent-subtle' },
  system:   { icon: CheckCircle2, style: 'text-success bg-success-bg' },
}

const INITIAL: Notif[] = [
  {
    id: 'n1',
    type: 'delivery',
    title: 'Order ORD-2026-098 Out for Delivery',
    body: 'Your 120 reams of Sinar Line A4 Paper are on the way. Estimated delivery: today between 2pm–5pm.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'basket',
    title: 'Weekly Basket Closing in 2 Days',
    body: 'The August Weekly Basket for A4 Paper closes on August 8th. 3,200 more reams needed for the 15% tier.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'price',
    title: 'Price Alert — A4 Paper Rising',
    body: 'Merkato market price for A4 Paper has risen 1.5% this week to ETB 985. Joining this week\'s basket locks in ETB 820.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 'n4',
    type: 'basket',
    title: 'New 6-Month Basket Opened',
    body: 'A new 6-month basket for HP 05A Toner Ink is now open. Projected discount: up to 22%. Closes September 15.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Order ORD-2026-089 Delivered',
    body: 'Your Box File Kent order (80 pieces) has been successfully delivered to your registered address.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'price',
    title: 'New Price Data Available',
    body: 'August market price data has been updated. A4 Paper, Box Files, and HP Toner prices have been refreshed.',
    time: '4 days ago',
    read: true,
  },
]

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL)
  const [filter, setFilter] = useState<'all' | NotifType>('all')

  const unreadCount = notifications.filter((n) => !n.read).length

  const filtered = notifications.filter((n) => filter === 'all' || n.type === filter)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
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
                <span className="text-sm font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">{unreadCount}</span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Basket alerts, delivery updates, and price notifications.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'delivery', 'basket', 'price', 'system'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="text-xs capitalize"
            >
              {f === 'all' ? 'All' : f === 'price' ? 'Price Alerts' : f === 'basket' ? 'Baskets' : f === 'delivery' ? 'Deliveries' : 'System'}
            </Button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No notifications in this category.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const config = TYPE_CONFIG[n.type]
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    n.read
                      ? 'bg-card border-border opacity-70 hover:opacity-100'
                      : 'bg-card border-border hover:bg-surface-muted/40 ring-1 ring-primary/10'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.style}`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                    <p className="text-[11px] text-muted-foreground/60 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
