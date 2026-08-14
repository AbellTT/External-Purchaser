// API Response Types based on BACKEND_API_REQUIREMENTS.md

// ==================== AUTH TYPES ====================

export interface Address {
  addressType: 'autocomplete' | 'manual'
  addressFormatted: string | null
  street: string | null
  subCity: string | null
  area: string | null
  city: string
  region: string
}

export interface User {
  id: string
  email: string
  organizationName: string
  organizationType: 'School' | 'University' | 'Government Office' | 'NGO' | 'Private Company' | 'Bank & Financial Institution' | 'Hospital & Health Centre'
  phoneNumber: string
  tinNumber: string
  address: Address
  role?: 'admin' | 'user'
  verificationStatus?: 'pending' | 'approved' | 'suspended'
}

// ==================== SUPER ADMIN MANAGEMENT TYPES ====================

export interface AdminSupplier {
  id: string
  name: string
  contactPerson: string
  phoneNumber: string
  locationInMerkato: string
  suppliedCategories: string[]
  performanceRating: number // 1-5
  negotiatedDiscountPercent: number
  totalFulfilledOrders: number
}

export interface AdminOrganization {
  id: string
  name: string
  type: string
  email: string
  phone: string
  tinNumber: string
  city: string
  subCity: string
  registeredDate: string
  verificationStatus: 'pending' | 'approved' | 'suspended'
  totalSpendingEtb: number
  totalOrdersCount: number
}

export interface AdminCreateBasketRequest {
  name: string
  type: 'weekly' | 'monthly' | '6-month'
  brandName: string
  productName: string
  productUnit: string
  basketPrice: number
  merkatoRetailerPrice: number
  regularMarketPrice: number
  targetQuantity: number
  startDate: string
  endDate: string
  deliveryDate: string
}

export interface AdminUpdateOrderStatusRequest {
  orderId: string
  status: 'pending' | 'accepted' | 'out-for-delivery' | 'delivered'
  estimatedDeliveryDate?: string
  deliveryDriverNotes?: string
}

export interface AdminUpdatePriceRequest {
  productId: string
  brandId?: string
  merkatoRetailerPrice: number
  platformDirectPrice: number
  supplierWholesalePrice?: number
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  // Step 1: Organization Details
  organizationName: string
  organizationType: string
  phoneNumber: string
  tinNumber: string
  
  // Step 2: Address Information
  addressType: 'autocomplete' | 'manual'
  addressFormatted?: string
  street?: string
  subCity?: string
  area?: string
  city: string
  region: string
  
  // Step 3: Account Credentials
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
  }
}

// ==================== DASHBOARD TYPES ====================

export interface TotalSavings {
  amount: number
  percentage: number
  trend: 'up' | 'down'
  comparedTo: string
}

export interface ActiveOrder {
  id: string
  orderNumber: string
  date: string
  status: 'delivered' | 'out-for-delivery' | 'pending' | 'accepted'
  type?: 'direct' | 'basket'
  items: OrderItem[]
  pricing: OrderPricing
  delivery: OrderDelivery
  savings: OrderSavings
}

export interface ActiveOrders {
  count: number
  totalValue: number
  orders: ActiveOrder[]
}

export interface BasketParticipation {
  activeBaskets: number
  totalCommitted: number
  upcomingDeliveries: number
  baskets: Array<{
    id: string
    name: string
    type: 'weekly' | 'monthly' | '6-month'
    yourCommitment: number
    deliveryDate: string
    status: 'active' | 'closing_soon'
    fillProgress: {
      current: number
      target: number
      percentage: number
    }
  }>
}

export interface AvgDiscountRate {
  yourAverage: number
  calculation: {
    directPurchaseSavings: number
    basketSavings: number
    merkato_avg: number
  }
}

export interface PriceAlert {
  productId: string
  productName: string
  brandName: string
  priceChange: number
  direction: 'up' | 'down'
  currentPrice: number
  previousPrice: number
  userPurchaseHistory: {
    lastPurchased: string
    avgPrice: number
  }
}

