# API Requirements Corrections - Iteration 3 Complete

**Date:** 2026-08-06  
**Sections Covered:** 9-13 (Basket System, Order History, Market Intelligence, Procurement Calendar, Notifications)

---

## Summary of Changes

### ✅ Section 5: Basket System

#### Major Changes:
1. **One Basket = One Brand (CRITICAL BUSINESS RULE)**
   - Changed from `products: Array<...>` to single `brand: {...}`
   - Each basket contains exactly ONE brand only
   - Structure: `{ brandId, brandName, productId, productName, brandImageUrl }`

2. **Basket Number Format Added**
   - New field: `basketNumber`
   - Format: `"BSK-YEAR/MONTH/DATE-UNIQUE_ID"`
   - Example: `"BSK-2026/08/06-X7Y9A"`
   - Consistent with order number format

3. **Removed `targetPrice` Field**
   - No longer showing "target price to reach"
   - Replaced with actual comparison structure

4. **Three Price Comparison Fields**
   - `basketPrice`: Platform's offered price for this basket
   - `merkato_retailer_price`: Merkato retailers (first layer)
   - `regular_stationary_market_price`: Regular stationary market
   - All 3 prices shown side-by-side for transparency

5. **Savings Only When Basket Completes**
   - `completedSavings` field only exists when `status === "completed"`
   - Shows two comparisons:
     - `vsMerkatoRetailer`: Savings vs Merkato prices
     - `vsRegularStationaryMarket`: Savings vs regular market
   - Active baskets don't show estimated savings (prevents misleading promises)

6. **Show Participant Names (Not Just Count)**
   - `participants: Array<{ organizationName, commitment, joinedDate }>`
   - Frontend displays actual organization names
   - Transparency: users can see who else is participating

7. **Redux Updates After Join/Update/Leave**
   - Response includes complete updated basket object
   - Frontend replaces basket in Redux immediately
   - No need to refetch all baskets
   - Optimistic UI updates

---

### ✅ Section 6: Order History

#### Major Changes:
1. **Completely Separate from Basket History**
   - Two distinct endpoints:
     - `GET /api/orders/history` → Direct purchase orders ONLY
     - `GET /api/baskets/history` → Basket orders ONLY
   - Different data structures
   - Different pages in UI
   - Clearer API contracts

2. **Removed `type` Field**
   - Order history endpoint returns direct purchases only
   - No need for `type: "direct" | "basket"` discrimination
   - Simplified response structure

3. **Removed `basketType` Field**
   - Not applicable to direct purchases
   - Only basket history has `type: "weekly" | "monthly" | "6-month"`

4. **Only 4 Status Values**
   - `"pending"`: Order placed, awaiting acceptance
   - `"accepted"`: Order accepted, preparing
   - `"out-for-delivery"`: Order being delivered
   - `"delivered"`: Order completed
   - ❌ Removed: `"processing"`, `"shipped"`, `"cancelled"`

5. **`subtotal` Moved Into Items Array**
   - Each item has: `{ productName, brandName, quantity, unit, price, subtotal }`
   - `subtotal = quantity * price` calculated per item
   - `pricing.itemsTotal` = sum of all item subtotals
   - Better for itemized receipts and order details

6. **Savings Structure (Two Comparisons)**
   ```typescript
   savings: {
     vsMerkatoRetailer: { amount: number, percentage: number }
     vsRegularStationaryMarket: { amount: number, percentage: number }
   }
   ```
   - Consistent with basket savings structure
   - Shows both absolute amount (ETB) and percentage (%)

7. **Separate Basket History Endpoint**
   - `GET /api/baskets/history`
   - Different structure: brand info, yourOrder details, completedDate
   - Only shows `completed` or `cancelled` baskets
   - No mixing with direct purchase orders

8. **Reorder Updates Redux**
   - New order added to ordersSlice immediately
   - Dashboard activeOrders count incremented
   - Optimistic UI update

---

### ✅ Section 7: Market Intelligence

#### Major Changes:
1. **Brand-Based, Not Generic Products**
   - Each entry is a specific brand: "Sinar Line A4 Paper", "05A HP Toner Ink"
   - Not generic: "A4 Paper", "Toner"
   - Matches actual market data structure

