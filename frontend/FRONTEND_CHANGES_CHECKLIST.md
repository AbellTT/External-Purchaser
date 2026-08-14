# Frontend Changes Implementation Checklist

**Date:** 2026-08-06  
**Purpose:** Track all frontend modifications based on API requirements corrections

---

## 1. Authentication & Registration Pages

### Signup.tsx (Register Page)
- [ ] **Registration response now includes tokens**
  - [ ] After successful registration, store accessToken in Redux
  - [ ] Store refreshToken in localStorage
  - [ ] Store user info (including address) in Redux
  - [ ] Redirect to `/dashboard` (NOT `/login`)
  - [ ] Remove intermediate success page if it redirects to login

### Login.tsx
- [ ] **Add Remember Me checkbox**
  - [ ] Add checkbox UI element
  - [ ] Send `rememberMe: boolean` in login request
  - [ ] Store rememberMe preference in Redux
- [ ] **Store complete user profile in Redux**
  - [ ] Store full address object (with addressType)
  - [ ] Store organizationType, phoneNumber, tinNumber
- [ ] **Remove role field handling** (if exists)

### Auth Redux Slice (authSlice.ts)
- [ ] **Update state structure**
  - [ ] Add rememberMe: boolean
  - [ ] Update user object to include all registration fields
  - [ ] Ensure address includes addressType field
- [ ] **Update registration action**
  - [ ] Handle token response from registration
  - [ ] Store tokens immediately
  - [ ] No separate login call needed
- [ ] **Update login action**
  - [ ] Send rememberMe in request
  - [ ] Store complete user profile

---

## 2. Dashboard Overview Page

### DashboardHome.tsx
- [ ] **Remove separate recentOrders display**
  - [ ] Derive recent orders from activeOrders.orders
  - [ ] Sort by date descending
  - [ ] Take first 5 for recent orders section
- [ ] **Update order status handling**
  - [ ] Only handle 4 statuses: pending, accepted, out-for-delivery, delivered
  - [ ] Remove: processing, shipped, cancelled
  - [ ] Update status badge colors
- [ ] **Add basket fill progress**
  - [ ] Display fillProgress.percentage for each basket
  - [ ] Show progress bar visual
  - [ ] Display current/target commitment amounts
- [ ] **Update savings display**
  - [ ] Show comparison vs Merkato only (not platform)
  - [ ] Display: "ETB X saved vs Merkato Retailers"
  - [ ] Remove platform average references
- [ ] **Update price alerts**
  - [ ] Display brand name along with product name
  - [ ] Show: "Product - Brand" format

### Dashboard Redux Slice (dashboardSlice.ts)
- [ ] **Remove recentOrders field from state**
- [ ] **Add fillProgress to basket objects**
- [ ] **Update avgDiscountRate structure**
  - [ ] Remove platform_avg
  - [ ] Add directPurchaseSavings
  - [ ] Add basketSavings
- [ ] **Add selector for recent orders**
  - [ ] Create selectRecentOrders selector
  - [ ] Derives from activeOrders.orders

---

## 3. Direct Purchase Page

### DirectPurchasePage.tsx
- [ ] **Update product display structure**
  - [ ] Show product name (no image, no price at product level)
  - [ ] Display brands array for each product
  - [ ] Each brand card shows: image, brand name, price, stock status
- [ ] **Update search results display**
  - [ ] Show flattened brand results
  - [ ] Display: Product Name - Brand Name
  - [ ] Show brand image and price
- [ ] **Remove address input from order creation**
  - [ ] Remove deliveryAddress field from order form
  - [ ] Use address from Redux (auth.user.address)
  - [ ] Show stored address in review section
- [ ] **Update order creation request**
  - [ ] Remove deliveryAddress from request body
  - [ ] Send only items and notes
- [ ] **Handle order number format**
  - [ ] Display order number as: ORD-YYYY/MM/DD-XXXXX
- [ ] **Update stock display**
  - [ ] Show simple "In Stock" / "Out of Stock"
  - [ ] Remove detailed stock levels (high/medium/low)

### Products Redux Slice (productsSlice.ts)
- [ ] **Update Product interface**
  - [ ] Remove imageUrl from product level
  - [ ] Remove currentPrice from product level
  - [ ] Add brands array with: id, name, imageUrl, price, inStock, stockQuantity
