# Backend API Requirements - Final Review Summary

**Date:** 2026-08-06  
**Completed:** All 3 Iterations (Sections 1-13 + Auth + Authorization)  
**Status:** ✅ Ready for Backend Implementation

---

## Document Overview

This summary consolidates all corrections made to `BACKEND_API_REQUIREMENTS.md` across 3 iterations.

**Iteration 1** (Sections 1-4): Landing Page, Register, Login, Refresh Token  
**Iteration 2** (Sections 5-8): Forgot Password, Reset Password, Dashboard Overview, Direct Purchase  
**Iteration 3** (Sections 9-13): Basket System, Order History, Market Intelligence, Procurement Calendar, Notifications

---

## Critical Business Rules

### 🔴 Must Follow (Breaking Changes if Ignored):

1. **Registration → Dashboard (NOT Login)**
   - User is authenticated immediately after registration
   - Response includes accessToken + refreshToken
   - Frontend redirects to `/dashboard`, not `/login`

2. **One Basket = One Brand**
   - Each basket contains exactly ONE brand
   - Structure: `brand: { brandId, brandName, productId, productName, brandImageUrl }`
   - Not an array of products

3. **Products → Brands Hierarchy**
   - Products themselves don't have prices or images
   - Brands have prices and images
   - Structure: `Product → Brands[] → { price, imageUrl, stock }`

4. **Address Tracking**
   - Store `addressType: "autocomplete" | "manual"`
   - Backend must track which method was used
   - Different required fields based on type

5. **No Role Field**
   - System treats logged-in user as organization itself
   - Don't return `role` in login response
   - Single user type (organizations)

6. **Savings Comparisons (Two References)**
   - Always compare against TWO prices:
     - `vsMerkatoRetailer`: Merkato retailers (first layer)
     - `vsRegularStationaryMarket`: Regular stationary market
   - Both show amount (ETB) and percentage (%)

7. **Order Number Formats**
   - Direct Purchase Orders: `"ORD-2026/08/06-XXXXX"`
   - Basket Orders: `"BSK-2026/08/06-XXXXX"`
   - Format: PREFIX-YEAR/MONTH/DATE-UNIQUE_ID

8. **Only 4 Order Statuses**
   - `"pending"`, `"accepted"`, `"out-for-delivery"`, `"delivered"`
   - No: `"processing"`, `"shipped"`, `"cancelled"`

9. **Brand-Based Intelligence**
   - Market Intelligence: Brand names (not generic products)
   - Procurement Calendar: Brand names (not generic products)
   - Example: "Sinar Line A4 Paper", not "A4 Paper"

10. **Three Price Layers (NOT Two)**
    - `regularMarketPrice`: Regular stationary market
    - `merkatoRetailerPrice`: Merkato retailers
    - `platformDirectPrice`: Platform's own price (NOT Merkato)

11. **Basket Savings Only When Complete**
    - Active baskets don't show estimated savings
    - `completedSavings` field only exists when `status === "completed"`
    - Prevents misleading promises

12. **Order History ≠ Basket History**
    - Two separate endpoints
    - Two separate data structures
    - Two separate pages in UI
    - Don't mix them

---

## Endpoint Changes Summary

### ✅ New Endpoints Added:
1. `GET /api/user/profile` - Get user profile for editing
2. `PUT /api/user/profile` - Update user profile
3. `GET /api/baskets/history` - Basket order history (separate from direct purchases)
4. `GET /api/market-intelligence/500-companies-loss` - Loss analysis page

### ✅ Endpoints Modified:
1. `POST /api/auth/register` - Now returns tokens (auto-authenticate)
2. `POST /api/auth/login` - Removed role field, added complete profile
3. `GET /api/dashboard/overview` - Restructured savings, removed recentOrders
4. `GET /api/products` - Products → Brands hierarchy
5. `POST /api/orders/direct-purchase` - Removed deliveryAddress field
6. `GET /api/baskets` - One brand per basket, 3 prices, participant names
7. `GET /api/orders/history` - Separate from baskets, 4 statuses, two savings
8. `GET /api/market-intelligence/products` - 3 price layers, monthly data
9. `GET /api/procurement-calendar/brands` - Returns brands, bi-monthly structure

### ❌ Endpoints Removed:
- None (but structure changed significantly)

---

