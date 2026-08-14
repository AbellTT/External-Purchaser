# Backend API Requirements for Babi Platform

**Created:** 2026-08-06  
**Purpose:** Complete mapping of frontend data needs, API endpoints, Redux structure, and data flow

---

## Table of Contents

1. [API Endpoints Overview](#api-endpoints-overview)
2. [Detailed Endpoint Specifications](#detailed-endpoint-specifications)
3. [Redux Architecture](#redux-architecture)
4. [Authentication Flow](#authentication-flow)
5. [Frontend vs Backend Calculations](#frontend-vs-backend-calculations)
6. [Real-time Updates & Notifications](#realtime-updates--notifications)
7. [Data Standardization](#data-standardization)

---

## API Endpoints Overview

### Endpoint Organization Philosophy

**Answer to your question:** Endpoints are organized by **resource and functionality**, not by page.

**Best Practice:**
- Group by resource: `/api/products`, `/api/baskets`, `/api/orders`
- One page may call multiple endpoints
- Multiple pages may use the same endpoint
- Think REST principles: resources + HTTP methods

### Complete Endpoint List

```
Authentication & User Management
├── POST   /api/auth/register
├── POST   /api/auth/login
├── POST   /api/auth/refresh
├── POST   /api/auth/logout
├── POST   /api/auth/forgot-password
├── POST   /api/auth/reset-password
└── GET    /api/auth/me

Landing Page
└── POST   /api/contact/submit

Dashboard Overview
├── GET    /api/dashboard/overview
└── GET    /api/dashboard/stats

Products & Inventory
├── GET    /api/products
├── GET    /api/products/:id
├── GET    /api/products/:id/brands
├── GET    /api/products/search
└── GET    /api/products/:productId/brands/:brandId/availability

Direct Purchase Orders
├── POST   /api/orders/direct-purchase
├── GET    /api/orders/:id
└── POST   /api/orders/:id/reorder

Basket System
├── GET    /api/baskets
├── GET    /api/baskets/:id
├── POST   /api/baskets/:id/join
├── PUT    /api/baskets/:id/update-commitment
└── DELETE /api/baskets/:id/leave

Order History
├── GET    /api/orders/history
└── GET    /api/orders/:id/details

Market Intelligence
├── GET    /api/market-intelligence/products
├── GET    /api/market-intelligence/products/:id/weekly
├── GET    /api/market-intelligence/products/:id/historical
└── GET    /api/market-intelligence/products/:id/comparison

Procurement Calendar
├── GET    /api/procurement-calendar/products
└── GET    /api/procurement-calendar/products/:id

Notifications
├── GET    /api/notifications
├── PUT    /api/notifications/:id/read
├── PUT    /api/notifications/mark-all-read
└── DELETE /api/notifications/:id
```

---

## Detailed Endpoint Specifications

### 1. Landing Page

#### Contact Form Submission
```typescript
POST /api/contact/submit

Request Body:
{
  email: string
  message: string
  name?: string  // optional
}

Response: 200 OK
{
  success: true
  message: "Thank you for contacting us. We'll respond within 24 hours."
}

Frontend Action:
- Display success message
- Clear form
- No Redux storage needed (one-time action)
```

**Status:** No changes required. Landing page API is correct.

---

### 2. Authentication & User Management

#### Register New User
```typescript
POST /api/auth/register

Request Body:
{
  // Step 1: Organization Details
  organizationName: string           // Organization name
  organizationType: string           // One of: "School" | "University" | "Government Office" | "NGO" | "Private Company" | "Bank & Financial Institution" | "Hospital & Health Centre"
  phoneNumber: string                // 10-digit phone number (e.g., "0911234567")
  tinNumber: string                  // 10-digit Tax Identification Number (e.g., "0012345678")
  
  // Step 2: Address Information
  addressType: "autocomplete" | "manual"
  
  // If addressType === "autocomplete":
  addressFormatted?: string          // Full formatted address from Geoapify
  
  // If addressType === "manual":
  street?: string                    // Street or Building name
  subCity?: string                   // Sub-city (Kifle Ketema)
  area?: string                      // Area / Sefer
  
  // Common address fields (both modes):
  city: string                       // Defaults to "Addis Ababa"
  region: string                     // Defaults to "Addis Ababa City Administration"
  
  // Step 3: Account Credentials
  email: string                      // Official organization email
  password: string                   // Minimum 8 characters
}

Response: 201 Created
{
  success: true
  message: "Account created successfully. Welcome to the platform!"
  data: {
    // Authentication tokens (same as login)
    accessToken: string              // JWT token (expires in 15 minutes)
    refreshToken: string             // Longer-lived (expires in 7 days)
    
    // User/Organization information
    user: {
      id: string
      email: string
      organizationName: string
      organizationType: string
      phoneNumber: string
      tinNumber: string
      address: {
        addressType: "autocomplete" | "manual"
        addressFormatted: string | null
        street: string | null
        subCity: string | null
        area: string | null
        city: string
        region: string
      }
    }
  }
}

Frontend Action:
- Store accessToken in Redux (memory)
- Store refreshToken in localStorage/httpOnly cookie
- Store user info in Redux
- Redirect to /dashboard (NO login page redirect)
- User is immediately authenticated after successful registration
```

**Important Notes:**
1. **Address Type Distinction:** The backend must track whether address came from autocomplete or manual entry
2. **Registration Flow:** `Register → Success → Dashboard` (user is auto-authenticated)
3. **Response Structure:** Must include same auth tokens as login endpoint for immediate authentication
4. **Validation Rules:**
   - phoneNumber: exactly 10 digits
   - tinNumber: exactly 10 digits
   - email: valid email format
   - password: minimum 8 characters
   - If addressType === "autocomplete", `addressFormatted` is required
   - If addressType === "manual", `street` and `subCity` are required


#### Login
```typescript
POST /api/auth/login

Request Body:
{
  email: string
  password: string
  rememberMe?: boolean               // Optional: for extended session
}

Response: 200 OK
{
  success: true
  data: {
    accessToken: string              // JWT token (expires in 15 minutes)
    refreshToken: string             // Longer-lived (expires in 7 days, or 30 days if rememberMe)
    user: {
      id: string
      email: string
      organizationName: string
      organizationType: string
      phoneNumber: string
      tinNumber: string
      address: {
        addressType: "autocomplete" | "manual"
        addressFormatted: string | null
        street: string | null
        subCity: string | null
        area: string | null
        city: string
        region: string
      }
    }
  }
}

Frontend Action:
- Store accessToken in Redux (memory only)
- Store refreshToken in localStorage OR httpOnly cookie
- Store complete user info in Redux (including address for direct purchase)
- Redirect to /dashboard
```

**Important Changes:**
1. **Removed `role` field** - System treats logged-in user as the organization itself
2. **Added complete address object** - Frontend needs this for direct purchase orders (no re-entering address)
3. **Added all organization details** - Frontend needs full profile information for display/editing
4. **Added `rememberMe` support** - Controls refresh token expiration (7 days vs 30 days)

**Backend Business Logic:**
- If `rememberMe === true`: refreshToken expires in 30 days
- If `rememberMe === false` or omitted: refreshToken expires in 7 days
- accessToken always expires in 15 minutes regardless of rememberMe

---

#### Refresh Token
```typescript
POST /api/auth/refresh

Request Body:
{
  refreshToken: string               // From localStorage or httpOnly cookie
}

Response: 200 OK
{
  success: true
  data: {
    accessToken: string              // New JWT token (expires in 15 minutes)
    refreshToken: string             // New refresh token (maintains original expiration type)
  }
}

Response: 401 Unauthorized (if refresh token invalid/expired)
{
  success: false
  error: "Refresh token expired or invalid"
}

Frontend Action:
- Called automatically when accessToken expires
- Update both accessToken and refreshToken in Redux/storage
- Retry failed request with new accessToken
- If refresh fails (401): Force logout → Clear Redux → Redirect to /login
```

**Refresh Token Implementation:**

**Token Storage Strategy (Recommended):**
```typescript
// Option 1: httpOnly Cookie (Most Secure) ✅ RECOMMENDED
// Backend sets cookie on login/register/refresh
res.cookie('refreshToken', token, {
  httpOnly: true,      // JavaScript can't access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
})

// Option 2: localStorage (Simpler, less secure)
localStorage.setItem('refreshToken', token)
```

**Auto-Refresh Flow:**
```
1. API request fails with 401 Unauthorized
2. Axios interceptor catches error
3. Call POST /api/auth/refresh with stored refreshToken
4. Success:
   - Update accessToken in Redux
   - Update refreshToken in storage
   - Retry original failed request with new token
5. Failure (401):
   - Clear all auth state
   - Redirect to /login
   - Show "Session expired, please login again"
```

**Token Expiration Rules:**
- **accessToken:** 15 minutes (always)
- **refreshToken:** 
  - Normal login: 7 days
  - Remember Me enabled: 30 days
- **Refresh operation:** Issues new accessToken AND new refreshToken (rolling refresh)

---

#### Forgot Password
```typescript
POST /api/auth/forgot-password

Request Body:
{
  email: string
}

Response: 200 OK
{
  success: true
  message: "Password reset link sent to your email"
}

Frontend Action:
- Show success message
- Don't reveal if email exists (security)
```

**Status:** No changes required. Forgot password API is correct.

---

#### Reset Password
```typescript
POST /api/auth/reset-password

Request Body:
{
  token: string      // from email link
  newPassword: string
}

Response: 200 OK
{
  success: true
  message: "Password reset successfully"
}

Frontend Action:
- Redirect to /login
- Show success message
```

**Status:** No changes required. Reset password API is correct.

---

### 3. Dashboard Overview Page

**Important:** This section has been significantly restructured based on requirements.

#### Get Dashboard Overview
```typescript
GET /api/dashboard/overview

Response: 200 OK
{
  success: true
  data: {
    // Total Savings Calculation
    totalSavings: {
      amount: number           // ETB saved compared to Merkato retailers
      percentage: number       // % savings
      trend: "up" | "down"
      comparedTo: "last_month"
    }
    
    // Active Orders (first 15 DIRECT PURCHASE orders for Overview display)
    activeOrders: {
      count: number
      totalValue: number
      orders: Array<{
        id: string
        orderNumber: string                    // Format: "ORD-2026/08/06-XXXXX"
        date: string
        status: "delivered" | "out-for-delivery" | "pending" | "accepted"
        type: "direct"                         // Direct purchase orders ONLY (no basket orders)
        total: number
        items: number
      }>
    }
    
    // Active Baskets (only baskets user has joined)
    basketParticipation: {
      activeBaskets: number                    // Count of baskets user participates in
      totalCommitted: number
      upcomingDeliveries: number
      baskets: Array<{
        id: string
        name: string
        type: "weekly" | "monthly" | "6-month"
        yourCommitment: number
        deliveryDate: string
        status: "active" | "closing_soon"
        fillProgress: {                        // NEW: Track basket fill amount
          current: number                      // Current total commitment
          target: number                       // Target/max commitment
          percentage: number                   // (current / target) * 100
        }
      }>
    }
    
    // Average Discount Rate
    avgDiscountRate: {
      yourAverage: number                      // User's achieved discount vs Merkato
      calculation: {
        directPurchaseSavings: number          // % saved via direct purchase
        basketSavings: number                  // % saved via baskets
        merkato_avg: number                    // Merkato retailer average price
      }
    }
    
    // Price Alerts (for products user has purchased before)
    priceAlerts: Array<{
      productId: string
      productName: string
      brandName: string                        // NEW: Specific brand
      priceChange: number                      // percentage
      direction: "up" | "down"
      currentPrice: number
      previousPrice: number
      userPurchaseHistory: {
        lastPurchased: string
        avgPrice: number
      }
    }>
  }
}
```

**Major Changes:**

1. **Total Savings Calculation**
   - Must compare against **Merkato retailer prices** (first layer of purchasing)
   - NOT against arbitrary platform prices
   - Backend aggregates all user's completed transactions
   - Formula: `Sum of (Merkato Price - Purchase Price) for all orders`

2. **Active Orders - Direct Purchases ONLY**
   - Contains **Direct Purchase orders ONLY** (Basket orders belong strictly to `basketParticipation` and the Basket History page).
   - Only these statuses: `"delivered"`, `"out-for-delivery"`, `"pending"`, `"accepted"`
   - Removed: `"processing"`, `"shipped"`, `"cancelled"`
   - Orders fetched here will be stored in Redux for reuse

3. **Removed `recentOrders` Field**
   - Frontend can derive recent orders from `activeOrders.orders`
   - No need for duplicate API data
   - Frontend sorting/filtering handles display

4. **Active Baskets - Only User's Baskets**
   - Show only baskets the user has **actually joined/committed to**
   - Not all available baskets
   - Added `fillProgress` to show basket fill amount

5. **Average Discount Restructured**
   - Removed `platform_avg` (too volatile as reference)
   - Compare against **Merkato retailers only**
   - Split into: direct purchase savings + basket savings
   - Both calculated vs Merkato, not platform price

**Backend Calculations Required:**
- ✅ Total savings: Aggregate (Merkato price - user's purchase price) across all orders
- ✅ Average discount: Calculate percentage savings vs Merkato for both direct purchases and baskets
- ✅ Basket fill progress: Track (current commitment / target commitment) * 100
- ✅ Price change detection: Track prices of products user has purchased

**Frontend Calculations:**
- ✅ Display formatting
- ✅ Sorting recent orders
- ✅ Filtering orders by status

**Redux Storage:**
```typescript
dashboardSlice: {
  overview: DashboardOverview | null
  loading: boolean
  lastFetched: number | null
  error: string | null
}

// Also update ordersSlice with fetched orders
ordersSlice: {
  recentOrders: Order[]  // First 15 from overview
  // ... other order data
}
```

---

### 4. Direct Purchase

#### Get Products List
```typescript
GET /api/products

Response: 200 OK
{
  success: true
  data: {
    products: Array<{
      id: string
      name: string
      category: string
      unit: string
      inStock: boolean             // Simple true/false only
      // NO imageUrl at product level
      // NO currentPrice at product level
      // NO stockLevel enum
      
      brands: Array<{
        id: string
        name: string
        imageUrl: string           // Image belongs to brand, not product
        inStock: boolean
        stockQuantity: number      // Exact quantity (for backend validation only)
        price: number              // Price belongs to brand
        // NO estimatedDelivery
      }>
    }>
  }
}
```

**Major Changes:**

1. **Removed Product-Level Fields:**
   - ❌ `imageUrl` (moved to brand level)
   - ❌ `currentPrice` (moved to brand level)
   - ❌ `stockLevel` enum (use simple `inStock: boolean`)

2. **Products → Brands Hierarchy**
   - Product contains array of brands
   - Each brand has its own: image, price, stock
   - Structure: `Product → Brands → Price/Image/Stock`

3. **Stock Information**
   - Frontend only sees: `inStock: true/false`
   - `stockQuantity` returned but for backend validation
   - Don't expose exact stock levels prominently in UI

4. **Removed `estimatedDelivery`**
   - Delivery estimates handled elsewhere
   - Not part of product listing

---

#### Search Products/Brands
```typescript
GET /api/products/search?q=hp

Response: 200 OK
{
  success: true
  data: {
    results: Array<{
      // NO type field (endpoint is brand search)
      productId: string
      productName: string
      productCategory: string
      brandId: string
      brandName: string
      brandImageUrl: string
      price: number
      inStock: boolean
    }>
  }
}
```

**Major Changes:**

1. **Removed `type` field**
   - Endpoint specifically searches brands
   - No need to tell frontend result is a brand
   - Simplified response structure

2. **Flattened Structure**
   - Direct brand results (not nested product/brand objects)
   - Easier for frontend to display search results

---

#### Create Direct Purchase Order
```typescript
POST /api/orders/direct-purchase

Request Body:
{
  items: Array<{
    productId: string
    brandId: string
    quantity: number
    price: number              // For validation only
  }>
  notes?: string               // Optional order notes
  // NO deliveryAddress field
}

Response: 201 Created
{
  success: true
  data: {
    orderId: string
    orderNumber: string        // Format: "ORD-2026/08/06-XXXXX"
    total: number
    status: "pending"
    // NO estimatedDelivery
  }
}

Frontend Action:
- Show success message
- Clear cart
- Update Redux orders state (add new order to activeOrders)
- Update Redux dashboard state (increment active order count)
- Redirect to order confirmation or order history
```

**Major Changes:**

1. **Removed `deliveryAddress` from Request**
   - Address collected during registration
   - Stored in Redux after login
   - Backend uses authenticated user's address
   - No re-entering address every time

2. **Frontend Uses Stored Address**
   - Address from login response stored in Redux
   - Direct purchase uses that address automatically
   - User can edit address in Profile page (new requirement)

3. **Order Number Format**
   - Must be: `"ORD-YEAR/MONTH/DATE-UNIQUE_ID"`
   - Example: `"ORD-2026/08/06-A7B2C"`

4. **Redux Updates After Creation**
   - New order immediately added to Redux ordersSlice
   - Dashboard activeOrders count incremented
   - No manual page refresh needed

5. **Removed `estimatedDelivery` from Response**
   - Delivery tracking handled separately
   - Not needed in creation response

---

#### NEW REQUIREMENT: Profile Edit Page

**New Page:** `/dashboard/profile` or `/dashboard/settings`

**Purpose:** Allow users to edit their organization profile

**Editable Fields (based on registration data):**
- Organization Name
- Organization Type
- Phone Number
- TIN Number (view-only or editable with verification)
- Email (with email verification if changed)
- Password (separate change password flow)
- Address (all address fields)

**API Endpoints Needed:**

```typescript
// Get current profile
GET /api/user/profile

Response: 200 OK
{
  success: true
  data: {
    id: string
    email: string
    organizationName: string
    organizationType: string
    phoneNumber: string
    tinNumber: string
    address: {
      addressType: "autocomplete" | "manual"
      addressFormatted: string | null
      street: string | null
      subCity: string | null
      area: string | null
      city: string
      region: string
    }
  }
}

// Update profile
PUT /api/user/profile

Request Body:
{
  organizationName?: string
  organizationType?: string
  phoneNumber?: string
  // email?: string  // Separate endpoint with verification
  address?: {
    addressType: "autocomplete" | "manual"
    addressFormatted?: string
    street?: string
    subCity?: string
    area?: string
    city?: string
    region?: string
  }
}

Response: 200 OK
{
  success: true
  data: {
    // Updated user object (same as GET /api/user/profile)
  }
}

Frontend Action:
- Update Redux auth.user with new data
- Show success message
- Address changes apply to future direct purchases
```

**UI Design:** Must follow `DESIGN.md` styling system

---

**Redux Storage:**
```typescript
productsSlice: {
  list: Array<Product>           // All products with brands
  loading: boolean
  searchResults: Array<Brand>    // Flattened brand results
  lastFetched: number | null
}

// Cache strategy: Fetch once per session, refresh on explicit user action
```

**Frontend Validation:**
- ✅ Check `inStock` before allowing add to cart
- ✅ Validate quantity > 0
- ✅ Show "out of stock" if `inStock === false`

**Backend Validation:**
- ✅ Re-check stock availability at order time
- ✅ Validate prices haven't changed significantly
- ✅ Atomic stock deduction (prevent overselling)
- ✅ Validate user's address exists (from registration)

---

### 5. Basket System

**CRITICAL BUSINESS RULE:** One basket contains **ONE brand** only (not multiple products).

#### Get All Baskets
```typescript
GET /api/baskets

Response: 200 OK
{
  success: true
  data: {
    activeBaskets: Array<BasketObject>,   // Baskets the user has joined (status = "active", isParticipating = true)
    openBaskets: Array<BasketObject>,     // Baskets open for joining (status = "active", isParticipating = false)
    completedBaskets: Array<BasketObject> // Completed baskets (status = "completed")
  }
}

// Where BasketObject is:
// {
//   id: string
//   basketNumber: string                   // Format: "BSK-2026/08/06-XXXXX"
//   name: string                           // e.g., "HP A4 Paper Weekly Basket"
//   type: "weekly" | "monthly" | "6-month"
//   status: "active" | "completed" | "cancelled"
//   
//   brand: {
//     brandId: string
//     brandName: string
//     productId: string
//     productName: string
//     productUnit: string
//     brandImageUrl: string
//   }
//   
//   pricing: {
//     basketPrice: number                  // Platform's basket price
//     merkato_retailer_price: number       // Merkato retail price
//     regular_stationary_market_price: number  // Regular market price
//   }
//   
//   timeline: {
//     startDate: string
//     endDate: string
//     deliveryDate: string
//     daysRemaining: number
//   }
//   
//   participation: {
//     participants: Array<{              // Show actual participant names
//       organizationName: string
//       commitment: number
//       joinedDate: string
//     }>
//     totalParticipants: number
//     totalCommitment: number
//     currentCommitment: number          // Sum of all commitments
//     minCommitment: number
//     maxCommitment: number
//   }
//   
//   userParticipation: {
//     isParticipating: boolean
//     commitment: number | null
//     joinedDate: string | null
//   }
//   
//   completedSavings?: {
//     vsMerkatoRetailer: number
//     vsRegularStationaryMarket: number
//   }
// }
```

**Major Changes:**

1. **Separated Arrays by Participation & Status**
   - The response now explicitly splits baskets into `activeBaskets` (joined), `openBaskets` (not joined), and `completedBaskets`.
   - This matches the new 3-tab layout in the Basket System page and makes frontend handling simpler.

1. **One Basket = One Brand**
   - Changed from `products: Array<...>` to single `brand: {...}`
   - Each basket focuses on ONE specific brand only
   - Frontend displays brand name and image prominently

2. **Basket Number Format**
   - Added `basketNumber` field
   - Format: `"BSK-YEAR/MONTH/DATE-UNIQUE_ID"`
   - Example: `"BSK-2026/08/06-X7Y9A"`

3. **Removed `targetPrice`**
   - No longer showing "target price to reach"
   - Show actual comparison: `basketPrice` vs `merkato_retailer_price` vs `regular_stationary_market_price`

4. **Three Price Comparison Fields**
   - `basketPrice`: Platform's offered price for this basket
   - `merkato_retailer_price`: First layer purchasing (Merkato retailers)
   - `regular_stationary_market_price`: Regular stationary market price
   - Frontend displays all 3 for comparison

5. **Savings Only When Complete**
   - `completedSavings` field only exists when `status === "completed"`
   - Shows two savings comparisons:
     - `vsMerkatoRetailer`: How much saved vs Merkato
     - `vsRegularStationaryMarket`: How much saved vs regular market
   - Active baskets don't show estimated savings

6. **Show Participant Names (Not Just Count)**
   - Changed `totalParticipants: number` to `participants: Array<...>`
   - Show organization names and their commitments
   - Frontend displays participant list in basket details

---

#### Join Basket
```typescript
POST /api/baskets/:basketId/join

Request Body:
{
  commitment: number  // ETB amount
}

Response: 200 OK
{
  success: true
  data: {
    basketId: string
    basketNumber: string
    yourCommitment: number
    updatedBasket: {
      // Complete updated basket object
      // Same structure as GET /api/baskets response
    }
  }
}

Frontend Action:
- Update Redux basketsSlice with updatedBasket
- Show success message
- No need to refetch all baskets
```

**Redux Update After Join:**
- Response includes complete updated basket
- Frontend replaces old basket in Redux with updated one
- Immediate UI update without refetch

---

#### Update Commitment
```typescript
PUT /api/baskets/:basketId/update-commitment

Request Body:
{
  newCommitment: number
}

Response: 200 OK
{
  success: true
  data: {
    basketId: string
    yourCommitment: number
    updatedBasket: {
      // Complete updated basket object
      // Same structure as GET /api/baskets response
    }
  }
}

Frontend Action:
- Update Redux basketsSlice with updatedBasket
- Show success message
```

**Redux Update After Update:**
- Same pattern as join
- Frontend gets complete updated basket
- Immediate UI update

---

#### Leave Basket
```typescript
DELETE /api/baskets/:basketId/leave

Response: 200 OK
{
  success: true
  message: "You have left the basket successfully"
  data: {
    basketId: string
    updatedBasket: {
      // Complete updated basket object with user removed
      // Same structure as GET /api/baskets response
    }
  }
}

Frontend Action:
- Update Redux basketsSlice with updatedBasket
- userParticipation.isParticipating will be false
- Show success message
```

**Redux Update After Leave:**
- Basket still visible in list (user can see other baskets)
- User's participation fields cleared
- Immediate UI update

---

**Redux Storage:**
```typescript
basketsSlice: {
  list: Array<Basket>
  activeBaskets: Array<Basket>    // Derived selector: filter by status === 'active'
  completedBaskets: Array<Basket> // Derived selector: filter by status === 'completed'
  userActiveBaskets: Array<Basket> // Derived selector: filter by userParticipation.isParticipating === true
  loading: boolean
  lastFetched: number | null
}

// After join/update/leave: Frontend replaces specific basket in list
// No full refetch needed - optimistic UI updates
```

**Frontend Calculations:**
- ✅ Filter active vs completed (status field)
- ✅ Calculate fill progress: (currentCommitment / maxCommitment) * 100
- ✅ Sort by date or savings
- ✅ Display all 3 price comparisons

**Backend Calculations:**
- ✅ Track 3 prices: basketPrice, merkato_retailer_price, regular_stationary_market_price
- ✅ Calculate savings when basket completes (compare basket price vs both references)
- ✅ Aggregate participation stats
- ✅ Determine if basket can close (min commitment reached)
- ✅ Return complete participant list with organization names


---

### 6. Order History

**IMPORTANT:** Order History is **completely separate** from Basket History.

#### Get Order History (Direct Purchases ONLY)
```typescript
GET /api/orders/history?page=1&limit=20&status=all

Query Params:
- page: number (pagination)
- limit: number (items per page)
- status: "all" | "pending" | "accepted" | "out-for-delivery" | "delivered" | "cancelled"
// ❌ NO "type" filter (this endpoint is direct purchases only)

Response: 200 OK
{
  success: true
  data: {
    orders: Array<{
      id: string
      orderNumber: string                    // Format: "ORD-2026/08/06-XXXXX"
      // ❌ NO type field
      // ❌ NO basketType field
      date: string
      status: "pending" | "accepted" | "out-for-delivery" | "delivered" | "cancelled"
      
      items: Array<{
        productName: string
        brandName: string
        quantity: number
        unit: string
        price: number
        subtotal: number                     // quantity * price (moved into items array)
      }>
      
      pricing: {
        itemsTotal: number                   // Sum of all item subtotals
        deliveryFee: number
        discount: number
        total: number
      }
      
      delivery: {
        address: string
        estimatedDate: string
        actualDate: string | null
      }
      
      // Savings structure (2 comparisons)
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
    }>
    pagination: {
      currentPage: number
      totalPages: number
      totalOrders: number
      hasMore: boolean
    }
  }
}
```

#### Cancel Pending Order
```typescript
POST /api/orders/:id/cancel

Response: 200 OK
{
  success: true,
  data: {
    id: string,
    orderNumber: string,
    status: "cancelled",
    // ... rest of order object
  }
}
```

**Major Changes:**

1. **Separate from Basket History**
   - This endpoint returns **direct purchase orders ONLY**
   - No `type: "direct" | "basket"` field
   - Basket history is on a completely different page with different API

2. **Removed `basketType` field**
   - Not applicable to direct purchases
   - Only baskets have types (weekly/monthly/6-month)

3. **Status Values**
   - `"pending"`: Order placed, awaiting acceptance (can be cancelled by user)
   - `"accepted"`: Order accepted, preparing
   - `"out-for-delivery"`: Order is being delivered
   - `"delivered"`: Order completed
   - `"cancelled"`: Order cancelled by user or admin

4. **`subtotal` Moved Into Items Array**
   - Each item has its own `subtotal: quantity * price`
   - `pricing.itemsTotal` = sum of all item subtotals
   - Better for displaying itemized receipts

5. **Savings Structure (Two Comparisons)**
   - `vsMerkatoRetailer`: Compare against Merkato retail prices
   - `vsRegularStationaryMarket`: Compare against regular market prices
   - Both show amount (ETB) and percentage (%)

---

#### Get Basket History (Separate Endpoint)
```typescript
GET /api/baskets/history?page=1&limit=20&status=all

Query Params:
- page: number (pagination)
- limit: number (items per page)
- status: "all" | "completed" | "cancelled"

Response: 200 OK
{
  success: true
  data: {
    baskets: Array<{
      id: string
      basketNumber: string                   // Format: "BSK-2026/08/06-XXXXX"
      name: string
      type: "weekly" | "monthly" | "6-month"
      status: "completed" | "cancelled"
      
      brand: {
        brandId: string
        brandName: string
        productId: string
        productName: string
        brandImageUrl: string
      }
      
      yourOrder: {
        quantity: number
        unitPrice: number
        subtotal: number
      }
      
      completedDate: string
      deliveryDate: string
      
      pricing: {
        basketPrice: number
        merkato_retailer_price: number
        regular_stationary_market_price: number
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
    }>
    pagination: {
      currentPage: number
      totalPages: number
      totalBaskets: number
      hasMore: boolean
    }
  }
}
```

**Why Separate?**
- Direct purchases and basket orders are fundamentally different
- Different data structures
- Different business logic
- Different UI pages
- Easier for backend to implement
- Clearer API contracts

---

#### Reorder (Direct Purchase)
```typescript
POST /api/orders/:orderId/reorder

Response: 201 Created
{
  success: true
  data: {
    newOrderId: string
    orderNumber: string              // Format: "ORD-2026/08/06-XXXXX"
    itemsUnavailable: Array<{
      productName: string
      brandName: string
      reason: "out_of_stock" | "discontinued"
    }>
    total: number
  }
}

Frontend Action:
- If itemsUnavailable.length > 0:
  - Show warning dialog listing unavailable items
  - Ask user to confirm or edit order
- Update Redux ordersSlice (add new order to activeOrders)
- Show success message
- Redirect to order confirmation or direct purchase page
```

**Redux Update After Reorder:**
- New order added to ordersSlice
- Dashboard activeOrders count incremented
- Immediate UI update

---

**Redux Storage:**
```typescript
ordersSlice: {
  history: Array<Order>                    // Direct purchase orders
  basketHistory: Array<BasketOrder>        // Basket orders (separate)
  pagination: { page, totalPages, hasMore }
  basketPagination: { page, totalPages, hasMore }
  loading: boolean
  basketLoading: boolean
  filters: { status }                      // UI filters
}

// Infinite scroll: Append to history array on page load
// Separate arrays for orders vs baskets
```

**Frontend Calculations:**
- ✅ Filter by status (client-side or server-side)
- ✅ Format dates (e.g., "2 days ago")
- ✅ Calculate display totals (already have from backend)
- ✅ Sort by date

**Backend Calculations:**
- ✅ Calculate savings vs Merkato retailer AND regular market
- ✅ Calculate item subtotals (quantity * price)
- ✅ Aggregate order totals (items + delivery + discount)
- ✅ Track delivery status
- ✅ Validate reorder availability

---

### 7. Market Intelligence

**IMPORTANT DATA STRUCTURE:** Based on `frontend/src/data/marketData.json`

#### Get Market Intelligence Products
```typescript
GET /api/market-intelligence/products

Response: 200 OK
{
  success: true
  data: {
    products: Array<{
      id: string
      name: string              // Brand name (e.g., "Sinar Line A4 Paper", "05A HP Toner Ink")
      unit: string
      category: string
      
      // Current pricing (3 layers)
      current_pricing: {
        regularMarketPrice: number           // Regular stationary market
        merkatoRetailerPrice: number         // Merkato retailers (first layer)
        platformDirectPrice: number          // Platform's current price (NOT Merkato)
      }
      
      // Monthly historical data (14 months - Jul 2024 to Aug 2025)
      data: Array<{
        month: string                        // Format: "Jul-24", "Aug-25"
        regularMarket: number
        merkatoRetailer: number
        platformDirect: number               // Platform's own prices (NOT Merkato)
      }>
    }>
  }
}
```

**Major Changes:**

1. **Brand-Based, Not Generic Products**
   - Each entry is a specific brand (e.g., "Sinar Line A4 Paper", not just "A4 Paper")
   - `name` field contains brand + product name
   - Matches the actual market data structure

2. **Three Price Layers (NOT Two)**
   - `regularMarketPrice`: Regular stationary market price
   - `merkatoRetailerPrice`: Merkato retailers (first layer purchasing)
   - `platformDirectPrice`: **Platform's own direct purchase price** (NOT Merkato)
   - CRITICAL: Platform price is the platform's offered price, not Merkato price

3. **Monthly Data Structure**
   - 14 months of historical data (not weekly)
   - Each month has all 3 price points
   - Month format: "Jul-24", "Aug-25"
   - Arrays have exactly 14 entries

4. **No Separate Weekly History**
   - Frontend will display monthly data only
   - No `weeklyHistory` field
   - Simplified structure matching actual JSON data

5. **No Historical Field for Some Products**
   - ALL products in this endpoint have the same data structure
   - If a product doesn't have 2-year data, it won't be in this endpoint
   - Separate endpoint for products without historical data (admin recommendations only)

---

#### Get 500 Companies Loss Analysis
```typescript
GET /api/market-intelligence/500-companies-loss

Response: 200 OK
{
  success: true
  data: {
    overview: {
      totalCompanies: 500
      companiesAnalyzed: 500
      totalLoss: number                      // ETB lost due to bad sales timing
      avgLossPerCompany: number
      analysisYear: string                   // e.g., "2025"
    }
    
    topLosses: Array<{
      companyName: string
      industry: string
      totalPurchaseValue: number
      potentialLoss: number
      lossPercentage: number
      badProcurementMonths: Array<string>    // Months they bought at peak prices
      bestAlternativeMonths: Array<string>   // When they should have bought
    }>
    
    byProduct: Array<{
      productName: string
      brandName: string
      companiesAffected: number
      totalLoss: number
      peakMonth: string                      // Worst month to buy
      optimalMonth: string                   // Best month to buy
    }>
    
    methodology: string                      // Explain calculation method
  }
}
```

**Purpose:** Powers the "500 Companies Loss Analysis" page mentioned in user requirements

**Data Source:** Uses `frontend/src/data/500_companies_badSalesAndLoss.json` (to be created)

**Calculations:**
- Compare when companies actually purchased vs optimal procurement periods
- Calculate potential savings if they used procurement calendar
- Show which products caused most losses
- Industry-specific analysis

---

**Redux Storage:**
```typescript
marketIntelligenceSlice: {
  products: Array<MarketProduct>             // Main 4 products with full historical data
  lossAnalysis: CompanyLossAnalysis | null   // 500 companies loss data
  selectedProduct: string | null
  loading: boolean
  lastFetched: number | null
}

// Cache: Refresh daily (market data updated daily by admin)
```

**Frontend Calculations:**
- ✅ Chart rendering (monthly trend lines for 3 price layers)
- ✅ Calculate price variance over time
- ✅ Calculate percentage differences between layers
- ✅ Identify highest/lowest price months
- ✅ Format currency and percentages

**Backend Calculations:**
- ✅ Aggregate monthly prices from transactions
- ✅ Track all 3 price layers (regular market, Merkato, platform)
- ✅ Calculate 500 companies loss analysis
- ✅ Identify procurement timing inefficiencies
- ✅ Generate recommendations based on historical patterns

**Frontend Display:**
```typescript
// Market Intelligence Card Structure

For each product:
1. Header: Brand name + current prices (3 prices side-by-side)
2. Chart: Line chart with 3 lines (14 months)
   - regularMarket (red line)
   - merkatoRetailer (orange line)
   - platformDirect (green line)
3. Stats: 
   - Highest price month
   - Lowest price month
   - Average price
   - Current trend (up/down)
```

---

### 8. Procurement Calendar

**IMPORTANT:** Returns **brands** (not generic products). Based on `frontend/src/data/MI/bi-monthly_data.json` structure.

#### Get Procurement Calendar Data
```typescript
GET /api/procurement-calendar/brands

Response: 200 OK
{
  success: true
  data: {
    brands: Array<{
      id: string
      name: string                           // Brand name (e.g., "Siner Line A4 Paper", "OSA HP Toner")
      name_amharic: string                   // Amharic name
      productCategory: string                // Category (paper, ink, etc.)
      hasHistoricalData: boolean             // Does this brand have bi-monthly data?
      
      // FOR BRANDS WITH BI-MONTHLY DATA (4 main brands)
      biMonthlyData?: {
        yearlyMetrics: Array<{
          year: number                       // Gregorian year (2026, 2025, etc.)
          ethiopianYear: number              // Ethiopian year (2017, 2016, etc.)
          periods: Array<{
            period: string                   // "Sept - Oct", "Nov - Dec", etc.
            average_price_etb: {
              min: number
              max: number
            }
            weekly_increase_etb: {
              min: number
              max: number
            }
            weekly_discount_etb: {
              min: number
              max: number
            }
          }>
        }>
        sourceReference?: string             // Optional PDF/document reference
      }
      
      // FOR BRANDS WITHOUT HISTORICAL DATA (admin recommendations)
      seasonalRecommendations?: {
        bestSeason: string                   // "May - Jun"
        secondBestSeason: string             // "Sept - Oct"
        worstSeason: string                  // "Jan - Feb"
        guidance: string                     // Detailed admin guidance
      }
      
      // ADMIN RECOMMENDATION (for ALL brands)
      adminRecommendation: string            // Platform's procurement advice
    }>
  }
}
```

**Major Changes:**

1. **Returns Brands, Not Products**
   - Endpoint returns specific brands (e.g., "Siner Line A4 Paper", not "A4 Paper")
   - Each brand has its own historical patterns
   - Matches actual procurement calendar UI

2. **Bi-Monthly Data Structure**
   - 6 periods per year: Sept-Oct, Nov-Dec, Jan-Feb, Mar-Apr, May-Jun, Jul-Aug
   - Each period has:
     - `average_price_etb`: {min, max} range
     - `weekly_increase_etb`: {min, max} typical rise
     - `weekly_discount_etb`: {min, max} typical drop
   - Matches actual `bi-monthly_data.json` structure

3. **Multi-Year Support**
   - `yearlyMetrics` array can contain multiple years (2026, 2025, 2024, etc.)
   - Frontend displays all years side-by-side for comparison
   - Currently showing 2026 data, but structure supports adding more years

4. **Summary Ranking Done By Frontend**
   - Backend sends raw bi-monthly data
   - Frontend calculates:
     - Best season (lowest avg price + stability)
     - 2nd best season
     - Worst season (highest avg price or volatility)
     - Percentage difference between periods
   - Frontend shows comparative labels ("Top Ranked", "Moderate", "Avoid Period")

5. **Two Types of Brands:**
   - **WITH biMonthlyData**: Show complete historical analysis (4 main brands)
   - **WITHOUT biMonthlyData**: Show only seasonal recommendations (admin-configured)

6. **Comparative Summary Position**
   - Frontend displays summary **ABOVE** historical data cards
   - Summary compares average across all bi-monthly periods
   - Uses percentage differences and trend analysis
   - No concrete prices in summary (just relative rankings)

---

**Redux Storage:**
```typescript
procurementCalendarSlice: {
  brands: Array<ProcurementBrand>
  selectedBrand: string                      // Currently selected brand name
  loading: boolean
  lastFetched: number | null
}

// Cache: 7 days (seasonal data rarely changes)
```

**Frontend Calculations:**
```typescript
// 1. Rank seasons by score
const seasonScores = periods.map(p => ({
  period: p.period,
  avgPrice: (p.average_price_etb.min + p.average_price_etb.max) / 2,
  volatility: p.weekly_increase_etb.max + p.weekly_discount_etb.max,
  score: (1 - avgPrice/highestPrice) * 0.7 + (1 - volatility/maxVolatility) * 0.3
})).sort((a, b) => b.score - a.score)

// 2. Calculate savings potential
const savingsPotential = ((highest.avgPrice - lowest.avgPrice) / highest.avgPrice * 100)

// 3. Display comparative labels
if (isBestSeason) {
  label = `#1 Best Season — ~${savingsPotential}% lower than worst period`
} else if (isSecondBest) {
  label = `#2 Strong Alternative — Multi-year trends show favorable pricing`
} else if (isWorst) {
  label = `⚠️ Avoid Period — ~${savingsPotential}% higher than best period`
} else {
  label = `📅 Moderate Procurement Period — Better opportunities exist in ${bestSeason}`
}
```

**Backend Calculations:**
- ✅ Aggregate bi-monthly price ranges from historical transactions
- ✅ Track weekly volatility (increase/discount patterns)
- ✅ Store admin-configured seasonal recommendations for brands without data
- ✅ Return multi-year data when available
- ✅ Include both Gregorian and Ethiopian calendar years

**UI Display Pattern:**
```
1. Seasonal Buying Guide Card (Top 3 Ranked)
   - #1 Best Season (green)
   - #2 Second Best (blue)
   - ⚠️ Avoid Period (red)
   - Historical Trend Summary
   - Platform Recommendation

2. Bi-Monthly Period Cards (6 cards)
   Each card shows:
   - Period name + ranking badge
   - Comparative summary (based on multi-year vs other periods)
   - Historical Data by Year:
     * Year 2026 (Ethiopian 2017)
       - 2026 Avg Price: ~ETB XXX
       - Price Variance: ETB XX
       - Typical Weekly Rise: ~ETB XX
       - Typical Weekly Drop: ~ETB XX
     * Year 2025 (if available)
     * Placeholder for future years
```

**For Brands WITHOUT Historical Data:**
- Show only Seasonal Buying Guide card
- No bi-monthly period cards
- Display admin recommendations prominently
- Guidance field contains detailed procurement advice


---

### 9. Notifications

#### Get Notifications
```typescript
GET /api/notifications?unreadOnly=false

Query Params:
- unreadOnly: boolean (default: false)

Response: 200 OK
{
  success: true
  data: {
    notifications: Array<{
      id: string
      type: "order_update" | "basket_closing" | "price_alert" | "delivery" | "system"
      title: string
      message: string
      read: boolean
      createdAt: string                      // ISO 8601 format
      metadata: {
        orderId?: string
        basketId?: string
        productId?: string
        brandId?: string
        actionUrl?: string                   // Where to navigate on click
      }
    }>
    unreadCount: number
  }
}
```

---

#### Mark Notification as Read
```typescript
PUT /api/notifications/:id/read

Response: 200 OK
{
  success: true
  data: {
    notificationId: string
    read: true
  }
}

Frontend Action:
- Update Redux notificationsSlice (mark specific notification as read)
- Decrement unreadCount
- No full refetch needed
```

---

#### Mark All as Read
```typescript
PUT /api/notifications/mark-all-read

Response: 200 OK
{
  success: true
  data: {
    markedCount: number                      // Number of notifications marked
  }
}

Frontend Action:
- Update Redux notificationsSlice (set all notifications read: true)
- Set unreadCount to 0
- No full refetch needed
```

---

### Real-Time Updates Strategy Decision

**Option 1: Polling (RECOMMENDED for MVP) ✅**

**Justification:**
- ✅ Simpler to implement (both frontend and backend)
- ✅ Works reliably across all network conditions
- ✅ No persistent connection overhead
- ✅ Easier debugging and monitoring
- ✅ Sufficient for organization procurement use case (not real-time chat)
- ✅ 30-60 second delay is acceptable for notifications

**Implementation:**
```typescript
// Poll every 30 seconds when user is active
useEffect(() => {
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      dispatch(fetchNotifications())
    }
  }, 30000)  // 30 seconds
  
  return () => clearInterval(interval)
}, [dispatch])

// Also fetch on page focus (user switches back to tab)
useEffect(() => {
  const handleFocus = () => {
    if (document.visibilityState === 'visible') {
      dispatch(fetchNotifications())
    }
  }
  
  document.addEventListener('visibilitychange', handleFocus)
  return () => document.removeEventListener('visibilitychange', handleFocus)
}, [dispatch])
```

**Backend Requirements:**
- Standard REST endpoint (already defined above)
- No special infrastructure needed
- Simple to scale horizontally

---

**Option 2: WebSocket (Future Enhancement)**

**When to Consider:**
- Phase 2/3 after MVP is validated
- If users demand instant notifications
- If adding real-time features (live basket participation tracking, live price updates)
- If notification volume justifies persistent connections

**Implementation Would Include:**
```typescript
// Connect to WebSocket on login
const ws = new WebSocket('wss://api.babi.com/notifications')

ws.onopen = () => {
  console.log('WebSocket connected')
  dispatch(setWebSocketConnected(true))
}

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  dispatch(addNotification(notification))
  
  // Browser notification API
  if (Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.svg'
    })
  }
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
  dispatch(setWebSocketConnected(false))
  // Fall back to polling
}

ws.onclose = () => {
  dispatch(setWebSocketConnected(false))
  // Attempt reconnection with exponential backoff
}
```

**Backend Requirements:**
- WebSocket server (Socket.io or native WebSocket)
- Connection management (authentication, heartbeat, reconnection)
- Message queue for offline users
- Load balancer with sticky sessions
- More complex infrastructure

---

### Browser Notification Permission

**Request Strategy:**
```typescript
// Request on first login or in settings page
async function requestNotificationPermission() {
  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission()
    
    if (permission === "granted") {
      // Save preference to backend
      await api.post('/api/user/preferences', {
        browserNotifications: true
      })
      
      // Show success message
      console.log('Browser notifications enabled')
    } else {
      console.log('Browser notifications denied')
    }
  }
}

