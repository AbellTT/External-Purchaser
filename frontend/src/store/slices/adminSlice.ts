import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AdminOrganization, AdminSupplier, Order, Basket } from '@/types/api'
import mockBasketsData from '@/data/baskets/basketsList.json'

// ==================== STATE INTERFACE ====================

export interface AdminStats {
  totalGmvEtb: number
  totalCapitalSavedEtb: number
  activeBasketsCount: number
  pendingOrdersCount: number
  pendingApprovalsCount: number
  totalOrganizationsCount: number
}

interface AdminState {
  stats: AdminStats
  organizations: AdminOrganization[]
  suppliers: AdminSupplier[]
  baskets: Basket[]
  orders: Order[]
  loading: boolean
  error: string | null
}

const initialOrganizations: AdminOrganization[] = [
  {
    id: 'org_001',
    name: 'Addis Ababa University (AAU)',
    type: 'University',
    email: 'AAU@edu.et',
    phone: '0911223344',
    tinNumber: '0123456789',
    city: 'Addis Ababa',
    subCity: 'Arada',
    registeredDate: '2026-01-15',
    verificationStatus: 'approved',
    totalSpendingEtb: 450000,
    totalOrdersCount: 14,
  },
  {
    id: 'org_002',
    name: 'Tabor Academy Primary School',
    type: 'School',
    email: 'tabor.info@school.et',
    phone: '0922334455',
    tinNumber: '0987654321',
    city: 'Addis Ababa',
    subCity: 'Bole',
    registeredDate: '2026-07-20',
    verificationStatus: 'pending',
    totalSpendingEtb: 85000,
    totalOrdersCount: 2,
  },
  {
    id: 'org_003',
    name: 'Save Children Ethiopia NGO',
    type: 'NGO',
    email: 'procurement@savechildren.org.et',
    phone: '0933445566',
    tinNumber: '0554433221',
    city: 'Addis Ababa',
    subCity: 'Kirkos',
    registeredDate: '2026-08-01',
    verificationStatus: 'pending',
    totalSpendingEtb: 0,
    totalOrdersCount: 0,
  },
  {
    id: 'org_004',
    name: 'Ministry of Education (MoE)',
    type: 'Government Office',
    email: 'procurement@moe.gov.et',
    phone: '0944556677',
    tinNumber: '0112233445',
    city: 'Addis Ababa',
    subCity: 'Arada',
    registeredDate: '2026-02-10',
    verificationStatus: 'approved',
    totalSpendingEtb: 1250000,
    totalOrdersCount: 28,
  },
]

const initialSuppliers: AdminSupplier[] = [
  {
    id: 'sup_001',
    name: 'Merkato Wholesale Paper & Import PLC',
    contactPerson: 'Ato Girma Tadesse',
    phoneNumber: '0911001122',
    locationInMerkato: 'Tana Supermarket area, Shop #14',
    suppliedCategories: ['Paper Products', 'Notebooks'],
    performanceRating: 4.8,
    negotiatedDiscountPercent: 18.5,
    totalFulfilledOrders: 142,
  },
  {
    id: 'sup_002',
    name: 'Addis Stationery Importers',
    contactPerson: 'W/ro Selamawit Bekele',
    phoneNumber: '0922112233',
    locationInMerkato: 'Bomb Tera, Building B2',
    suppliedCategories: ['Pens & Markers', 'Staplers & Office Tools'],
    performanceRating: 4.6,
    negotiatedDiscountPercent: 15.0,
    totalFulfilledOrders: 98,
  },
  {
    id: 'sup_003',
    name: 'Ethio Toner & Office Electronics',
    contactPerson: 'Ato Solomon Kebede',
    phoneNumber: '0933223344',
    locationInMerkato: 'Somali Tera, Block 4',
    suppliedCategories: ['Toner & Cartridges'],
    performanceRating: 4.9,
    negotiatedDiscountPercent: 22.0,
    totalFulfilledOrders: 65,
  },
]