2. **Three Price Layers (NOT Two)**
   ```typescript
   current_pricing: {
     regularMarketPrice: number           // Regular stationary market
     merkatoRetailerPrice: number         // Merkato retailers
     platformDirectPrice: number          // Platform's own price (NOT Merkato)
   }
   ```
   - **CRITICAL**: `platformDirectPrice` is platform's price, not Merkato price
   - Common mistake: thinking platform price = Merkato price
   - Platform price is platform's offered direct purchase price

3. **Monthly Data Structure (14 Months)**
   - Array of 14 months: Jul 2024 to Aug 2025
   - Each month has all 3 price points
   - Month format: `"Jul-24"`, `"Aug-25"`
   ```typescript
   data: Array<{
     month: string                        // "Jul-24"
     regularMarket: number
     merkatoRetailer: number
     platformDirect: number               // Platform's price
   }>
   ```

4. **No Weekly History Field**
   - Removed `weeklyHistory` array
   - Frontend displays monthly data only
   - Simplified structure

5. **Separate Endpoint for 500 Companies Loss Analysis**
   - New endpoint: `GET /api/market-intelligence/500-companies-loss`
   - Powers "500 Companies Loss Analysis" page
   - Shows:
     - Total loss due to bad procurement timing
     - Top companies with highest losses
     - Product-specific loss analysis
     - Methodology explanation
   - Uses `500_companies_badSalesAndLoss.json` (to be created)

---

### ✅ Section 8: Procurement Calendar

#### Major Changes:
1. **Returns Brands, Not Products**
   - Endpoint: `GET /api/procurement-calendar/brands`
   - Returns specific brands: "Siner Line A4 Paper", "OSA HP Toner"
   - Not generic products
   - Matches actual frontend implementation

2. **Bi-Monthly Data Structure**
   - 6 periods per year:
     - Sept - Oct
     - Nov - Dec
     - Jan - Feb
     - Mar - Apr
     - May - Jun
     - Jul - Aug
   - Each period has:
     ```typescript
     {
       period: string
       average_price_etb: { min: number, max: number }
       weekly_increase_etb: { min: number, max: number }
       weekly_discount_etb: { min: number, max: number }
     }
     ```
   - Matches `bi-monthly_data.json` structure

3. **Multi-Year Support**
   ```typescript
   yearlyMetrics: Array<{
     year: number                       // 2026, 2025, etc.
     ethiopianYear: number              // 2017, 2016, etc.
     periods: Array<BiMonthlyPeriod>
   }>
   ```
   - Currently showing 2026 data
   - Structure supports adding 2025, 2024, etc.
   - Frontend displays all years side-by-side

4. **Frontend Does Summary Ranking**
   - Backend sends raw bi-monthly data
   - **Frontend calculates:**
     - Best season (lowest avg price + best stability)
     - 2nd best season
     - Worst season (highest price or volatility)
     - Savings potential percentage
     - Comparative labels
   - **Backend does NOT send** "best", "worst" labels

5. **Comparative Summary Position**
   - Summary displayed **ABOVE** historical data cards
   - Shows ranking based on multi-year averages
   - Uses relative terms: "Top Ranked", "Moderate", "Avoid Period"
   - **No concrete prices in summary** (just percentage differences)

6. **Metrics Moved Inside Historical Data**
   - Original structure had metrics separate from year
   - **New structure:** Metrics are inside each year's period
   - Better for multi-year display
   ```typescript
   Year 2026 (Ethiopian 2017)
   ├─ 2026 Avg Price: ~ETB 513
   ├─ Price Variance: ETB 65
   ├─ Typical Weekly Rise: ~ETB 65
   └─ Typical Weekly Drop: ~ETB 45
   ```

7. **Two Types of Brands**
   - **WITH biMonthlyData**: Show complete historical analysis (4 main brands)
   - **WITHOUT biMonthlyData**: Show only seasonal recommendations (admin-configured)
   - Different UI for each type

---

### ✅ Section 9: Notifications

#### Major Changes:
1. **Polling Strategy Chosen (NOT WebSocket)**
   - **Decision**: Use polling for MVP
   - **Justification**:
     - ✅ Simpler to implement (2-3x faster)
     - ✅ Procurement workflows don't need instant notifications
     - ✅ 30-second delay is acceptable
     - ✅ Lower infrastructure complexity
     - ✅ Easier to debug and monitor
     - ✅ Can upgrade to WebSocket later without changing frontend much