// Check current permission status
const hasNotificationPermission = Notification.permission === "granted"
```

**When to Show Browser Notifications:**
```typescript
// Only show if:
// 1. User granted permission
// 2. Tab is not focused (user is away)
// 3. Notification is high priority

if (
  Notification.permission === "granted" &&
  document.visibilityState === 'hidden' &&
  notification.type in ['order_update', 'delivery', 'basket_closing']
) {
  new Notification(notification.title, {
    body: notification.message,
    icon: '/favicon.svg',
    badge: '/badge-icon.png',
    tag: notification.id,  // Prevent duplicate notifications
    requireInteraction: notification.type === 'delivery'  // Requires user action for deliveries
  })
}
```

---

**Redux Storage:**
```typescript
notificationsSlice: {
  list: Array<Notification>
  unreadCount: number
  loading: boolean
  lastFetched: number | null
  wsConnected: boolean                       // For future WebSocket implementation
  pollInterval: number                       // 30000 (30 seconds)
}

// Update strategy:
// - MVP: Polling every 30s + on page focus
// - Future: WebSocket for real-time push
```

---

**Notification Types & Use Cases:**

1. **order_update**
   - Order status changed (pending → accepted → out-for-delivery → delivered)
   - actionUrl: `/dashboard/orders?orderId=XXX`

2. **basket_closing**
   - Basket you joined is closing soon (e.g., 24 hours left)
   - actionUrl: `/dashboard/baskets?basketId=XXX`

3. **price_alert**
   - Price drop on product you previously purchased
   - actionUrl: `/dashboard/direct-purchase?productId=XXX`

4. **delivery**
   - Your order is out for delivery or has been delivered
   - actionUrl: `/dashboard/orders?orderId=XXX`

5. **system**
   - Platform announcements, maintenance notices
   - actionUrl: `/dashboard` or null

---

**Backend Notification Triggers:**

```typescript
// Example: When admin changes order status
async function updateOrderStatus(orderId: string, newStatus: string) {
  // Update order in database
  await db.orders.update({ id: orderId }, { status: newStatus })
  
  // Get order details
  const order = await db.orders.findOne({ id: orderId })
  
  // Create notification
  await db.notifications.create({
    userId: order.userId,
    type: 'order_update',
    title: `Order ${order.orderNumber} ${newStatus}`,
    message: `Your order has been ${newStatus}`,
    read: false,
    createdAt: new Date(),
    metadata: {
      orderId: order.id,
      actionUrl: `/dashboard/orders?orderId=${order.id}`
    }
  })
  
  // If WebSocket connected, send immediately
  if (wsConnections[order.userId]) {
    wsConnections[order.userId].send(JSON.stringify(notification))
  }
  
  // Otherwise, user will receive via polling
}
```

---

**Performance Considerations:**

**Polling Strategy:**
- ✅ Poll every 30 seconds (not too frequent)
- ✅ Stop polling when tab is not visible (save bandwidth)
- ✅ Fetch only unread notifications initially, then all on demand
- ✅ Implement cursor-based pagination for notification history
- ✅ Cache notifications in Redux (don't refetch every poll)

**Notification Cleanup:**
- Backend: Delete notifications older than 30 days
- Frontend: Show last 50 notifications, load more on scroll
- Mark notifications as read after 7 days automatically (optional)

---

**Decision: Use Polling for MVP**

**Rationale:**
1. Procurement workflows don't require instant notifications (not a chat app)
2. 30-second delay is acceptable for order updates, price alerts, etc.
3. Significantly simpler implementation (2-3x faster to build)
4. Lower infrastructure costs and complexity
5. Easier to debug and monitor
6. Can upgrade to WebSocket later if needed (without changing frontend much)

**Future WebSocket Migration Path:**
1. Add WebSocket server alongside polling endpoints
2. Connect WebSocket on login, keep polling as fallback
3. If WebSocket connected, skip polling
4. Gradually roll out to users (A/B test)
5. Keep polling endpoints for backward compatibility

---

## Redux Architecture

### Store Structure

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import productsReducer from './slices/productsSlice'
import basketsReducer from './slices/basketsSlice'
import ordersReducer from './slices/ordersSlice'
import marketIntelligenceReducer from './slices/marketIntelligenceSlice'
import procurementCalendarReducer from './slices/procurementCalendarSlice'
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productsReducer,
    baskets: basketsReducer,
    orders: ordersReducer,
    marketIntelligence: marketIntelligenceReducer,
    procurementCalendar: procurementCalendarReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```


