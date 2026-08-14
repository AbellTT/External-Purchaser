# Frontend Implementation Plan

**Date:** 2026-08-06  
**Total Changes:** 150+  
**Estimated Time:** Multiple sessions

---

## Implementation Strategy

Given the scope of changes (150+), I'll implement them in phases, with each phase delivering working functionality.

---

## Phase 1: Foundation (CRITICAL - Start Here)

### Priority 1A: TypeScript Interfaces
**Why First:** These define the data structures everything else depends on

Files to create/update:
- `src/types/auth.ts` - User, Address, Login/Register responses
- `src/types/products.ts` - Product, Brand interfaces
- `src/types/baskets.ts` - Basket, Participant interfaces  
- `src/types/orders.ts` - Order, OrderItem, BasketOrder interfaces
- `src/types/marketIntelligence.ts` - MarketProduct, LossAnalysis interfaces
- `src/types/procurementCalendar.ts` - ProcurementBrand interface
- `src/types/notifications.ts` - Notification interface

### Priority 1B: Mock Data Files
**Why Second:** Allows testing without backend

Files to create:
- `src/data/auth/loginResponse.json`
- `src/data/auth/registerResponse.json`
- `src/data/dashboard/overview.json`
- `src/data/products/productsList.json`
- `src/data/baskets/basketsList.json`
- `src/data/orders/orderHistory.json`
- `src/data/baskets/basketHistory.json`
- `src/data/MI/500_companies_loss.json`
- `src/data/notifications/notificationsList.json`

### Priority 1C: Redux Store Setup
**Why Third:** State management foundation

Files to create/update:
- `src/store/index.ts` - Store configuration
- `src/store/slices/authSlice.ts` - Auth with new fields
- `src/store/slices/dashboardSlice.ts` - Updated structure
- `src/store/slices/productsSlice.ts` - Products → Brands
- `src/store/slices/basketsSlice.ts` - One brand per basket
- `src/store/slices/ordersSlice.ts` - Separate history
- `src/store/slices/marketIntelligenceSlice.ts` - 3 prices
- `src/store/slices/procurementCalendarSlice.ts` - Brands
- `src/store/slices/notificationsSlice.ts` - Polling

---

## Phase 2: Authentication Pages (High Priority)

### Files to modify:
1. **`src/pages/Signup.tsx`**
   - ✅ Already redirects to dashboard (VERIFIED)
   - Need to add: Store tokens in Redux after registration
   - Need to add: Store complete user profile

2. **`src/pages/Login.tsx`**
   - Add Remember Me checkbox
   - Store complete profile in Redux
   - Remove role handling (if exists)

3. **`src/store/slices/authSlice.ts`**
   - Update state structure
   - Add rememberMe field
   - Update user interface
   - Handle registration token response

---

## Phase 3: Dashboard Overview (High Priority)

### Files to modify:
1. **`src/pages/dashboard/DashboardHome.tsx`**
   - Remove separate recentOrders display
   - Derive from activeOrders
   - Update status handling (4 statuses only)
   - Add basket fill progress display
   - Update savings display (vs Merkato only)
   - Show brand names in price alerts

2. **`src/store/slices/dashboardSlice.ts`**
   - Remove recentOrders field
   - Update structure per API spec
   - Add selectors

---

## Phase 4: Direct Purchase (High Priority)

### Files to modify:
1. **`src/pages/dashboard/DirectPurchasePage.tsx`**
   - Update product display (show brands array)
   - Update search results (flattened brands)
   - Remove address input from order form
   - Use address from Redux

2. **`src/store/slices/productsSlice.ts`**
   - Update Product interface
   - Add brands array
   - Update search results structure

3. **`src/store/slices/ordersSlice.ts`**
   - Add order creation action
   - Update Redux after order created

---

## Phase 5: Basket System (High Priority)

### Files to modify:
1. **`src/pages/dashboard/BasketSystemPage.tsx`**
   - Show single brand (not products array)
   - Remove targetPrice
   - Add 3 price comparison
   - Show participant names
   - Show savings only when completed
   - Update basket number format

2. **`src/store/slices/basketsSlice.ts`**
   - Update Basket interface
   - Handle updatedBasket in join/update/leave responses
   - Optimistic updates

---

## Phase 6: Order & Basket History (Medium Priority)

### Files to modify/create:
1. **`src/pages/dashboard/OrderHistoryPage.tsx`**
   - Remove type filter
   - Update status filter (4 statuses)
   - Show item subtotals
   - Show 2 savings comparisons

2. **`src/pages/dashboard/BasketHistoryPage.tsx`** (NEW)
   - Create new page
   - Display basket order history
   - Show basket number format
   - Show brand info and savings

3. **`src/store/slices/ordersSlice.ts`**
   - Add basketHistory array
   - Update Order interface
   - Create BasketOrder interface
   - Add fetchBasketHistory action

---

## Phase 7: Profile Edit Page (Medium Priority)

### Files to create:
1. **`src/pages/dashboard/ProfilePage.tsx`** (NEW)
   - Create form with all editable fields
   - Address editing section
   - Form submission handler