const initialOrders: Order[] = [
  {
    id: 'ord_adm_101',
    orderNumber: 'ORD-2026-8812',
    date: '2026-08-12',
    status: 'pending',
    items: [
      { productName: 'Siner Line A4 Paper', brandName: 'Siner Line', quantity: 50, unit: 'ream', price: 650, subtotal: 32500 },
      { productName: 'OSA HP Toner', brandName: 'OSA', quantity: 4, unit: 'cartridge', price: 2800, subtotal: 11200 },
    ],
    pricing: { itemsTotal: 43700, deliveryFee: 500, discount: 4500, total: 39700 },
    delivery: { address: 'AASTU Campus, Tulu Dimtu, Addis Ababa', estimatedDate: '2026-08-15', actualDate: null },
    savings: { vsMerkatoRetailer: { amount: 5200, percentage: 11.5 }, vsRegularStationaryMarket: { amount: 8900, percentage: 18.3 } },
  },
  {
    id: 'ord_adm_102',
    orderNumber: 'ORD-2026-8813',
    date: '2026-08-11',
    status: 'accepted',
    items: [
      { productName: 'Box File KENT', brandName: 'KENT', quantity: 120, unit: 'piece', price: 220, subtotal: 26400 },
    ],
    pricing: { itemsTotal: 26400, deliveryFee: 400, discount: 2400, total: 24400 },
    delivery: { address: 'Bole Sub City, School Block B', estimatedDate: '2026-08-14', actualDate: null },
    savings: { vsMerkatoRetailer: { amount: 3600, percentage: 12.8 }, vsRegularStationaryMarket: { amount: 6200, percentage: 20.2 } },
  },
  {
    id: 'ord_adm_103',
    orderNumber: 'ORD-2026-8814',
    date: '2026-08-10',
    status: 'out-for-delivery',
    items: [
      { productName: 'Marker', brandName: 'Pelikan', quantity: 200, unit: 'box', price: 180, subtotal: 36000 },
    ],
    pricing: { itemsTotal: 36000, deliveryFee: 300, discount: 4000, total: 32300 },
    delivery: { address: 'Arada Sub City, MoE HQ', estimatedDate: '2026-08-13', actualDate: null },
    savings: { vsMerkatoRetailer: { amount: 4800, percentage: 12.9 }, vsRegularStationaryMarket: { amount: 8100, percentage: 20.1 } },
  },
]

const initialState: AdminState = {
  stats: {
    totalGmvEtb: 4250000,
    totalCapitalSavedEtb: 780000,
    activeBasketsCount: (mockBasketsData as any)?.data?.baskets?.length || 4,
    pendingOrdersCount: 2,
    pendingApprovalsCount: 2,
    totalOrganizationsCount: 4,
  },
  organizations: initialOrganizations,
  suppliers: initialSuppliers,
  baskets: (mockBasketsData as any)?.data?.baskets || [],
  orders: initialOrders,
  loading: false,
  error: null,
}