- [ ] **Update search results interface**
  - [ ] Remove type field
  - [ ] Flatten to: productId, productName, brandId, brandName, brandImageUrl, price, inStock

### Orders Redux Slice (ordersSlice.ts)
- [ ] **Add action for order creation**
  - [ ] After successful order, add to activeOrders
  - [ ] Update dashboard activeOrders count
  - [ ] Don't wait for manual refetch

---

## 4. NEW PAGE: Profile Edit

### Create ProfilePage.tsx
- [ ] **Create new page component**
  - [ ] Location: `src/pages/dashboard/ProfilePage.tsx`
- [ ] **Add form fields**
  - [ ] Organization Name (editable)
  - [ ] Organization Type (dropdown, editable)
  - [ ] Phone Number (editable)
  - [ ] TIN Number (read-only)
  - [ ] Email (read-only with "Change Email" link)
  - [ ] Address section (all fields editable)
- [ ] **Address editing**
  - [ ] Show current addressType
  - [ ] Allow switching between autocomplete and manual
  - [ ] Conditional fields based on addressType
- [ ] **Form submission**
  - [ ] Call PUT /api/user/profile
  - [ ] Update Redux auth.user with response
  - [ ] Show success message
  - [ ] Inform user: "Address updated. Future orders will use this address."
- [ ] **Add to navigation**
  - [ ] Add link in sidebar/navbar
  - [ ] Add route to dashboard routes

### Auth Redux Slice Updates
- [ ] **Add fetchUserProfile action**
  - [ ] GET /api/user/profile
  - [ ] Update auth.user state
- [ ] **Add updateUserProfile action**
  - [ ] PUT /api/user/profile
  - [ ] Update auth.user state with response

---

## 5. Basket System Page

### BasketSystemPage.tsx
- [ ] **Update basket structure display**
  - [ ] Show single brand (not products array)
  - [ ] Display: brand.brandName, brand.brandImageUrl
  - [ ] Show product name: brand.productName
- [ ] **Remove targetPrice display**
  - [ ] Remove "Target Price" label
- [ ] **Add three price comparison**
  - [ ] Display basketPrice
  - [ ] Display merkato_retailer_price
  - [ ] Display regular_stationary_market_price
  - [ ] Show all three side-by-side with labels
- [ ] **Show participant names**
  - [ ] Display list of participants
  - [ ] Show: organizationName, commitment, joinedDate
  - [ ] Replace simple count with expandable list
- [ ] **Show savings only when completed**
  - [ ] Check: basket.status === 'completed'
  - [ ] If completed, show completedSavings
  - [ ] Display both: vsMerkatoRetailer and vsRegularStationaryMarket
  - [ ] If active, don't show estimated savings
- [ ] **Update basket number display**
  - [ ] Format: BSK-YYYY/MM/DD-XXXXX

### After Join/Update/Leave Actions
- [ ] **Optimistic Redux updates**
  - [ ] On join success: update basket in Redux immediately
  - [ ] On update commitment: update basket in Redux immediately
  - [ ] On leave: update basket in Redux immediately
  - [ ] Don't refetch entire baskets list

### Baskets Redux Slice (basketsSlice.ts)
- [ ] **Update Basket interface**
  - [ ] Change products array to single brand object
  - [ ] Add basketNumber field
  - [ ] Update pricing structure (3 prices)
  - [ ] Change participants from count to array
  - [ ] Add completedSavings (optional, only when completed)
- [ ] **Update join/update/leave actions**
  - [ ] Extract updatedBasket from response
  - [ ] Replace basket in state.list
  - [ ] No need for full refetch

---

## 6. Order History Page

### OrderHistoryPage.tsx
- [ ] **Remove type filter**
  - [ ] Remove "All / Direct / Basket" tabs
  - [ ] Show direct purchase orders only
- [ ] **Update status filter**
  - [ ] Only show 4 statuses: All, Pending, Accepted, Out for Delivery, Delivered
  - [ ] Remove: Processing, Shipped, Cancelled
- [ ] **Display item subtotals**
  - [ ] Show subtotal for each item (quantity × price)
  - [ ] Show itemsTotal (sum of all subtotals)
- [ ] **Show two savings comparisons**
  - [ ] Display savings vs Merkato Retailer (amount + percentage)
  - [ ] Display savings vs Regular Stationary Market (amount + percentage)
- [ ] **Update order number display**
  - [ ] Format: ORD-YYYY/MM/DD-XXXXX