### What Goes in Redux vs. What Doesn't

#### ✅ Store in Redux:
1. **User authentication state** (token, user info)
2. **Data fetched from backend** that's used across multiple pages
3. **Shared UI state** (notifications, selected product across components)
4. **Shopping cart / form data** that persists across navigation

#### ❌ Don't Store in Redux:
1. **Local component state** (form inputs, modal open/close)
2. **Derived data** that can be calculated from existing state
3. **Temporary UI state** (hover, focus, animations)
4. **Page-specific data** that's never used elsewhere

### Redux Slices Overview

#### 1. Auth Slice
```typescript
// src/store/slices/authSlice.ts
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Actions: login, logout, refreshToken, updateUser
// Used on: All pages (check auth status)
```

#### 2. Dashboard Slice
```typescript
interface DashboardState {
  overview: DashboardOverview | null
  loading: boolean
  lastFetched: number | null
  error: string | null
}

// Actions: fetchDashboardOverview, clearDashboard
// Used on: Dashboard home page only
// Cache: 5 minutes
```

#### 3. Products Slice
```typescript
interface ProductsState {
  list: Product[]
  searchResults: SearchResult[]
  loading: boolean
  lastFetched: number | null
  error: string | null
}

// Actions: fetchProducts, searchProducts, clearSearch
// Used on: Direct Purchase page, reorder flows
// Cache: Session-long (until refresh or logout)
```