2. **Polling Implementation**
   ```typescript
   // Poll every 30 seconds when tab is visible
   setInterval(() => {
     if (document.visibilityState === 'visible') {
       dispatch(fetchNotifications())
     }
   }, 30000)
   
   // Also fetch on page focus
   document.addEventListener('visibilitychange', handleFocus)
   ```

3. **WebSocket Documented for Future**
   - Complete WebSocket implementation provided
   - Marked as "Phase 2/3 enhancement"
   - Migration path documented
   - Keep polling as fallback even after WebSocket

4. **Browser Notification Permission Strategy**
   - Request on first login or in settings page
   - Only show browser notifications when:
     - User granted permission
     - Tab is not focused (user is away)
     - Notification is high priority
   - Don't spam user with notifications

5. **Notification Types Defined**
   - `order_update`: Order status changed
   - `basket_closing`: Basket closing soon (24h left)
   - `price_alert`: Price drop on previously purchased product
   - `delivery`: Order out for delivery or delivered
   - `system`: Platform announcements
   - Each type has specific `actionUrl` and behavior

6. **Redux Updates After Mark as Read**
   - Response includes updated notification
   - Frontend updates specific notification in Redux
   - Decrements unreadCount
   - No full refetch needed
   - Optimistic UI updates

---

## Database Implications

### New Tables/Fields Required:

**baskets table:**
```sql
- basket_number (string, format: BSK-YYYY/MM/DD-XXXXX)
- brand_id (foreign key) -- ONE brand per basket
- basket_price (decimal)
- merkato_retailer_price (decimal)
- regular_stationary_market_price (decimal)
- completed_savings_vs_merkato (decimal, nullable)
- completed_savings_vs_regular_market (decimal, nullable)
```

**basket_participants table:**
```sql
- basket_id (foreign key)
- user_id (foreign key)
- organization_name (string) -- Denormalized for display
- commitment (decimal)
- joined_date (timestamp)
```

**orders table (updated):**
```sql
- Remove: type field
- Remove: basket_type field
- status: ENUM('pending', 'accepted', 'out-for-delivery', 'delivered')
- savings_vs_merkato_amount (decimal)
- savings_vs_merkato_percentage (decimal)
- savings_vs_regular_market_amount (decimal)
- savings_vs_regular_market_percentage (decimal)
```

**order_items table (updated):**
```sql
- subtotal (decimal) -- quantity * price per item
```

**basket_orders table (NEW):**
```sql
- id (primary key)
- basket_id (foreign key)
- user_id (foreign key)
- basket_number (string)
- completed_date (timestamp)
- delivery_date (timestamp)
- your_commitment (decimal)
- your_quantity (number)
- unit_price (decimal)
- subtotal (decimal)
- savings fields (same as orders)
```

**market_intelligence table:**
```sql
- brand_name (string) -- NOT product_name
- monthly_data (JSONB) -- 14 months of 3-layer pricing
- last_updated (timestamp)
```

**procurement_calendar table:**
```sql
- brand_name (string) -- NOT product_name
- brand_amharic (string)
- has_historical_data (boolean)
- bi_monthly_data (JSONB) -- yearlyMetrics structure
- seasonal_recommendations (JSONB) -- for brands without data
- admin_recommendation (text)
```

**notifications table:**
```sql
- type (ENUM)
- title (string)
- message (text)
- read (boolean, default false)
- created_at (timestamp)
- metadata (JSONB)
```

---

## Frontend Changes Required

### 1. Basket System Page Updates

**BasketSystemPage.tsx:**
```typescript
// Change from products array to single brand
interface Basket {
  // OLD: products: Array<Product>
  // NEW: brand: { brandId, brandName, productId, productName, brandImageUrl }
  brand: {
    brandId: string
    brandName: string
    productId: string
    productName: string
    productUnit: string
    brandImageUrl: string
  }
}

// Display 3 prices side-by-side
<div className="flex gap-4">
  <PriceCard label="Basket Price" price={basket.pricing.basketPrice} />
  <PriceCard label="Merkato Retailer" price={basket.pricing.merkato_retailer_price} />
  <PriceCard label="Regular Market" price={basket.pricing.regular_stationary_market_price} />
</div>

// Show savings only when completed
{basket.status === 'completed' && basket.completedSavings && (
  <div>
    <p>Saved vs Merkato: ETB {basket.completedSavings.vsMerkatoRetailer}</p>
    <p>Saved vs Regular Market: ETB {basket.completedSavings.vsRegularStationaryMarket}</p>
  </div>
)}

// Show participant names
<div>
  <h4>Participants ({basket.participation.totalParticipants})</h4>
  {basket.participation.participants.map(p => (
    <div key={p.organizationName}>
      <p>{p.organizationName}</p>
      <p>Commitment: ETB {p.commitment}</p>
    </div>
  ))}
</div>
```