## Data Structure Changes

### Authentication Flow:
```typescript
// OLD: Register → Login page → Dashboard
// NEW: Register → Dashboard (immediately authenticated)

// OLD: Login response includes role field
// NEW: Login response NO role field, includes complete org profile

// NEW: rememberMe support
// - rememberMe: true → refreshToken expires in 30 days
// - rememberMe: false → refreshToken expires in 7 days
```

### Address Structure:
```typescript
address: {
  addressType: "autocomplete" | "manual"    // NEW: Track which method
  addressFormatted: string | null           // For autocomplete
  street: string | null                     // For manual
  subCity: string | null                    // Kifle Ketema
  area: string | null                       // Sefer
  city: string                              // Always "Addis Ababa"
  region: string                            // Always "Addis Ababa City Administration"
}
```

### Basket Structure:
```typescript
// OLD: products: Array<Product>
// NEW: brand: { brandId, brandName, productId, productName, brandImageUrl }

// OLD: pricing: { targetPrice, currentAverage, savings }
// NEW: pricing: { basketPrice, merkato_retailer_price, regular_stationary_market_price }

// OLD: participation: { totalParticipants: number, ... }
// NEW: participation: { 
//   participants: Array<{ organizationName, commitment, joinedDate }>,
//   totalParticipants: number, 
//   ...
// }

// NEW: completedSavings (only when status === "completed")
completedSavings?: {
  vsMerkatoRetailer: number
  vsRegularStationaryMarket: number
}
```

### Product Structure:
```typescript
// Products don't have prices or images
product: {
  id: string
  name: string
  category: string
  unit: string
  inStock: boolean
  // NO imageUrl, NO currentPrice
  
  brands: Array<{
    id: string
    name: string
    imageUrl: string          // Image at brand level
    price: number             // Price at brand level
    inStock: boolean
    stockQuantity: number
  }>
}
```

### Order Structure:
```typescript
// Direct Purchase Order
order: {
  orderNumber: string         // "ORD-2026/08/06-XXXXX"
  status: "pending" | "accepted" | "out-for-delivery" | "delivered"
  // NO type field, NO basketType field
  
  items: Array<{
    productName: string
    brandName: string
    quantity: number
    unit: string
    price: number
    subtotal: number          // NEW: quantity * price
  }>
  
  pricing: {
    itemsTotal: number        // Sum of all item subtotals
    deliveryFee: number
    discount: number
    total: number
  }
  
  savings: {
    vsMerkatoRetailer: {
      amount: number
      percentage: number
    }
    vsRegularStationaryMarket: {
      amount: number
      percentage: number
    }
  }
}
```

### Market Intelligence Structure:
```typescript
product: {
  name: string                // Brand name (e.g., "Sinar Line A4 Paper")
  
  current_pricing: {
    regularMarketPrice: number
    merkatoRetailerPrice: number
    platformDirectPrice: number    // Platform's price (NOT Merkato)
  }
  
  data: Array<{
    month: string              // "Jul-24", "Aug-25"
    regularMarket: number
    merkatoRetailer: number
    platformDirect: number     // Platform's price
  }>
}
```

### Procurement Calendar Structure:
```typescript
brand: {
  name: string                // Brand name (e.g., "Siner Line A4 Paper")
  
  biMonthlyData?: {
    yearlyMetrics: Array<{
      year: number            // 2026, 2025, etc.
      ethiopianYear: number   // 2017, 2016, etc.
      periods: Array<{
        period: string        // "Sept - Oct", "Nov - Dec", etc.
        average_price_etb: { min: number, max: number }
        weekly_increase_etb: { min: number, max: number }
        weekly_discount_etb: { min: number, max: number }
      }>
    }>
  }
  
  seasonalRecommendations?: {
    bestSeason: string
    secondBestSeason: string
    worstSeason: string
    guidance: string
  }
  
  adminRecommendation: string
}
```

---

## Redux Architecture

### Auth Slice:
```typescript
interface AuthState {
  user: {
    id: string
    email: string
    organizationName: string
    organizationType: string      // NEW
    phoneNumber: string           // NEW
    tinNumber: string             // NEW
    address: Address              // NEW - full address object
  } | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  rememberMe: boolean             // NEW
  loading: boolean
  error: string | null
}
```

