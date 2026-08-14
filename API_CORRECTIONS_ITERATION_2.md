# API Requirements Corrections - Iteration 2 Complete

**Date:** 2026-08-06  
**Sections Covered:** 5-8 (Forgot Password, Reset Password, Dashboard Overview, Direct Purchase)

---

## Summary of Changes

### ✅ Section 5: Forgot Password
**Status:** No changes required  
- Endpoint is correct as-is
- `POST /api/auth/forgot-password`
- Sends reset link to email
- Doesn't reveal if email exists (security)

---

### ✅ Section 6: Reset Password
**Status:** No changes required  
- Endpoint is correct as-is
- `POST /api/auth/reset-password`
- Token from email + new password
- Redirects to login after success

---

### ✅ Section 7: Dashboard Overview

#### Major Changes:

1. **Total Savings Calculation - Compare Against Merkato ONLY**
   ```typescript
   // OLD: Compare against arbitrary "platform average"
   // NEW: Compare against Merkato retailer prices (first layer purchasing)
   
   totalSavings: {
     amount: number           // ETB saved vs Merkato retailers
     percentage: number
     trend: "up" | "down"
     comparedTo: "last_month"
   }
   ```
   - Backend must aggregate all user's completed transactions
   - Formula: `Sum of (Merkato Price - Purchase Price) across all orders`
   - **NOT** against volatile platform prices

2. **Active Orders - Only 4 Status Values**
   ```typescript
   status: "delivered" | "out-for-delivery" | "pending" | "accepted"
   // ❌ Removed: "processing", "shipped", "cancelled"
   ```
   - Simplified order lifecycle
   - Matches actual business process
   - Easier for users to understand

3. **Removed `recentOrders` Field**
   ```typescript
   // OLD Response:
   {
     activeOrders: { ... },
     recentOrders: Array<Order>,  // ❌ REMOVED - Duplicate data
     // ...
   }
   
   // NEW Response:
   {
     activeOrders: {
       orders: Array<Order>  // ✅ Frontend derives recent from this
     }
     // ...
   }
   ```
   - Eliminates data duplication
   - Frontend can filter/sort `activeOrders.orders` to show "recent"
   - Reduces API response size

4. **Active Baskets - Only User's Participating Baskets**
   ```typescript
   basketParticipation: {
     activeBaskets: number  // Count of baskets user has JOINED
     baskets: Array<{       // Only baskets where userParticipation.isParticipating === true
       id: string
       name: string
       yourCommitment: number
       // ...
     }>
   }
   ```
   - Don't show all platform baskets
   - Show only baskets user has committed to
   - More relevant to user's dashboard

5. **Average Discount Restructured**
   ```typescript
   // OLD:
   avgDiscountRate: {
     percentage: number
     yourAverage: number
     calculation: {
       merkato_avg: number
       platform_avg: number     // ❌ Too volatile as reference
     }
   }
   
   // NEW:
   avgDiscountRate: {
     yourAverage: number        // User's achieved discount vs Merkato
     calculation: {
       directPurchaseSavings: number    // % saved via direct purchase
       basketSavings: number            // % saved via baskets
       merkato_avg: number              // Merkato retailer average
       // ❌ Removed platform_avg
     }
   }
   ```
   - Platform price is too volatile to use as reference
   - Split savings by purchase type (direct vs basket)
   - Both calculated against Merkato, not platform

6. **Added Basket Fill Progress**
   ```typescript
   baskets: Array<{
     // ...
     fillProgress: {           // NEW: Track basket fill amount
       current: number         // Current total commitment
       target: number          // Target/max commitment
       percentage: number      // (current / target) * 100
     }
   }>
   ```
   - Shows how close basket is to closing
   - Helps users decide whether to join
   - Important for basket completion logic

7. **Added Brand to Price Alerts**
   ```typescript
   priceAlerts: Array<{
     productId: string
     productName: string
     brandName: string         // NEW: Specific brand tracking
     priceChange: number
     // ...
   }>
   ```
   - Price tracking is brand-specific, not just product
   - More accurate alerts

---