**Redux updates after actions:**
```typescript
// After join/update/leave, response includes updatedBasket
dispatch(updateBasket(response.data.updatedBasket))
// No need to refetch all baskets
```

---

### 2. Order History Page Updates

**OrderHistoryPage.tsx:**
```typescript
// Remove type filter (only direct purchases)
// Remove basketType display
// Use only 4 statuses

// Display item subtotals
{order.items.map(item => (
  <div>
    <p>{item.productName} - {item.brandName}</p>
    <p>{item.quantity} × ETB {item.price} = ETB {item.subtotal}</p>
  </div>
))}

// Display two savings comparisons
<div>
  <p>Saved vs Merkato: ETB {order.savings.vsMerkatoRetailer.amount} ({order.savings.vsMerkatoRetailer.percentage}%)</p>
  <p>Saved vs Regular Market: ETB {order.savings.vsRegularStationaryMarket.amount} ({order.savings.vsRegularStationaryMarket.percentage}%)</p>
</div>
```

**New Page: BasketHistoryPage.tsx**
```typescript
// Separate page for basket order history
// Different endpoint: /api/baskets/history
// Different data structure
// Shows only completed/cancelled baskets
```

---

### 3. Market Intelligence Page Updates

**MarketIntelligencePage.tsx:**
```typescript
// Use brand names (not product names)
// Display 3 price layers

// Chart with 3 lines
<LineChart data={product.data}>
  <Line dataKey="regularMarket" stroke="red" name="Regular Market" />
  <Line dataKey="merkatoRetailer" stroke="orange" name="Merkato Retailer" />
  <Line dataKey="platformDirect" stroke="green" name="Platform Direct" />
</LineChart>

// Current pricing display
<div className="grid grid-cols-3 gap-4">
  <PriceCard 
    label="Regular Market" 
    price={product.current_pricing.regularMarketPrice}
    color="red"
  />
  <PriceCard 
    label="Merkato Retailer" 
    price={product.current_pricing.merkatoRetailerPrice}
    color="orange"
  />
  <PriceCard 
    label="Platform Direct" 
    price={product.current_pricing.platformDirectPrice}
    color="green"
  />
</div>
```

**New Page: 500CompaniesLossPage.tsx**
```typescript
// Dedicated page for loss analysis
// Endpoint: /api/market-intelligence/500-companies-loss
// Shows:
// - Overview stats
// - Top companies with losses
// - Product-specific analysis
// - Methodology explanation
```

---

### 4. Procurement Calendar Page Updates

**ProcurementCalendarPage.tsx:**
```typescript
// Already correctly implemented!
// Uses bi-monthly_data.json structure
// Frontend calculates rankings
// Displays comparative summaries above historical data

// Ensure metrics are shown inside year cards
<div className="bg-surface-muted/30 rounded-md p-3">
  <p>Year 2026 (Ethiopian Calendar 2017)</p>
  <div className="grid grid-cols-4 gap-3">
    <div>
      <p>2026 Avg Price</p>
      <p>~ETB {avgPrice}</p>
    </div>
    <div>
      <p>Price Variance</p>
      <p>ETB {variance}</p>
    </div>
    <div>
      <p>Typical Weekly Rise</p>
      <p>~ETB {weeklyRise}</p>
    </div>
    <div>
      <p>Typical Weekly Drop</p>
      <p>~ETB {weeklyDrop}</p>
    </div>
  </div>
</div>
```

---

### 5. Notifications Updates

**Navbar.tsx (Notification Bell):**
```typescript
// Add polling logic
useEffect(() => {
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      dispatch(fetchNotifications())
    }
  }, 30000)
  
  return () => clearInterval(interval)
}, [dispatch])

// Fetch on page focus
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      dispatch(fetchNotifications())
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [dispatch])

// Browser notifications (when tab not focused)
useEffect(() => {
  if (
    Notification.permission === 'granted' &&
    document.visibilityState === 'hidden' &&
    latestNotification
  ) {
    new Notification(latestNotification.title, {
      body: latestNotification.message,
      icon: '/favicon.svg',
      tag: latestNotification.id
    })
  }
}, [latestNotification])
```