### Dashboard Slice:
```typescript
interface DashboardState {
  overview: DashboardOverview | null
  loading: boolean
  lastFetched: number | null
}

// NO recentOrders field (frontend derives from activeOrders)
```

### Products Slice:
```typescript
interface ProductsState {
  list: Array<Product>            // Products with brands array
  searchResults: Array<Brand>     // Flattened brand search results
  loading: boolean
  lastFetched: number | null
}
```

### Baskets Slice:
```typescript
interface BasketsState {
  list: Array<Basket>             // All baskets
  loading: boolean
  lastFetched: number | null
}

// Selectors derive:
// - activeBaskets (filter by status)
// - completedBaskets (filter by status)
// - userActiveBaskets (filter by userParticipation)
```

### Orders Slice:
```typescript
interface OrdersState {
  history: Array<Order>           // Direct purchases
  basketHistory: Array<BasketOrder>  // Basket orders (separate)
  pagination: PaginationInfo
  basketPagination: PaginationInfo
  loading: boolean
  basketLoading: boolean
}
```

### Market Intelligence Slice:
```typescript
interface MarketIntelligenceState {
  products: Array<MarketProduct>
  lossAnalysis: CompanyLossAnalysis | null
  selectedProduct: string | null
  loading: boolean
  lastFetched: number | null
}
```

### Procurement Calendar Slice:
```typescript
interface ProcurementCalendarState {
  brands: Array<ProcurementBrand>  // Changed from products
  selectedBrand: string
  loading: boolean
  lastFetched: number | null
}
```

### Notifications Slice:
```typescript
interface NotificationsState {
  list: Array<Notification>
  unreadCount: number
  loading: boolean
  lastFetched: number | null
  pollInterval: number              // 30000 (30 seconds)
}
```

---

## Backend Calculations vs Frontend Calculations

### Backend Must Calculate:
✅ User's total savings (aggregate all orders vs Merkato prices)  
✅ Average discount rate (platform-wide)  
✅ Basket completion (min commitment reached)  
✅ Price comparisons (3 layers)  
✅ Stock availability  
✅ Order subtotals and totals  
✅ Delivery fees  
✅ Historical price aggregations  
✅ 500 companies loss analysis  
✅ Notification generation  
✅ Token expiration and refresh  

### Frontend Can Calculate:
✅ Display formatting (currency, dates)  
✅ Sorting and filtering cached data  
✅ Chart data transformations  
✅ Seasonal ranking (from bi-monthly data)  
✅ Percentage differences for display  
✅ Fill progress percentages  
✅ Multi-year averaging (for display)  

---

## Authentication & Authorization

### Token Strategy:
- **accessToken**: 15 minutes (always), stored in Redux (memory)
- **refreshToken**: 7 or 30 days (based on rememberMe), stored in httpOnly cookie (recommended) or localStorage
- **Rolling refresh**: New tokens issued on each refresh

### Auto-Login Flow:
```
1. App loads
2. Check for refreshToken in cookie/localStorage
3. If exists: Call POST /api/auth/refresh
   - Success: Get new accessToken → Auto-login → Dashboard
   - Failure: Clear tokens → Login page
4. If not exists: Login page
```

### Protected Routes:
```typescript
// Frontend route protection
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard/*" element={<DashboardLayout />} />
</Route>

// ProtectedRoute checks:
// 1. isAuthenticated (from Redux)
// 2. If not authenticated: redirect to /login
// 3. If authenticated: render children
```

### Backend Authorization:
```typescript
// All endpoints under /api require valid accessToken
// Except: /api/auth/login, /api/auth/register, /api/contact/submit

// Middleware checks:
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = await User.findById(decoded.userId)
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

## Real-Time Updates Strategy

### Decision: Use Polling for MVP ✅

**Rationale:**
- ✅ Simpler to implement (2-3x faster)
- ✅ Procurement workflows don't need instant notifications
- ✅ 30-second delay is acceptable
- ✅ Lower infrastructure complexity
- ✅ Easier to debug and monitor

**Implementation:**
```typescript
// Poll every 30 seconds when tab visible
setInterval(() => {
  if (document.visibilityState === 'visible') {
    dispatch(fetchNotifications())
  }
}, 30000)