#### 4. Baskets Slice
```typescript
interface BasketsState {
  list: Basket[]
  loading: boolean
  lastFetched: number | null
  error: string | null
}

// Computed in selectors:
// - activeBaskets = list.filter(b => b.status === 'active')
// - completedBaskets = list.filter(b => b.status === 'completed')
// - userActiveBaskets = list.filter(b => b.userParticipation.isParticipating)

// Actions: fetchBaskets, joinBasket, leaveBasket, updateCommitment
// Used on: Basket System page, Dashboard overview
// Cache: 2 minutes (frequently updated)
```

#### 5. Orders Slice
```typescript
interface OrdersState {
  history: Order[]
  pagination: PaginationInfo
  loading: boolean
  filters: { type: string, status: string }
  error: string | null
}

// Actions: fetchOrderHistory, loadMoreOrders, reorder, setFilters
// Used on: Order History page, Dashboard recent orders
// Cache: Invalidate on new order
```

#### 6. Market Intelligence Slice
```typescript
interface MarketIntelligenceState {
  products: MarketProduct[]
  selectedProduct: string | null
  viewMode: 'main_four' | 'all_products'
  loading: boolean
  lastFetched: number | null
  error: string | null
}

// Actions: fetchMarketData, selectProduct, setViewMode
// Used on: Market Intelligence page only
// Cache: 24 hours (price data updated daily by admin)
```