### ✅ Section 8: Direct Purchase

#### Major Changes:

1. **Removed Product-Level Price and Image**
   ```typescript
   // OLD Product Structure:
   product: {
     id: string
     name: string
     imageUrl: string          // ❌ REMOVED
     currentPrice: number      // ❌ REMOVED
     stockLevel: "high" | "medium" | "low" | "out"  // ❌ REMOVED
     brands: Array<Brand>
   }
   
   // NEW Product Structure:
   product: {
     id: string
     name: string
     category: string
     unit: string
     inStock: boolean          // ✅ Simple true/false
     // NO imageUrl, NO currentPrice, NO stockLevel
     
     brands: Array<{
       id: string
       name: string
       imageUrl: string        // ✅ Image at brand level
       price: number           // ✅ Price at brand level
       inStock: boolean
       stockQuantity: number
     }>
   }
   ```

2. **Products → Brands Hierarchy Established**
   - **Product**: Generic item (e.g., "A4 Paper")
     - No price
     - No image
     - Container for brands
   - **Brand**: Specific manufacturer (e.g., "HP A4 Paper", "Canon A4 Paper")
     - Has price
     - Has image
     - Has stock status

3. **Removed `stockLevel` Enum**
   ```typescript
   // OLD: stockLevel: "high" | "medium" | "low" | "out"
   // NEW: inStock: boolean
   ```
   - Simplified stock tracking
   - Don't expose exact inventory levels to users
   - Backend still tracks `stockQuantity` for validation

4. **Removed `estimatedDelivery` from Product List**
   ```typescript
   // OLD:
   brands: Array<{
     // ...
     estimatedDelivery: string  // ❌ REMOVED
   }>
   
   // NEW: No estimatedDelivery in product list
   // Delivery estimates shown after order is created
   ```
   - Delivery time calculated at order time
   - Not part of product browsing

5. **Search Results - Removed `type` Field**
   ```typescript
   // OLD:
   results: Array<{
     type: "product" | "brand"  // ❌ REMOVED
     product: { ... }
     brand: { ... }
   }>
   
   // NEW:
   results: Array<{
     // No type field - endpoint searches brands only
     productId: string
     productName: string
     brandId: string
     brandName: string
     brandImageUrl: string
     price: number
     inStock: boolean
   }>
   ```
   - Flattened structure
   - Easier to display in UI
   - Search is brand-focused

6. **Removed `deliveryAddress` from Order Request**
   ```typescript
   // OLD Request:
   POST /api/orders/direct-purchase
   {
     items: Array<...>,
     deliveryAddress: string    // ❌ REMOVED
     notes?: string
   }
   
   // NEW Request:
   POST /api/orders/direct-purchase
   {
     items: Array<...>,
     notes?: string
     // NO deliveryAddress - uses user's stored address
   }
   ```
   - Address collected during registration
   - Stored in login response
   - Available in Redux
   - No need to re-enter every time

7. **Order Number Format Specified**
   ```typescript
   Response: 201 Created
   {
     orderId: string
     orderNumber: string        // Format: "ORD-2026/08/06-XXXXX"
     // Example: "ORD-2026/08/06-A7B2C"
   }
   ```
   - Consistent format: PREFIX-YEAR/MONTH/DATE-UNIQUE_ID
   - Year format: YYYY (Gregorian calendar)
   - Date format: MM/DD
   - Unique ID: 5 alphanumeric characters

8. **Redux Updates After Order Creation**
   ```typescript
   // After successful order creation:
   // 1. Add new order to ordersSlice.history
   // 2. Increment dashboardSlice.overview.activeOrders.count
   // 3. Show success message
   // 4. Clear cart
   // 5. Redirect to order confirmation
   ```
   - Immediate UI updates
   - No manual page refresh needed

9. **Removed `estimatedDelivery` from Order Response**
   ```typescript
   // OLD Response:
   {
     orderId: string
     orderNumber: string
     total: number
     estimatedDelivery: string  // ❌ REMOVED
     status: "pending"
   }
   
   // NEW Response:
   {
     orderId: string
     orderNumber: string
     total: number
     status: "pending"
     // NO estimatedDelivery
   }
   ```
   - Delivery estimates handled in order tracking
   - Not needed immediately after creation