**NotificationsPage.tsx:**
```typescript
// Mark as read on click
const handleNotificationClick = async (notification: Notification) => {
  if (!notification.read) {
    await dispatch(markNotificationAsRead(notification.id))
  }
  
  // Navigate to action URL
  if (notification.metadata.actionUrl) {
    navigate(notification.metadata.actionUrl)
  }
}

// Mark all as read button
const handleMarkAllRead = async () => {
  await dispatch(markAllNotificationsAsRead())
}
```

---

## Redux Architecture Updates

### Updated Redux Slices:

#### basketsSlice
```typescript
interface BasketsState {
  list: Array<Basket>
  loading: boolean
  lastFetched: number | null
}

// Actions:
// - fetchBaskets()
// - joinBasket(basketId, commitment) → updates specific basket in list
// - updateCommitment(basketId, newCommitment) → updates specific basket
// - leaveBasket(basketId) → updates specific basket
// - updateBasket(updatedBasket) → replaces basket in list

// Selectors:
// - selectActiveBaskets: filter by status === 'active'
// - selectCompletedBaskets: filter by status === 'completed'
// - selectUserActiveBaskets: filter by userParticipation.isParticipating
```

#### ordersSlice
```typescript
interface OrdersState {
  history: Array<Order>           // Direct purchases only
  basketHistory: Array<BasketOrder>  // Basket orders (separate)
  pagination: PaginationInfo
  basketPagination: PaginationInfo
  loading: boolean
  basketLoading: boolean
  filters: { status: string }
}

// Actions:
// - fetchOrderHistory() → direct purchases
// - fetchBasketHistory() → basket orders
// - reorder(orderId) → adds new order to history
```

#### marketIntelligenceSlice
```typescript
interface MarketIntelligenceState {
  products: Array<MarketProduct>
  lossAnalysis: CompanyLossAnalysis | null
  selectedProduct: string | null
  loading: boolean
  lastFetched: number | null
}

// Actions:
// - fetchMarketData()
// - fetchLossAnalysis()
// - selectProduct(productId)
```

#### procurementCalendarSlice
```typescript
interface ProcurementCalendarState {
  brands: Array<ProcurementBrand>  // Changed from products
  selectedBrand: string
  loading: boolean
  lastFetched: number | null
}

// Actions:
// - fetchProcurementData()
// - selectBrand(brandName)
```

#### notificationsSlice
```typescript
interface NotificationsState {
  list: Array<Notification>
  unreadCount: number
  loading: boolean
  lastFetched: number | null
  pollInterval: number  // 30000
}

// Actions:
// - fetchNotifications()
// - markNotificationAsRead(id) → updates specific notification
// - markAllNotificationsAsRead() → updates all notifications
// - addNotification(notification) → for WebSocket (future)
```

---

## Backend Business Logic

### Basket System:
1. **Join Basket:**
   - Validate commitment amount (min/max)
   - Add user to basket_participants
   - Update basket currentCommitment (sum all participants)
   - Return complete updated basket

2. **Update Commitment:**
   - Validate new commitment
   - Update participant's commitment
   - Recalculate basket currentCommitment
   - Return complete updated basket

3. **Leave Basket:**
   - Remove user from basket_participants
   - Recalculate basket currentCommitment
   - Return updated basket (with user removed)

4. **Complete Basket:**
   - When basket reaches target:
     - Change status to 'completed'
     - Calculate savings vs Merkato and regular market
     - Store completedSavings
     - Create basket orders for all participants
     - Send notifications to all participants

### Order History:
1. **Calculate Savings:**
   ```typescript
   // For each order item
   const merkatoPrice = getMerkatoPrice(item.brandId, orderDate)
   const regularMarketPrice = getRegularMarketPrice(item.brandId, orderDate)
   const purchasePrice = item.price
   
   const savingsVsMerkato = (merkatoPrice - purchasePrice) * item.quantity
   const savingsVsRegular = (regularMarketPrice - purchasePrice) * item.quantity
   
   // Sum across all items
   const totalSavingsVsMerkato = sum(savingsVsMerkato)
   const totalSavingsVsRegular = sum(savingsVsRegular)
   
   // Calculate percentages
   const percentageVsMerkato = (totalSavingsVsMerkato / totalMerkatoValue) * 100
   const percentageVsRegular = (totalSavingsVsRegular / totalRegularValue) * 100
   ```