### Create BasketHistoryPage.tsx (NEW)
- [ ] **Create new page component**
  - [ ] Location: `src/pages/dashboard/BasketHistoryPage.tsx`
- [ ] **Display basket order history**
  - [ ] Show completed/cancelled baskets only
  - [ ] Display basket number: BSK-YYYY/MM/DD-XXXXX
  - [ ] Show brand info, yourOrder details
  - [ ] Display completedDate, deliveryDate
  - [ ] Show pricing (3 prices)
  - [ ] Show savings (2 comparisons)
- [ ] **Add to navigation**
  - [ ] Add separate menu item or tab
  - [ ] Add route to dashboard routes

### Orders Redux Slice Updates
- [ ] **Add basketHistory to state**
  - [ ] Separate array for basket orders
  - [ ] Separate pagination for basket history
- [ ] **Update Order interface**
  - [ ] Remove type field
  - [ ] Remove basketType field
  - [ ] Update status to only 4 values
  - [ ] Add subtotal to items array
  - [ ] Update savings structure (2 comparisons)
- [ ] **Create BasketOrder interface**
  - [ ] basketNumber, brand info, yourOrder, dates, pricing, savings
- [ ] **Add fetchBasketHistory action**
- [ ] **Update reorder action**
  - [ ] Handle itemsUnavailable array in response
  - [ ] Show warning if items unavailable

---

## 7. Market Intelligence Page

### MarketIntelligencePage.tsx
- [ ] **Update product names to brand names**
  - [ ] Display: "Sinar Line A4 Paper" (not "A4 Paper")
  - [ ] Use full brand names from API
- [ ] **Add three price layer display**
  - [ ] Current pricing section with 3 cards
  - [ ] Card 1: Regular Market Price
  - [ ] Card 2: Merkato Retailer Price
  - [ ] Card 3: Platform Direct Price
  - [ ] Use different colors for each
- [ ] **Update chart to show 3 lines**
  - [ ] Line 1: regularMarket (red)
  - [ ] Line 2: merkatoRetailer (orange)
  - [ ] Line 3: platformDirect (green)
  - [ ] Add legend
- [ ] **Update data structure**
  - [ ] Use monthly data (not weekly)
  - [ ] Display months as: Jul-24, Aug-25
  - [ ] Show 14 months of data

### Create 500CompaniesLossPage.tsx (NEW)
- [ ] **Create new page component**
  - [ ] Location: `src/pages/dashboard/CompanyLossAnalysisPage.tsx`
- [ ] **Display loss analysis overview**
  - [ ] Total companies analyzed
  - [ ] Total loss amount
  - [ ] Average loss per company
- [ ] **Show top losses table**
  - [ ] Company name, industry, loss amount
  - [ ] Bad procurement months
  - [ ] Best alternative months
- [ ] **Show product-specific analysis**
  - [ ] Product/brand name
  - [ ] Companies affected
  - [ ] Total loss for this product
- [ ] **Add methodology explanation**
- [ ] **Add to navigation**

### Market Intelligence Redux Slice
- [ ] **Update product interface**
  - [ ] Use brand names (not generic products)
  - [ ] Update current_pricing structure (3 prices)
  - [ ] Update data array structure (monthly, 3 prices per month)
- [ ] **Add lossAnalysis to state**
- [ ] **Add fetchLossAnalysis action**

---

## 8. Procurement Calendar Page

### ProcurementCalendarPage.tsx
- [ ] **Update product selector to brand selector**
  - [ ] Display brand names: "Sinar Line A4 Paper", "OSA HP Toner"
  - [ ] Update state: selectedProduct → selectedBrand
- [ ] **Verify comparative summary is ABOVE historical data**
  - [ ] Summary shows rankings (not concrete prices)
  - [ ] Uses terms: "Top Ranked", "Moderate", "Avoid Period"
  - [ ] Shows percentage differences
- [ ] **Verify metrics are INSIDE year cards**
  - [ ] 2026 Avg Price inside "Year 2026" section
  - [ ] Price Variance inside year section
  - [ ] Typical Weekly Rise inside year section
  - [ ] Typical Weekly Drop inside year section
- [ ] **Update endpoint call**
  - [ ] Change from /products to /brands
  - [ ] Update data structure handling