#### 7. Procurement Calendar Slice
```typescript
interface ProcurementCalendarState {
  products: ProcurementProduct[]
  selectedProduct: string
  loading: boolean
  lastFetched: number | null
  error: string | null
}

// Actions: fetchProcurementData, selectProduct
// Used on: Procurement Calendar page only
// Cache: 7 days (seasonal data rarely changes)
```


#### 8. Notifications Slice
```typescript
interface NotificationsState {
  list: Notification[]
  unreadCount: number
  loading: boolean
  wsConnected: boolean
  error: string | null
}

// Actions: fetchNotifications, markAsRead, markAllRead, addNotification (WebSocket)
// Used on: All pages (notification bell in navbar)
// Real-time: WebSocket or 30s polling
```

---

## Authentication Flow

### Complete Authentication Flow Diagram

```
1. APP INITIALIZATION
   ├─ Check localStorage/cookie for refreshToken
   ├─ If exists: Call POST /api/auth/refresh
   │  ├─ Success: Get new accessToken → Auto-login → Dashboard
   │  └─ Fail: Clear tokens → Login page
   └─ If not exists: Login page

2. LOGIN PROCESS
   ├─ User submits email + password
   ├─ POST /api/auth/login
   ├─ Success:
   │  ├─ Store accessToken in Redux (memory)
   │  ├─ Store refreshToken in localStorage/cookie
   │  ├─ Store user info in Redux
   │  └─ Redirect to /dashboard
   └─ Fail: Show error message

3. AUTHENTICATED REQUESTS
   ├─ Axios interceptor adds: Authorization: Bearer {accessToken}
   ├─ Request fails with 401?
   │  ├─ Call POST /api/auth/refresh
   │  ├─ Success: Retry original request with new token
   │  └─ Fail: Logout → Login page
   └─ Other errors: Handle normally

4. LOGOUT
   ├─ User clicks logout
   ├─ POST /api/auth/logout (optional, to blacklist refreshToken)
   ├─ Clear Redux store
   ├─ Clear localStorage/cookies
   └─ Redirect to /login

5. AUTO-LOGOUT
   ├─ refreshToken expires (7 days)
   ├─ Next API call fails with 401
   ├─ Refresh attempt fails
   └─ Force logout → Login page
```