2. **Reorder Logic:**
   - Check stock availability for all items
   - If any unavailable, return list of unavailable items
   - If all available, create new order with same items
   - Generate new order number
   - Send notification to user

### Market Intelligence:
1. **Track 3 Price Layers:**
   - Regular market prices (highest)
   - Merkato retailer prices (middle)
   - Platform direct prices (lowest)
   - Store historical data monthly

2. **500 Companies Loss Analysis:**
   - Identify when companies purchased
   - Compare vs optimal procurement periods
   - Calculate potential savings if purchased optimally
   - Aggregate by company, industry, product

### Procurement Calendar:
1. **Aggregate Bi-Monthly Data:**
   - For each brand, for each bi-monthly period:
     - Calculate average price range (min, max)
     - Track weekly increase patterns (min, max)
     - Track weekly discount patterns (min, max)
   - Store for multiple years

2. **Multi-Year Structure:**
   - Organize by year (2026, 2025, etc.)
   - Include Ethiopian calendar year
   - Allow admin to add new years

### Notifications:
1. **Auto-Trigger Notifications:**
   - Order status change → order_update notification
   - Basket closing in 24h → basket_closing notification
   - Price drops on user's products → price_alert notification
   - Order out for delivery → delivery notification

2. **Polling Response:**
   - Return only new/unread notifications
   - Update unreadCount
   - Allow filtering by unreadOnly

---

## Testing Checklist

### Basket System:
- [ ] Join basket with valid commitment
- [ ] Update commitment to higher/lower amount
- [ ] Leave basket and verify removal
- [ ] Verify Redis updated immediately after actions
- [ ] Verify participant names displayed
- [ ] Verify 3 prices displayed correctly
- [ ] Complete basket and verify savings calculated
- [ ] Verify savings only shown when completed

### Order History:
- [ ] Fetch direct purchase orders
- [ ] Fetch basket orders (separate endpoint)
- [ ] Verify only 4 status values used
- [ ] Verify item subtotals calculated correctly
- [ ] Verify two savings comparisons shown
- [ ] Reorder with all items available
- [ ] Reorder with some items unavailable
- [ ] Verify Redux updated after reorder

### Market Intelligence:
- [ ] Fetch market data for all brands
- [ ] Verify 3 price layers displayed
- [ ] Verify 14 months of data shown
- [ ] Verify brand names used (not generic products)
- [ ] Chart displays 3 lines correctly
- [ ] Fetch 500 companies loss analysis
- [ ] Verify loss calculations accurate

### Procurement Calendar:
- [ ] Fetch procurement data for all brands
- [ ] Verify bi-monthly structure correct
- [ ] Verify multi-year support works
- [ ] Frontend calculates rankings correctly
- [ ] Verify metrics shown inside year cards
- [ ] Verify comparative summaries above data
- [ ] Brands without data show recommendations
- [ ] Admin recommendations displayed

### Notifications:
- [ ] Polling fetches new notifications every 30s
- [ ] Polling stops when tab not visible
- [ ] Fetches on page focus
- [ ] Mark single notification as read
- [ ] Mark all notifications as read
- [ ] Redux updated immediately
- [ ] Browser notifications shown when tab hidden
- [ ] Notification permission request works
- [ ] Notifications link to correct pages

---

## Performance Optimizations

### Basket System:
- Index on basket_number for fast lookup
- Denormalize organization_name in participants table
- Cache basket list in Redis (30 seconds TTL)
- Update specific basket in cache after actions

### Order History:
- Pagination with cursor (not offset)
- Index on order_date DESC for sorting
- Separate tables for direct orders vs basket orders
- Pre-calculate savings on order creation

### Market Intelligence:
- Store monthly data as JSONB for fast retrieval
- Index on brand_name
- Cache market data for 24 hours
- Update cache when admin changes prices

### Procurement Calendar:
- Store bi-monthly data as JSONB
- Cache for 7 days (rarely changes)
- Index on brand_name
- Pre-aggregate yearly metrics

### Notifications:
- Index on (user_id, read, created_at DESC)
- Pagination for notification history
- Auto-delete notifications older than 30 days
- Consider separate table for high-volume notification types

---

**Status:** ✅ Iteration 3 Complete - Sections 9-13 fully updated

**Next:** Create final summary document covering all 3 iterations