export interface DashboardOverview {
  totalSavings: TotalSavings
  activeOrders: ActiveOrders
  basketParticipation: BasketParticipation
  avgDiscountRate: AvgDiscountRate
  priceAlerts: PriceAlert[]
}

export interface DashboardOverviewResponse {
  success: boolean
  data: DashboardOverview
}

// ==================== PRODUCTS TYPES ====================

export interface Brand {
  id: string
  name: string
  imageUrl: string
  inStock: boolean
  stockQuantity: number
  price: number // Direct Purchase Price
  merkatoRetailerPrice?: number
  regularMarketPrice?: number
  babiPlatformPrice?: number | null // Auto-filled on basket completion
  supplierCost?: number | null // Auto-filled on basket completion
}

export interface Product {
  id: string
  name: string
  category: string
  unit: string
  inStock: boolean
  brands: Brand[]
  merkatoRetailerPrice?: number
  regularMarketPrice?: number
  directPurchasePrice?: number
  babiPlatformPrice?: number | null
  supplierCost?: number | null
}

export interface ProductsResponse {
  success: boolean
  data: {
    products: Product[]
  }
}

export interface SearchResult {
  productId: string
  productName: string
  productCategory: string
  brandId: string
  brandName: string
  brandImageUrl: string
  price: number
  inStock: boolean
}

export interface SearchResponse {
  success: boolean
  data: {
    results: SearchResult[]
  }
}

// ==================== ORDERS TYPES ====================

export interface OrderItem {
  productName: string
  brandName: string
  quantity: number
  unit: string
  price: number
  subtotal: number
}

export interface OrderPricing {
  itemsTotal: number
  deliveryFee: number
  discount: number
  total: number
}

export interface OrderDelivery {
  address: string
  estimatedDate: string
  actualDate: string | null
}

export interface OrderSavings {
  vsMerkatoRetailer: {
    amount: number
    percentage: number
  }
  vsRegularStationaryMarket: {
    amount: number
    percentage: number
  }
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'accepted' | 'out-for-delivery' | 'delivered'
  items: OrderItem[]
  pricing: OrderPricing
  delivery: OrderDelivery
  savings: OrderSavings
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string
    brandId: string
    quantity: number
    price: number
  }>
  notes?: string
}

export interface CreateDirectPurchaseRequest {
  items: Array<{
    productId: string
    brandId: string
    quantity: number
    price: number
  }>
  notes?: string
}

export interface CreateOrderResponse {
  success: boolean
  data: {
    orderId: string
    orderNumber: string
    total: number
    status: 'pending'
  }
}

export interface OrderHistoryResponse {
  success: boolean
  data: {
    orders: Order[]
    pagination: {
      currentPage: number
      totalPages: number
      totalOrders: number
      hasMore: boolean
    }
  }
}

// ==================== BASKETS TYPES ====================

export interface BasketBrand {
  brandId: string
  brandName: string
  productId: string
  productName: string
  productUnit: string
  brandImageUrl: string
}

export interface BasketPricing {
  basketPrice: number
  merkato_retailer_price: number
  regular_stationary_market_price: number
  babiPlatformPrice?: number | null  // Auto-filled when basket completes (negotiated bulk price shown to users)
  supplierCost?: number | null        // Auto-filled when basket completes (actual Merkato wholesale cost)
}

export interface BasketTimeline {
  startDate: string
  endDate: string
  deliveryDate: string
  daysRemaining: number
}

export interface BasketCommitment {
  quantity: number
  totalValue: number
}

export interface BasketParticipant {
  organizationName: string
  commitment: number
  joinedDate: string
  address?: string
}

export interface BasketParticipationInfo {
  participants: BasketParticipant[]
  totalParticipants: number
  totalCommitment: number
  currentCommitment: number
  minCommitment: number
  maxCommitment: number
}

export interface UserBasketParticipation {
  isParticipating: boolean
  commitment: number | null
  joinedDate: string | null
}