// Also fetch on page focus
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    dispatch(fetchNotifications())
  }
})
```

**Future Enhancement: WebSocket (Phase 2/3)**
- Add WebSocket server alongside polling
- Connect on login, keep polling as fallback
- Migrate gradually with A/B testing

---

## Database Schema Requirements

### users table:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(100) NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  tin_number VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### addresses table:
```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  address_type VARCHAR(20) NOT NULL, -- 'autocomplete' or 'manual'
  address_formatted TEXT,
  street VARCHAR(255),
  sub_city VARCHAR(100),
  area VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Addis Ababa',
  region VARCHAR(100) DEFAULT 'Addis Ababa City Administration'
);
```

### refresh_tokens table:
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  remember_me BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### products table:
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50),
  in_stock BOOLEAN DEFAULT TRUE
  -- NO price, NO image_url at product level
);
```

### brands table:
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0
);
```

### baskets table:
```sql
CREATE TABLE baskets (
  id UUID PRIMARY KEY,
  basket_number VARCHAR(50) UNIQUE NOT NULL, -- BSK-YYYY/MM/DD-XXXXX
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', '6-month'
  status VARCHAR(20) NOT NULL, -- 'active', 'completed', 'cancelled'
  brand_id UUID REFERENCES brands(id), -- ONE brand per basket
  basket_price DECIMAL(10, 2) NOT NULL,
  merkato_retailer_price DECIMAL(10, 2) NOT NULL,
  regular_stationary_market_price DECIMAL(10, 2) NOT NULL,
  completed_savings_vs_merkato DECIMAL(10, 2),
  completed_savings_vs_regular_market DECIMAL(10, 2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  delivery_date TIMESTAMP,
  min_commitment DECIMAL(10, 2),
  max_commitment DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### basket_participants table:
```sql
CREATE TABLE basket_participants (
  id UUID PRIMARY KEY,
  basket_id UUID REFERENCES baskets(id),
  user_id UUID REFERENCES users(id),
  organization_name VARCHAR(255), -- Denormalized for display
  commitment DECIMAL(10, 2) NOT NULL,
  joined_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(basket_id, user_id)
);
```

### orders table:
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- ORD-YYYY/MM/DD-XXXXX
  -- NO type field, NO basket_type field
  status VARCHAR(20) NOT NULL, -- 'pending', 'accepted', 'out-for-delivery', 'delivered'
  delivery_address TEXT NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  savings_vs_merkato_amount DECIMAL(10, 2),
  savings_vs_merkato_percentage DECIMAL(5, 2),
  savings_vs_regular_market_amount DECIMAL(10, 2),
  savings_vs_regular_market_percentage DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP
);
```

### order_items table:
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  brand_id UUID REFERENCES brands(id),
  product_name VARCHAR(255),
  brand_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL -- quantity * price
);
```

### basket_orders table (NEW):
```sql
CREATE TABLE basket_orders (
  id UUID PRIMARY KEY,
  basket_id UUID REFERENCES baskets(id),
  user_id UUID REFERENCES users(id),
  basket_number VARCHAR(50) NOT NULL,
  completed_date TIMESTAMP,
  delivery_date TIMESTAMP,
  your_commitment DECIMAL(10, 2),
  your_quantity INTEGER,
  unit_price DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  savings_vs_merkato_amount DECIMAL(10, 2),
  savings_vs_merkato_percentage DECIMAL(5, 2),
  savings_vs_regular_market_amount DECIMAL(10, 2),
  savings_vs_regular_market_percentage DECIMAL(5, 2)
);
```

### market_intelligence table:
```sql
CREATE TABLE market_intelligence (
  id UUID PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50),
  current_regular_market_price DECIMAL(10, 2),
  current_merkato_retailer_price DECIMAL(10, 2),
  current_platform_direct_price DECIMAL(10, 2),
  monthly_data JSONB, -- 14 months of 3-layer pricing
  last_updated TIMESTAMP DEFAULT NOW()
);
```

### procurement_calendar table:
```sql
CREATE TABLE procurement_calendar (
  id UUID PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL,
  brand_amharic VARCHAR(255),
  category VARCHAR(100),
  has_historical_data BOOLEAN DEFAULT FALSE,
  bi_monthly_data JSONB, -- yearlyMetrics structure
  seasonal_recommendations JSONB,
  admin_recommendation TEXT,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

### notifications table:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'order_update', 'basket_closing', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- { orderId, basketId, actionUrl, etc. }
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
```

---

## Performance Optimization Recommendations

### Caching Strategy:
- **Products list**: Cache 1 hour (rarely changes)
- **Baskets list**: Cache 30 seconds (frequently updated)
- **Dashboard overview**: Cache 5 minutes
- **Market intelligence**: Cache 24 hours (daily admin updates)
- **Procurement calendar**: Cache 7 days (rarely changes)
- **Notifications**: No cache (real-time via polling)

### Database Indexes:
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- Orders
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Baskets
CREATE INDEX idx_baskets_status ON baskets(status);
CREATE INDEX idx_baskets_brand ON baskets(brand_id);
CREATE INDEX idx_basket_participants_user ON basket_participants(user_id);

-- Notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- Brands
CREATE INDEX idx_brands_product ON brands(product_id);
```

### API Response Times:
- Authentication endpoints: < 200ms
- Dashboard overview: < 500ms
- Products list: < 300ms
- Baskets list: < 400ms
- Order history (paginated): < 500ms
- Market intelligence: < 600ms
- Procurement calendar: < 400ms
- Notifications: < 200ms

---

## Next Steps

### ✅ Phase 1: Complete (Frontend + API Spec)
- [x] Frontend UI for all end-user pages
- [x] Redux architecture planned
- [x] API requirements documented
- [x] Mock data created for testing
- [x] All corrections consolidated

### 🔄 Phase 2: Super Admin Dashboard (Current)
1. Design admin capabilities (add products, manage baskets, fulfill orders)
2. Create admin UI mockups
3. Document admin endpoints
4. Map admin data requirements

### 📋 Phase 3: Database Design
1. Finalize all table schemas
2. Design relationships and indexes
3. Plan data migrations
4. Create ER diagrams

### 🚀 Phase 4: Backend Implementation
1. Set up Node.js/Express (or chosen framework)
2. Implement authentication (JWT)
3. Build all API endpoints (following this spec)
4. Add validation and error handling
5. Write tests

### 🔗 Phase 5: Integration
1. Replace mock data with real API calls
2. Test end-to-end flows
3. Handle edge cases
4. Performance optimization
5. Security audit

---

## Files to Reference

**API Requirements:** `BACKEND_API_REQUIREMENTS.md` (corrected)  
**Iteration 1 Summary:** `API_CORRECTIONS_ITERATION_1.md`  
**Iteration 2 Summary:** `API_CORRECTIONS_ITERATION_2.md` (to be created)  
**Iteration 3 Summary:** `API_CORRECTIONS_ITERATION_3.md`  
**Final Summary:** `API_CORRECTIONS_FINAL_SUMMARY.md` (this file)

**Frontend Code:** `src/pages/dashboard/*`, `src/components/*`  
**Mock Data:** `src/data/marketData.json`, `src/data/MI/bi-monthly_data.json`  
**Design System:** `DESIGN.md`

---

## Questions & Answers Reference

### Q: "Should we give one endpoint per page or base on functionality?"
**A:** Base on **functionality and resources**, not pages. One page can call multiple endpoints. One endpoint can be used by multiple pages.

### Q: "What should be put in Redux?"
**A:** Data that's fetched from backend AND used across multiple components/pages. Also: auth state, shared UI state. Don't put: local component state, derived data.

### Q: "How do we know to change Redux when backend changes?"
**A:** Four strategies:
1. Polling (every 30-60s)
2. WebSocket (backend pushes)
3. Manual refresh (user clicks)
4. After user action (create order → refetch)

### Q: "Should calculations be done manually by frontend or fetch from backend?"
**A:** Backend: business logic, aggregations, security-sensitive. Frontend: presentation, formatting, UI state.

### Q: "Should we build backend before or after super admin dashboard?"
**A:** After super admin dashboard! ✅ Your approach is correct:
1. End-user frontend (done)
2. Redux with mock data (next)
3. Super admin dashboard
4. Database design
5. Backend API

---

**Status:** ✅ All API Requirements Reviewed and Corrected  
**Ready for:** Super Admin Dashboard Design → Database Schema → Backend Implementation

---

**Created by:** Kiro AI Assistant  
**Completed:** 2026-08-06  
**Total Sections Reviewed:** 13 + Auth + Authorization  
**Total Iterations:** 3