---

### ✅ NEW REQUIREMENT: Profile Edit Page

**Page Location:** `/dashboard/profile` or `/dashboard/settings`

**Purpose:** Allow users to edit organization profile and address

#### New Endpoints:

**1. Get Current Profile**
```typescript
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
```

**2. Update Profile**
```typescript
PUT /api/user/profile

Request Body:
{
  organizationName?: string
  organizationType?: string
  phoneNumber?: string
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
    // Updated user object (same structure as GET)
  }
}

Frontend Action:
- Update Redux auth.user with new data
- Show success message
- Address changes automatically apply to future orders
```

**Editable Fields:**
- Organization Name
- Organization Type
- Phone Number
- TIN Number (view-only or with verification)
- Complete Address (all fields)

**Not Editable Here:**
- Email (separate endpoint with verification)
- Password (separate change password flow)

**Why This Is Important:**
1. Users provided address during registration
2. Direct purchases use this stored address
3. Users need ability to update address
4. Otherwise, they're stuck with registration address forever

---

## Database Implications

### Updated Tables:

**users table (no changes needed):**
```sql
-- Already has all fields from Iteration 1
-- No new fields required for Iteration 2
```

**products table:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50),
  in_stock BOOLEAN DEFAULT TRUE
  -- NO price column
  -- NO image_url column
  -- NO stock_level enum
);
```

**brands table:**
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  image_url TEXT,                    -- Image at brand level
  price DECIMAL(10, 2) NOT NULL,     -- Price at brand level
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0
  -- NO estimated_delivery
);
```

**orders table:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,  -- ORD-YYYY/MM/DD-XXXXX
  status VARCHAR(20) NOT NULL,  -- 'pending', 'accepted', 'out-for-delivery', 'delivered'
  delivery_address TEXT NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP
  -- Address comes from user's profile, not order request
);
```

---

## Frontend Changes Required

### 1. Dashboard Overview Page

**DashboardHome.tsx:**
```typescript
// Remove recentOrders section (derive from activeOrders)
const recentOrders = dashboardData.activeOrders.orders
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 5)

// Display only 4 statuses
const statusColors = {
  'pending': 'yellow',
  'accepted': 'blue',
  'out-for-delivery': 'purple',
  'delivered': 'green'
  // No 'processing', 'shipped', 'cancelled'
}

// Show basket fill progress
<div>
  <p>Fill Progress: {basket.fillProgress.percentage}%</p>
  <ProgressBar 
    current={basket.fillProgress.current} 
    target={basket.fillProgress.target} 
  />
</div>

// Savings comparison (vs Merkato only, not platform)
<div>
  <p>Your Total Savings</p>
  <p className="text-2xl font-bold">ETB {totalSavings.amount}</p>
  <p className="text-sm text-muted-foreground">
    {totalSavings.percentage}% vs Merkato Retailers
  </p>
</div>
```

---

### 2. Direct Purchase Page

**DirectPurchasePage.tsx:**
```typescript
// Display products with brands
{products.map(product => (
  <div key={product.id}>
    <h3>{product.name}</h3>
    {/* No product image, no product price */}
    
    <div className="brands-grid">
      {product.brands.map(brand => (
        <BrandCard
          key={brand.id}
          name={brand.name}
          image={brand.imageUrl}       // Image from brand
          price={brand.price}           // Price from brand
          inStock={brand.inStock}
          onAddToCart={() => addToCart(product.id, brand.id, brand.price)}
        />
      ))}
    </div>
  </div>
))}

// Search results (flattened brands)
{searchResults.map(result => (
  <div key={`${result.productId}-${result.brandId}`}>
    <img src={result.brandImageUrl} />
    <p>{result.productName} - {result.brandName}</p>
    <p>ETB {result.price}</p>
    {result.inStock ? 'In Stock' : 'Out of Stock'}
  </div>
))}