export interface CompletedSavings {
  vsMerkatoRetailer: number
  vsRegularStationaryMarket: number
}

export interface Basket {
  id: string
  basketNumber: string
  name: string
  type: 'weekly' | 'monthly' | '6-month'
  status: 'active' | 'completed' | 'cancelled'
  brand: BasketBrand
  pricing: BasketPricing
  timeline: BasketTimeline
  participation: BasketParticipationInfo
  userParticipation: UserBasketParticipation
  completedSavings?: CompletedSavings
}

export interface CompletedBasket extends Basket {
  completedSavings: CompletedSavings
}

export interface BasketsResponse {
  success: boolean
  data: {
    baskets: Basket[]
  }
}

export interface JoinBasketRequest {
  commitment: number
}

export interface JoinBasketResponse {
  success: boolean
  data: {
    basketId: string
    basketNumber: string
    yourCommitment: number
    updatedBasket: Basket
  }
}

// ==================== NOTIFICATIONS TYPES ====================

export interface NotificationMetadata {
  orderId?: string
  basketId?: string
  productId?: string
  brandId?: string
  actionUrl?: string
}

export interface Notification {
  id: string
  type: 'order_update' | 'basket_closing' | 'price_alert' | 'delivery' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata: NotificationMetadata
}

export interface NotificationsResponse {
  success: boolean
  data: {
    notifications: Notification[]
    unreadCount: number
  }
}

// ==================== MARKET INTELLIGENCE TYPES ====================

export interface MarketDataPoint {
  date: string
  price: number
  source: string
}

export interface CompanyLossData {
  companyId: string
  companyName: string
  totalLoss: number
  lossPercentage: number
  badPurchases: number
  potentialSavings: number
}

export interface CurrentPricing {
  regularMarketPrice: number
  merkatoRetailerPrice: number
  platformDirectPrice: number
}

export interface MonthlyData {
  month: string
  regularMarket: number
  merkatoRetailer: number
  platformDirect: number
}

export interface BiMonthlyMetric {
  period: string
  average_price_etb: {
    min: number
    max: number
    citation?: string
  }
  weekly_increase_etb: {
    min: number
    max: number
    citation?: string
  }
  weekly_discount_etb: {
    min: number
    max: number
    citation?: string
  }
}

export interface WeeklyHistory {
  week: string
  price: number | null
}

export interface MarketProduct {
  id: string
  name: string
  name_amharic?: string
  unit: string
  category: string
  file_reference?: string
  source_citation?: string
  current_pricing: CurrentPricing
  weeklyHistory?: WeeklyHistory[]
  bi_monthly_metrics: BiMonthlyMetric[]
  data?: MonthlyData[]
}

export interface MarketIntelligenceResponse {
  success: boolean
  data: {
    products: MarketProduct[]
  }
}

// ==================== PROCUREMENT CALENDAR TYPES ====================

export interface ProcurementEvent {
  id: string
  title: string
  description?: string
  date: string
  type: 'basket' | 'order' | 'deadline' | 'reminder'
  relatedId?: string | null
}

export interface BiMonthlyPeriod {
  period: string
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
}

export interface YearlyMetrics {
  year: number
  ethiopianYear: number
  periods: BiMonthlyPeriod[]
}

export interface BiMonthlyData {
  yearlyMetrics: YearlyMetrics[]
  sourceReference?: string
}

export interface SeasonalRecommendations {
  bestSeason: string
  secondBestSeason: string
  worstSeason: string
  guidance: string
}

export interface ProcurementBrand {
  id: string
  name: string
  name_amharic: string
  productCategory: string
  hasHistoricalData: boolean
  biMonthlyData?: BiMonthlyData
  seasonalRecommendations?: SeasonalRecommendations
  adminRecommendation: string
}

export interface ProcurementCalendarResponse {
  success: boolean
  data: {
    brands: ProcurementBrand[]
  }
}

// ==================== API ERROR TYPES ====================

export interface ApiError {
  success: false
  error: string
  message?: string
  statusCode?: number
}