### Token Storage Strategy

**Option 1: httpOnly Cookie (Most Secure) ✅ RECOMMENDED**
```typescript
// Backend sets cookie on login
res.cookie('refreshToken', token, {
  httpOnly: true,      // JavaScript can't access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
})

// Frontend: Cookie sent automatically with requests
// No need to store in localStorage
```

**Option 2: localStorage (Simpler, less secure)**
```typescript
// Store on login
localStorage.setItem('refreshToken', token)

// Retrieve for refresh
const refreshToken = localStorage.getItem('refreshToken')

// Risk: XSS attacks can steal tokens
```

**Best Practice:**
- refreshToken → httpOnly cookie (backend-managed)
- accessToken → Redux state (memory only, cleared on refresh)
- On app load, check cookie existence → auto-refresh → get new accessToken

---

## Frontend vs Backend Calculations

### Calculation Responsibility Matrix

| Calculation | Where | Why |
|------------|-------|-----|
| **User's total savings** | Backend | Requires aggregating all orders & comparing to Merkato prices |
| **Average discount rate** | Backend | Platform-wide calculation across all users |
| **Basket target price** | Backend | Based on supplier negotiations & volume |
| **Stock availability** | Backend | Real-time inventory tracking |
| **Order subtotal** | Frontend | Sum of (quantity × price) - Simple math |
| **Seasonal ranking** | Frontend | Compare avgPrice across periods - UI presentation logic |
| **Chart data formatting** | Frontend | Transform data for Recharts - UI concern |
| **Currency formatting** | Frontend | Display concern (ETB 1,234.56) |
| **Date formatting** | Frontend | Display concern (locale-specific) |
| **Filter/sort cached data** | Frontend | Better UX (instant response) |
| **Price change detection** | Backend | Requires historical tracking |
| **Delivery fee** | Backend | Business logic (distance, weight) |
| **Pagination** | Backend | Efficient (don't send all 10,000 orders) |
| **Search** | Backend | Database indexed search (faster) |
| **Multi-year averaging** | Frontend | Already have data, simple calculation |


### Rule of Thumb

**Backend calculates when:**
- ✅ Requires data from multiple sources/tables
- ✅ Business logic that could change
- ✅ Heavy computation (aggregations, analytics)
- ✅ Security-sensitive (pricing, discounts)
- ✅ Needs database queries

**Frontend calculates when:**
- ✅ Pure presentation (formatting, styling)
- ✅ Instant user feedback needed
- ✅ Simple operations on already-fetched data
- ✅ UI state (sorting, filtering cached lists)
- ✅ Chart/visualization transformations

---

## Real-time Updates & Notifications

### How to Know Backend Data Changed?

**Problem:** User on Dashboard page, admin changes a basket status. How does user see update?

**Solutions:**

#### 1. Polling (Simple, works everywhere)
```typescript
// Fetch data every X seconds
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(fetchBaskets())
  }, 30000)  // 30 seconds
  
  return () => clearInterval(interval)
}, [])

// Pros: Simple, no server changes needed
// Cons: Delayed updates, unnecessary requests
```

#### 2. WebSocket (Real-time, better UX)
```typescript
// Connect on login
const ws = new WebSocket('wss://api.babi.com/ws')

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  
  switch(update.type) {
    case 'BASKET_UPDATED':
      dispatch(updateBasket(update.data))
      break
    case 'ORDER_STATUS_CHANGED':
      dispatch(updateOrderStatus(update.data))
      break
    case 'NEW_NOTIFICATION':
      dispatch(addNotification(update.data))
      break
  }
}

// Pros: True real-time, efficient
// Cons: More complex backend
```


#### 3. Server-Sent Events (SSE) (Middle ground)
```typescript
const eventSource = new EventSource('/api/events')

eventSource.addEventListener('basket-update', (e) => {
  const basket = JSON.parse(e.data)
  dispatch(updateBasket(basket))
})

// Pros: Simpler than WebSocket, real-time
// Cons: One-way only (server → client)
```

#### 4. React Query / SWR (Smart caching)
```typescript
// Auto-refetch on window focus, network reconnect
const { data } = useQuery('baskets', fetchBaskets, {
  refetchOnWindowFocus: true,
  refetchInterval: 30000,
  staleTime: 60000
})

// Pros: Smart caching, auto background updates
// Cons: Different from Redux (but can work together)
```

**Recommendation for Your Project:**
1. **Phase 1 (MVP):** Polling for most data (30-60s intervals)
2. **Phase 2:** WebSocket for notifications only
3. **Phase 3:** Expand WebSocket to critical real-time features (basket participation, live orders)

---

## Data Standardization

### Creating Mock Data JSON Files

To simulate backend responses and test Redux, create these files:

```
frontend/src/data/
├── auth/
│   ├── loginResponse.json
│   └── userProfile.json
├── dashboard/
│   └── overview.json
├── products/
│   ├── productsList.json
│   └── searchResults.json
├── baskets/
│   └── basketsList.json
├── orders/
│   └── orderHistory.json
├── marketIntelligence/
│   └── products.json
└── procurementCalendar/
    └── products.json
```

### Example: Dashboard Overview Mock
```typescript
// frontend/src/data/dashboard/overview.json
{
  "success": true,
  "data": {
    "totalSavings": {
      "amount": 45234,
      "percentage": 23,
      "trend": "up",
      "comparedTo": "last_month"
    },
    // ... rest of dashboard data
  }
}
```


### Using Mock Data with Redux

```typescript
// src/store/slices/dashboardSlice.ts
import mockOverview from '@/data/dashboard/overview.json'

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async () => {
    // PHASE 1: Use mock data
    return mockOverview.data
    
    // PHASE 2: Switch to real API (same Redux code!)
    // const response = await api.get('/dashboard/overview')
    // return response.data.data
  }
)
```

**Benefits:**
1. ✅ Develop and test Redux logic without backend
2. ✅ UI works with mock data → Easy to swap for real API
3. ✅ Frontend team can work independently
4. ✅ Mock data defines the contract for backend

---

## Next Steps Summary

### Phase 1: Setup Redux + Mock Data ✅ START HERE
1. Install Redux Toolkit: `npm install @reduxjs/toolkit react-redux`
2. Create store structure (shown above)
3. Create all Redux slices
4. Create mock JSON files for each endpoint
5. Update pages to use Redux instead of hardcoded data
6. Test Redux DevTools to see state changes

### Phase 2: Design Super Admin Dashboard
1. List all admin capabilities (add products, manage baskets, fulfill orders, etc.)
2. Design UI for each admin function
3. Identify what data admin needs to input
4. Map admin endpoints (similar to this document)

### Phase 3: Database Schema Design
1. Now you know what end-users need
2. Now you know what admins need
3. Design tables and relationships
4. Plan for scalability and performance

### Phase 4: Build Backend API
1. Implement all endpoints documented here
2. Use defined data contracts (TypeScript interfaces)
3. Include validation and error handling
4. Authentication & authorization

### Phase 5: Integration
1. Replace mock data with real API calls
2. Test end-to-end flows
3. Handle edge cases and errors
4. Performance optimization

---

## Questions Answered


### Q: "Should we give one endpoint per page or base on functionality?"
**A:** Base on **functionality and resources**, not pages.

- ❌ Don't create `/api/dashboard-page` or `/api/basket-page`
- ✅ Create `/api/dashboard/overview`, `/api/baskets`, `/api/orders`
- One page can call multiple endpoints
- One endpoint can be used by multiple pages

### Q: "What should be put in Redux?"
**A:** Data that's:
1. Fetched from backend AND used across multiple components/pages
2. Authentication state (needed everywhere)
3. Shared UI state (notifications, selected items)

**Don't put:** Local component state, derived data, temporary UI state

### Q: "How do we know to change Redux when backend changes?"
**A:** Four strategies:
1. **Polling:** Fetch periodically (every 30-60s)
2. **WebSocket:** Backend pushes updates to frontend
3. **Manual refresh:** User clicks refresh button
4. **On action:** After user action (create order → refetch orders list)

**Best:** Combination of all four
- Critical data (notifications) → WebSocket
- Regular data (baskets, orders) → Polling + manual refresh
- After mutations → Auto-refetch affected data

### Q: "Should calculations be done manually by frontend or fetch from backend?"
**A:** See "Frontend vs Backend Calculations" section above.

**General rule:**
- Backend: Business logic, aggregations, security-sensitive
- Frontend: Presentation, formatting, UI state

### Q: "How do notifications work?"
**A:**
1. **Browser Permission:** Request on first login
2. **Backend sends:** Either via WebSocket or polling endpoint
3. **Frontend receives:** Show in-app notification bell + browser notification
4. **Mark as read:** User clicks → PUT request → Update Redux state

---

## Final Recommendation

**YES, continue this way!** ✅

Your approach is **excellent**:
1. ✅ Finish end-user frontend (almost done)
2. ✅ Setup Redux with mock data (next step)
3. ✅ Build super admin dashboard
4. ✅ Design database schema (now you know all requirements)
5. ✅ Build backend API
6. ✅ Replace mock data with real API

This is the **professional way** to build modern web applications.

---

**Created by:** Kiro AI Assistant  
**Last Updated:** 2026-08-06