2. **`src/store/slices/authSlice.ts`**
   - Add fetchUserProfile action
   - Add updateUserProfile action

3. **Routes & Navigation**
   - Add route to App.tsx
   - Add navigation link

---

## Phase 8: Market Intelligence (Medium Priority)

### Files to modify/create:
1. **`src/pages/dashboard/MarketIntelligencePage.tsx`**
   - Update to show brand names
   - Add 3 price layer cards
   - Update chart (3 lines)
   - Use monthly data

2. **`src/pages/dashboard/CompanyLossAnalysisPage.tsx`** (NEW)
   - Create new page
   - Display loss analysis

3. **`src/store/slices/marketIntelligenceSlice.ts`**
   - Update product interface
   - Add lossAnalysis state
   - Add fetchLossAnalysis action

---

## Phase 9: Procurement Calendar (Low Priority - Mostly Correct)

### Files to verify/modify:
1. **`src/pages/dashboard/ProcurementCalendarPage.tsx`**
   - ✅ Already mostly correct
   - Verify: Summary above historical data
   - Verify: Metrics inside year cards
   - Update: selectedProduct → selectedBrand

2. **`src/store/slices/procurementCalendarSlice.ts`**
   - Rename products → brands
   - Update interface

---

## Phase 10: Notifications (Low Priority)

### Files to modify:
1. **`src/components/landing/Navbar.tsx`** or notification bell component
   - Add polling useEffect (30 seconds)
   - Add visibility change listener
   - Add browser notifications

2. **`src/pages/dashboard/NotificationsPage.tsx`**
   - Mark as read on click
   - Mark all as read button
   - Browser permission request

3. **`src/store/slices/notificationsSlice.ts`**
   - Add pollInterval
   - Update markAsRead action
   - Update markAllAsRead action

---

## Phase 11: Routes & Navigation

### Files to modify:
1. **`src/App.tsx`** or router config
   - Add ProfilePage route
   - Add BasketHistoryPage route
   - Add CompanyLossAnalysisPage route

2. **`src/components/dashboard/DashboardLayout.tsx`** or sidebar
   - Add Profile link
   - Update Order History (add Basket History)
   - Add Company Loss Analysis link

---

## Phase 12: API Service Layer

### Files to create/modify:
1. **`src/lib/api.ts`** or API service
   - Add axios instance
   - Add request interceptor (auth header)
   - Add response interceptor (handle 401)
   - Add refresh token logic

---

## Quick Win Tasks (Can be done anytime)

These are small, independent changes that can be completed quickly:

- [ ] Update order number display format in any component showing orders
- [ ] Update basket number display format
- [ ] Update status badge colors (only 4 statuses)
- [ ] Add brand name to price alerts
- [ ] Update any hardcoded mock data to match new structures

---

## Recommended Implementation Order

**Week 1: Foundation + Auth**
- Day 1-2: TypeScript interfaces + Mock data
- Day 3-4: Redux slices (all 8)
- Day 5: Login.tsx updates + Auth testing

**Week 2: Core Pages**
- Day 1: Dashboard Overview
- Day 2-3: Direct Purchase
- Day 4-5: Basket System

**Week 3: Additional Pages**
- Day 1-2: Order History + Basket History
- Day 3: Profile Edit Page
- Day 4-5: Market Intelligence + Loss Analysis

**Week 4: Polish & Integration**
- Day 1: Procurement Calendar updates
- Day 2: Notifications polling
- Day 3-4: Routes, Navigation, API layer
- Day 5: Testing & bug fixes

---

## Testing Strategy

After each phase:
1. **Unit Tests**: Redux slices
2. **Component Tests**: Page components
3. **Integration Tests**: Full user flows
4. **Manual Testing**: Use checklist

---

## Risk Management

### High Risk Areas:
1. **Redux State Migration**: Old state → New state
   - **Mitigation**: Clear localStorage, fresh start
2. **Type Errors**: Changed interfaces
   - **Mitigation**: Fix TypeScript errors incrementally
3. **Mock Data Sync**: Mock data must match API spec
   - **Mitigation**: Validate mock data against types

### Rollback Plan:
- Keep git commits small and focused
- Each phase should be a separate commit
- Can rollback to any phase if issues arise

---

## Success Criteria

### Phase Complete When:
- [ ] All TypeScript errors resolved
- [ ] All unit tests passing
- [ ] Manual testing checklist items checked
- [ ] No console errors
- [ ] UI displays correctly
- [ ] Redux DevTools shows correct state structure

### Project Complete When:
- [ ] All 150+ checklist items completed
- [ ] All new pages created and routed
- [ ] All Redux slices updated
- [ ] All mock data created
- [ ] Full user flows working end-to-end
- [ ] Ready for backend integration

---

## Notes

- **Don't skip Phase 1**: Everything depends on correct types and Redux
- **Use mock data**: Don't wait for backend
- **Test incrementally**: After each phase
- **Keep checklist updated**: Mark items as done
- **Ask for help**: If stuck on any item

---

**Ready to begin Phase 1!** 🚀
