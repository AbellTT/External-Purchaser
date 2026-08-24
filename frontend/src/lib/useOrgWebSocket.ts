import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getCurrentUser, selectUser } from '@/store/slices/authSlice'
import { selectAdminUser } from '@/store/adminSlices/adminAuthSlice'
import { fetchMarketIntelligence, fetchProcurementCalendar } from '@/store/slices/marketIntelligenceSlice'
import { fetchProducts } from '@/store/slices/productsSlice'
import { pushRealtimeNotification, setUnreadCount, setAllRead, fetchNotifications } from '@/store/slices/notificationsSlice'
import { fetchOrderHistory } from '@/store/slices/ordersSlice'
import { fetchUserBaskets, fetchPlatformBasketHistory } from '@/store/slices/basketsSlice'
import { fetchAdminOrders } from '@/store/adminSlices/adminOrdersSlice'
import { fetchAdminBaskets } from '@/store/adminSlices/adminBasketsSlice'
import { fetchAdminOverview } from '@/store/slices/adminSlice'

export function useOrgWebSocket() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectUser)
  const adminUser = useAppSelector(selectAdminUser)
  const activeUser = currentUser || adminUser
  const lastProcessedEventRef = useRef<string | null>(null)

  useEffect(() => {
    if (!activeUser) return

    // Capture non-null user identity for event filtering inside callbacks.
    const activeUserId = activeUser.id
    const activeUserEmail = activeUser.email

    // Production: VITE_WS_BASE_URL (e.g. wss://<backend>.up.railway.app) -> <base>/ws
    // Dev fallback: legacy standalone broadcast server on port 8002 (unchanged behaviour)
    const envWsBase = (import.meta.env.VITE_WS_BASE_URL as string | undefined)?.trim()
    const wsUrl = envWsBase
      ? `${envWsBase.replace(/\/+$/, '')}/ws`
      : `ws://${window.location.hostname || 'localhost'}:8002`

    let socket: WebSocket | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl)

        socket.onopen = () => {
          console.log('[WebSocket] Connected to event broadcast server at', wsUrl)
        }

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.type === 'NEW_NOTIFICATION') {
              const notifId = data.notification?.id
              const eventKey = `notif_${notifId || Date.now()}`
              
              if (lastProcessedEventRef.current === eventKey) {
                return // Deduplicate duplicate event stream
              }
              lastProcessedEventRef.current = eventKey

              // Check if notification is for this user or global
              if (!data.userId || String(data.userId) === String(activeUserId) || data.userEmail === activeUserEmail) {
                console.log('[WebSocket] Real-time notification received:', data)
                if (data.notification) {
                  dispatch(pushRealtimeNotification({
                    notification: data.notification,
                    unreadCount: data.unreadCount,
                  }))

                  // Show deduplicated toast notification with explicit ID
                  toast.info(data.notification.title, {
                    id: eventKey,
                    description: data.notification.message,
                    duration: 6000,
                  })

                  // Trigger Native Desktop Browser OS Notification
                  if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                      new Notification('MBE External Purchaser', {
                        body: `${data.notification.title}: ${data.notification.message}`,
                        icon: '/favicon.ico',
                        tag: eventKey,
                      })
                    } catch (e) {
                      console.warn('Native notification failed:', e)
                    }
                  }
                }
              }
            } else if (data.type === 'NOTIFICATION_READ') {
              if (String(data.userId) === String(activeUserId)) {
                dispatch(setUnreadCount(data.unreadCount))
              }
            } else if (data.type === 'NOTIFICATION_READ_ALL') {
              if (String(data.userId) === String(activeUserId)) {
                dispatch(setAllRead())
              }
            } else if (data.type === 'ORGANIZATION_STATUS_CHANGED') {
              const eventKey = `org_${data.orgId}_${data.verificationStatus}_${data.verifiedAt || ''}`
              if (lastProcessedEventRef.current === eventKey) {
                return // Deduplicate event
              }
              lastProcessedEventRef.current = eventKey

              console.log('[WebSocket] Organization status changed event received:', data)

              // Refresh user profile & notifications in Redux silently
              dispatch(getCurrentUser())
              dispatch(fetchNotifications({ category: 'all', page: 1 }))

              if (data.verificationStatus === 'approved') {
                toast.success(`🎉 Organization Verification Approved!`, {
                  id: eventKey,
                  description: `Your organization "${data.orgName || 'Account'}" is now verified. Full procurement access granted!`,
                  duration: 6000,
                })
              } else if (data.verificationStatus === 'suspended') {
                toast.error(`Organization Verification Rejected`, {
                  id: eventKey,
                  description: data.verificationNotes || `Verification for "${data.orgName || 'Account'}" was not approved by admin.`,
                  duration: 8000,
                })
              }
            } else if (data.type === 'MARKET_DATA_UPDATED') {
              console.log('[WebSocket] Market Data update event received:', data)
              // Silent refresh of user market intelligence, procurement calendar, and product catalog
              dispatch(fetchMarketIntelligence({ silent: true }))
              dispatch(fetchProcurementCalendar({ silent: true }))
              dispatch(fetchProducts({ pageSize: 100 }))
            } else if (data.type === 'ORDER_CREATED') {
              console.log('[WebSocket] Order created event received:', data)
              dispatch(fetchOrderHistory({ silent: true }))
              dispatch(fetchAdminOrders({ silent: true }))
              dispatch(fetchAdminOverview())
              if (adminUser || currentUser?.role === 'admin') {
                toast.info(`New Order Placed`, {
                  description: `Order #${data.orderNumber} for ETB ${data.total?.toLocaleString() || 0} placed.`,
                })
              }
            } else if (data.type === 'ORDER_STATUS_CHANGED') {
              console.log('[WebSocket] Order status changed event received:', data)
              dispatch(fetchOrderHistory({ silent: true }))
              dispatch(fetchAdminOrders({ silent: true }))
              dispatch(fetchAdminOverview())
            } else if (data.type === 'BASKET_UPDATED' || data.type === 'BASKET_STATUS_CHANGED') {
              console.log('[WebSocket] Basket update event received:', data)
              dispatch(fetchUserBaskets({ tab: 'open', page: 1, silent: true }))
              dispatch(fetchUserBaskets({ tab: 'active', page: 1, silent: true }))
              dispatch(fetchPlatformBasketHistory({ page: 1, silent: true }))
              dispatch(fetchAdminBaskets({ silent: true }))
              dispatch(fetchAdminOverview())
            }
          } catch (err) {
            console.error('[WebSocket] Message parsing error:', err)
          }
        }

        socket.onclose = () => {
          console.log('[WebSocket] Connection closed. Retrying in 5 seconds...')
          reconnectTimeout = setTimeout(connect, 5000)
        }

        socket.onerror = (err) => {
          console.warn('[WebSocket] Connection error:', err)
        }
      } catch (err) {
        console.warn('[WebSocket] Failed to initialize connection:', err)
      }
    }

    connect()

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (socket) socket.close()
    }
  }, [dispatch, activeUser?.id, currentUser?.id, adminUser?.id])
}