// Order creation (no address in request)
const createOrder = async () => {
  // Address already in Redux from login
  // No need to include in request
  const response = await dispatch(createDirectPurchaseOrder({
    items: cartItems.map(item => ({
      productId: item.productId,
      brandId: item.brandId,
      quantity: item.quantity,
      price: item.price
    })),
    notes: orderNotes
  }))
  
  // Order number format: ORD-2026/08/06-XXXXX
  console.log('Order created:', response.data.orderNumber)
}
```

---

### 3. NEW Page: Profile Edit

**ProfilePage.tsx (New File):**
```typescript
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile, updateUserProfile } from '@/store/slices/authSlice'

export function ProfilePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    phoneNumber: '',
    address: {
      addressType: 'manual',
      street: '',
      subCity: '',
      area: '',
      city: 'Addis Ababa',
      region: 'Addis Ababa City Administration'
    }
  })
  
  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [])
  
  useEffect(() => {
    if (user) {
      setFormData({
        organizationName: user.organizationName,
        organizationType: user.organizationType,
        phoneNumber: user.phoneNumber,
        address: user.address
      })
    }
  }, [user])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(updateUserProfile(formData))
    // Success message shown
    // Redux auth.user updated automatically
  }
  
  return (
    <div>
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        {/* Organization Name */}
        <input
          value={formData.organizationName}
          onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
        />
        
        {/* Organization Type dropdown */}
        <select
          value={formData.organizationType}
          onChange={(e) => setFormData({...formData, organizationType: e.target.value})}
        >
          <option value="School">School</option>
          <option value="University">University</option>
          {/* ... other types */}
        </select>
        
        {/* Phone Number */}
        <input
          value={formData.phoneNumber}
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
        />
        
        {/* TIN Number (read-only) */}
        <input value={user.tinNumber} disabled />
        
        {/* Address fields */}
        {/* ... all address fields editable */}
        
        <button type="submit">Save Changes</button>
      </form>
    </div>
  )
}
```

**Add to routes:**
```typescript
// src/App.tsx or routes file
<Route path="/dashboard/profile" element={<ProfilePage />} />
```

---

## Redux Changes

### authSlice Updates:

```typescript
// Add new actions
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async () => {
    const response = await api.get('/api/user/profile')
    return response.data.data
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData) => {
    const response = await api.put('/api/user/profile', profileData)
    return response.data.data
  }
)

// Update reducers
extraReducers: (builder) => {
  builder
    .addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.user = action.payload
    })
    .addCase(updateUserProfile.fulfilled, (state, action) => {
      state.user = action.payload
      // User profile updated, future orders will use new address
    })
}
```

### dashboardSlice Updates:

```typescript
interface DashboardState {
  overview: {
    totalSavings: {
      amount: number
      percentage: number
      trend: "up" | "down"
      comparedTo: string
    }
    activeOrders: {
      count: number
      totalValue: number
      orders: Array<Order>  // Frontend derives recentOrders from this
    }
    basketParticipation: {
      activeBaskets: number
      baskets: Array<{
        // ... with fillProgress
        fillProgress: {
          current: number
          target: number
          percentage: number
        }
      }>
    }
    avgDiscountRate: {
      yourAverage: number
      calculation: {
        directPurchaseSavings: number
        basketSavings: number
        merkato_avg: number
        // NO platform_avg
      }
    }
    // NO recentOrders field
  } | null
  loading: boolean
  lastFetched: number | null
}

// Selectors
export const selectRecentOrders = (state) => {
  return state.dashboard.overview?.activeOrders.orders
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5) || []
}
```

### productsSlice Updates:

```typescript
interface Product {
  id: string
  name: string
  category: string
  unit: string
  inStock: boolean
  // NO imageUrl, NO currentPrice, NO stockLevel
  
  brands: Array<{
    id: string
    name: string
    imageUrl: string    // Image at brand level
    price: number       // Price at brand level
    inStock: boolean
    stockQuantity: number
  }>
}