// ==================== SLICE ====================

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Approve organization registration
    approveOrganization: (state, action: PayloadAction<string>) => {
      const org = state.organizations.find(o => o.id === action.payload)
      if (org) {
        org.verificationStatus = 'approved'
        state.stats.pendingApprovalsCount = Math.max(0, state.stats.pendingApprovalsCount - 1)
      }
    },

    // Suspend organization account
    suspendOrganization: (state, action: PayloadAction<string>) => {
      const org = state.organizations.find(o => o.id === action.payload)
      if (org) {
        org.verificationStatus = 'suspended'
      }
    },

    // Update order status
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order['status']; deliveryDate?: string }>
    ) => {
      const order = state.orders.find(o => o.id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
        if (action.payload.deliveryDate) {
          order.delivery.estimatedDate = action.payload.deliveryDate
        }
        if (action.payload.status === 'delivered') {
          order.delivery.actualDate = new Date().toISOString().split('T')[0]
        }
      }
    },

    // Create new procurement basket
    createBasket: (state, action: PayloadAction<Partial<Basket>>) => {
      const newBasket: Basket = {
        id: `bsk_adm_${Date.now()}`,
        basketNumber: `BSK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: action.payload.name || 'New Bulk Basket',
        type: action.payload.type || 'monthly',
        status: 'active',
        brand: action.payload.brand || {
          brandId: 'b_custom',
          brandName: 'Standard Brand',
          productId: 'p_custom',
          productName: 'Stationery Product',
          productUnit: 'unit',
          brandImageUrl: '',
        },
        pricing: action.payload.pricing || {
          basketPrice: 500,
          merkato_retailer_price: 650,
          regular_stationary_market_price: 700,
        },
        timeline: action.payload.timeline || {
          startDate: new Date().toISOString().split('T')[0],
          endDate: '2026-08-31',
          deliveryDate: '2026-09-05',
          daysRemaining: 18,
        },
        participation: action.payload.participation || {
          participants: [],
          totalParticipants: 0,
          totalCommitment: 0,
          currentCommitment: 0,
          minCommitment: 100,
          maxCommitment: 2000,
        },
        userParticipation: { isParticipating: false, commitment: null, joinedDate: null },
      }

      state.baskets.unshift(newBasket)
      state.stats.activeBasketsCount += 1
    },

    // Update basket status (close, extend, cancel)
    updateBasketStatus: (
      state,
      action: PayloadAction<{ basketId: string; status: 'active' | 'completed' | 'cancelled' }>
    ) => {
      const basket = state.baskets.find(b => b.id === action.payload.basketId)
      if (basket) {
        basket.status = action.payload.status
        if (action.payload.status === 'completed') {
          state.stats.activeBasketsCount = Math.max(0, state.stats.activeBasketsCount - 1)
        }
      }
    },

    // Fulfill basket: lock it and record Babi Platform Price + Supplier Cost
    fulfillBasket: (
      state,
      action: PayloadAction<{ basketId: string; babiPlatformPrice: number; supplierCost: number }>
    ) => {
      const basket = state.baskets.find(b => b.id === action.payload.basketId)
      if (basket) {
        basket.status = 'completed'
        basket.pricing.babiPlatformPrice = action.payload.babiPlatformPrice
        basket.pricing.supplierCost = action.payload.supplierCost
        state.stats.activeBasketsCount = Math.max(0, state.stats.activeBasketsCount - 1)
      }
    },

    // Add new wholesale supplier
    addSupplier: (state, action: PayloadAction<Omit<AdminSupplier, 'id'>>) => {
      const newSupplier: AdminSupplier = {
        ...action.payload,
        id: `sup_${Date.now()}`,
      }
      state.suppliers.unshift(newSupplier)
    },
  },
})

// ==================== ACTIONS ====================

export const {
  approveOrganization,
  suspendOrganization,
  updateOrderStatus,
  createBasket,
  updateBasketStatus,
  fulfillBasket,
  addSupplier,
} = adminSlice.actions

// ==================== SELECTORS ====================

export const selectAdminStats = (state: { admin: AdminState }) => state.admin.stats
export const selectAdminOrganizations = (state: { admin: AdminState }) => state.admin.organizations
export const selectAdminSuppliers = (state: { admin: AdminState }) => state.admin.suppliers
export const selectAdminBaskets = (state: { admin: AdminState }) => state.admin.baskets
export const selectActiveBaskets = (state: { admin: AdminState }) =>
  state.admin.baskets.filter(b => b.status === 'active')
export const selectHistoryBaskets = (state: { admin: AdminState }) =>
  state.admin.baskets.filter(b => b.status === 'completed' || b.status === 'cancelled')
export const selectAdminOrders = (state: { admin: AdminState }) => state.admin.orders
export const selectAdminLoading = (state: { admin: AdminState }) => state.admin.loading

export default adminSlice.reducer