### Procurement Calendar Redux Slice
- [ ] **Rename to use brands**
  - [ ] products → brands
  - [ ] selectedProduct → selectedBrand
- [ ] **Update brand interface**
  - [ ] Match bi-monthly_data.json structure
  - [ ] yearlyMetrics with year, ethiopianYear, periods
  - [ ] seasonalRecommendations structure
  - [ ] adminRecommendation field

---

## 9. Notifications

### Navbar.tsx (Notification Bell)
- [ ] **Implement polling mechanism**
  - [ ] Add useEffect with setInterval (30 seconds)
  - [ ] Only poll when document.visibilityState === 'visible'
  - [ ] Clear interval on unmount
- [ ] **Add visibility change listener**
  - [ ] Fetch notifications when user returns to tab
  - [ ] Add event listener for visibilitychange
  - [ ] Clean up listener on unmount
- [ ] **Show browser notifications**
  - [ ] Check Notification.permission
  - [ ] Only show when tab is hidden
  - [ ] Only for high-priority notifications
  - [ ] Use notification.id as tag to prevent duplicates

### NotificationsPage.tsx
- [ ] **Mark as read on click**
  - [ ] Call PUT /api/notifications/:id/read
  - [ ] Update Redux immediately (don't wait for refetch)
  - [ ] Navigate to actionUrl if provided
- [ ] **Mark all as read button**
  - [ ] Call PUT /api/notifications/mark-all-read
  - [ ] Update all notifications in Redux
  - [ ] Set unreadCount to 0
- [ ] **Request browser permission**
  - [ ] Show prompt on first visit
  - [ ] Or add settings toggle
  - [ ] Store preference

### Notifications Redux Slice
- [ ] **Add state fields**
  - [ ] pollInterval: 30000
  - [ ] lastFetched timestamp
- [ ] **Update markAsRead action**
  - [ ] Update specific notification in list
  - [ ] Decrement unreadCount
- [ ] **Update markAllAsRead action**
  - [ ] Update all notifications to read: true
  - [ ] Set unreadCount to 0

---

## 10. App-wide Changes

### Routes Configuration
- [ ] **Add ProfilePage route**
  - [ ] Path: /dashboard/profile
- [ ] **Add BasketHistoryPage route**
  - [ ] Path: /dashboard/basket-history or separate tab
- [ ] **Add CompanyLossAnalysisPage route**
  - [ ] Path: /dashboard/company-loss-analysis

### Navigation/Sidebar
- [ ] **Add Profile link**
  - [ ] In user menu or settings section
- [ ] **Update Order History**
  - [ ] Either split into two menu items
  - [ ] Or add tabs within OrderHistoryPage
- [ ] **Add Company Loss Analysis link**
  - [ ] Under Market Intelligence section

### API Service Layer
- [ ] **Update axios interceptor**
  - [ ] Handle 401 errors
  - [ ] Call refresh token endpoint
  - [ ] Retry failed request
  - [ ] Force logout if refresh fails
- [ ] **Add request interceptor**
  - [ ] Add Authorization header with accessToken
  - [ ] Get token from Redux store

---

## 11. Data Structure Updates

### TypeScript Interfaces
- [ ] **Update User interface**
  - [ ] Add organizationType, phoneNumber, tinNumber
  - [ ] Update address to include addressType
- [ ] **Update Product interface**
  - [ ] Remove imageUrl, currentPrice
  - [ ] Add brands array
- [ ] **Update Brand interface**
  - [ ] Add imageUrl, price, inStock, stockQuantity
- [ ] **Update Basket interface**
  - [ ] Change products to brand
  - [ ] Add basketNumber
  - [ ] Update pricing (3 prices)
  - [ ] Update participants structure
  - [ ] Add completedSavings (optional)
- [ ] **Update Order interface**
  - [ ] Remove type, basketType
  - [ ] Update status type (4 values)
  - [ ] Add subtotal to items
  - [ ] Update savings structure
- [ ] **Create BasketOrder interface**
- [ ] **Update MarketProduct interface**
  - [ ] Update current_pricing (3 prices)
  - [ ] Update data array (monthly, 3 prices)
- [ ] **Create CompanyLossAnalysis interface**
- [ ] **Update ProcurementBrand interface**
  - [ ] Match bi-monthly structure

---

## 12. Mock Data Updates (For Testing)

### Create/Update Mock Data Files
- [ ] **Auth mock data**
  - [ ] src/data/auth/loginResponse.json
  - [ ] src/data/auth/registerResponse.json (with tokens)
  - [ ] src/data/auth/userProfile.json
- [ ] **Dashboard mock data**
  - [ ] src/data/dashboard/overview.json (updated structure)
- [ ] **Products mock data**
  - [ ] src/data/products/productsList.json (with brands)
  - [ ] src/data/products/searchResults.json (flattened)
- [ ] **Baskets mock data**
  - [ ] src/data/baskets/basketsList.json (one brand per basket)
- [ ] **Orders mock data**
  - [ ] src/data/orders/orderHistory.json (direct purchases only)
  - [ ] src/data/baskets/basketHistory.json (basket orders)
- [ ] **Market Intelligence mock data**
  - [ ] Already exists: src/data/marketData.json (verify structure)
  - [ ] Create: src/data/MI/500_companies_loss.json
- [ ] **Procurement Calendar mock data**
  - [ ] Already exists: src/data/MI/bi-monthly_data.json (verify)
- [ ] **Notifications mock data**
  - [ ] src/data/notifications/notificationsList.json

---

## 13. Redux Store Setup

### Store Configuration
- [ ] **Verify all slices imported**
  - [ ] authSlice
  - [ ] dashboardSlice
  - [ ] productsSlice
  - [ ] basketsSlice
  - [ ] ordersSlice
  - [ ] marketIntelligenceSlice
  - [ ] procurementCalendarSlice
  - [ ] notificationsSlice
- [ ] **Add Redux DevTools**
  - [ ] Enable for development
- [ ] **Add Redux Persist (Optional)**
  - [ ] Persist auth state
  - [ ] Whitelist specific reducers

---

## Testing Checklist (After Implementation)

### Manual Testing
- [ ] **Registration Flow**
  - [ ] Register new user
  - [ ] Verify redirects to dashboard (not login)
  - [ ] Verify tokens stored
  - [ ] Verify user info in Redux includes address
- [ ] **Login Flow**
  - [ ] Login with Remember Me checked
  - [ ] Login without Remember Me
  - [ ] Verify complete user profile loaded
- [ ] **Direct Purchase**
  - [ ] Browse products with brands
  - [ ] Add brands to cart
  - [ ] Create order without entering address
  - [ ] Verify order number format
- [ ] **Baskets**
  - [ ] View baskets (one brand each)
  - [ ] See three price comparison
  - [ ] Join basket
  - [ ] Update commitment
  - [ ] Leave basket
  - [ ] View completed basket with savings
- [ ] **Order History**
  - [ ] View direct purchase orders only
  - [ ] Filter by 4 statuses
  - [ ] See item subtotals
  - [ ] See two savings comparisons
  - [ ] Reorder
- [ ] **Basket History**
  - [ ] View basket orders separately
  - [ ] See basket numbers
  - [ ] See completed baskets only
- [ ] **Market Intelligence**
  - [ ] View brand names
  - [ ] See three price layers
  - [ ] View monthly chart with 3 lines
- [ ] **Procurement Calendar**
  - [ ] Select brand
  - [ ] See comparative summary on top
  - [ ] See metrics inside year cards
- [ ] **Notifications**
  - [ ] Verify polling every 30 seconds
  - [ ] Mark as read
  - [ ] Mark all as read
  - [ ] Browser notifications (when tab hidden)
- [ ] **Profile Edit**
  - [ ] Load current profile
  - [ ] Edit organization name
  - [ ] Edit address
  - [ ] Save and verify Redux updated

---

## Priority Order for Implementation

### Phase 1: Critical Changes (Do First)
1. Auth & Registration (changes affect all other pages)
2. Redux Slices (data structure foundation)
3. Mock Data (for testing without backend)

### Phase 2: Core Pages
4. Dashboard Overview
5. Direct Purchase
6. Basket System

### Phase 3: Additional Pages
7. Order History & Basket History
8. Profile Edit Page (NEW)
9. Market Intelligence & Loss Analysis

### Phase 4: Polish
10. Procurement Calendar (mostly correct already)
11. Notifications polling
12. Navigation & Routes

---

**Total Changes Required:** 150+  
**New Pages to Create:** 3  
**Existing Pages to Modify:** 10+  
**Redux Slices to Update:** 8  
**Mock Data Files to Create/Update:** 15+

---

**Ready to start implementation!** 🚀