interface ProductsState {
  list: Array<Product>
  searchResults: Array<{
    // Flattened brand results (no type field)
    productId: string
    productName: string
    productCategory: string
    brandId: string
    brandName: string
    brandImageUrl: string
    price: number
    inStock: boolean
  }>
  loading: boolean
  lastFetched: number | null
}
```

---

## Backend Business Logic

### Dashboard Overview:

**Total Savings Calculation:**
```typescript
async function calculateTotalSavings(userId: string) {
  // Get all completed orders for user
  const orders = await db.orders.find({
    userId,
    status: 'delivered'
  })
  
  let totalSavings = 0
  
  for (const order of orders) {
    for (const item of order.items) {
      // Get Merkato price at time of purchase
      const merkatoPrice = await getMerkatoPriceAtDate(
        item.brandId,
        order.createdAt
      )
      
      // Calculate savings for this item
      const itemSavings = (merkatoPrice - item.price) * item.quantity
      totalSavings += itemSavings
    }
  }
  
  return {
    amount: totalSavings,
    percentage: calculatePercentage(totalSavings, totalSpent)
  }
}
```

**Recent Orders (Derived from Active Orders):**
```typescript
// Backend returns activeOrders.orders
// Frontend sorts and slices for "recent" display
// No separate recentOrders array needed
```

### Direct Purchase:

**Order Creation Without Address:**
```typescript
async function createDirectPurchaseOrder(userId: string, items: Array<Item>) {
  // Get user's stored address
  const user = await db.users.findOne({ id: userId })
  const address = await db.addresses.findOne({ userId })
  
  // Use stored address (no address in request body)
  const order = await db.orders.create({
    userId,
    orderNumber: generateOrderNumber(),  // ORD-2026/08/06-XXXXX
    items,
    deliveryAddress: formatAddress(address),
    status: 'pending',
    total: calculateTotal(items)
  })
  
  return order
}

function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const uniqueId = generateUniqueId(5)  // 5 alphanumeric chars
  
  return `ORD-${year}/${month}/${date}-${uniqueId}`
}
```

### Profile Update:

**Update User Profile:**
```typescript
async function updateUserProfile(userId: string, updates: ProfileUpdates) {
  // Update user table
  await db.users.update({ id: userId }, {
    organizationName: updates.organizationName,
    organizationType: updates.organizationType,
    phoneNumber: updates.phoneNumber
  })
  
  // Update address table
  if (updates.address) {
    await db.addresses.update({ userId }, updates.address)
  }
  
  // Return updated user object
  const updatedUser = await db.users.findOne({ id: userId })
  const updatedAddress = await db.addresses.findOne({ userId })
  
  return {
    ...updatedUser,
    address: updatedAddress
  }
}
```

---

## Testing Checklist

### Dashboard Overview:
- [ ] Total savings calculated vs Merkato prices only
- [ ] Only 4 order statuses displayed
- [ ] Recent orders derived from activeOrders (no duplicate data)
- [ ] Basket fill progress shown correctly
- [ ] Average discount shows direct + basket breakdown
- [ ] Price alerts include brand names

### Direct Purchase:
- [ ] Products show brands array (no product price/image)
- [ ] Brand cards display brand image and price
- [ ] Search returns flattened brand results
- [ ] Order creation works without deliveryAddress in request
- [ ] Order number format correct: ORD-2026/08/06-XXXXX
- [ ] Backend uses user's stored address
- [ ] Redux updated after order creation

### Profile Edit:
- [ ] Profile page loads user data
- [ ] All fields editable except TIN and email
- [ ] Address update works (both autocomplete and manual)
- [ ] Redux auth.user updated after save
- [ ] Future orders use updated address
- [ ] Success message shown

---

## Performance Considerations

### Caching:
- Dashboard overview: 5 minutes TTL
- Products list: 1 hour TTL (rarely changes)
- User profile: Session-long (update on edit)

### Database Queries:
- Index on orders(user_id, status, created_at DESC)
- Index on products(category)
- Index on brands(product_id, in_stock)

---

**Status:** ✅ Iteration 2 Complete - Sections 5-8 fully updated

**Next:** Iteration 3 (Sections 9-13) - Basket System, Order History, Market Intelligence, Procurement Calendar, Notifications
