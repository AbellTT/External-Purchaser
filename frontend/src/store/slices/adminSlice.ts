import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AdminOrganization, AdminSupplier, Order, Basket } from '@/types/api'
import { adminApi } from '@/lib/adminApi'
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

const initialState: AdminState = {
  stats: {
    totalGmvEtb: 0,
    totalCapitalSavedEtb: 0,
    activeBasketsCount: 0,
    pendingOrdersCount: 0,
    pendingApprovalsCount: 0,
    totalOrganizationsCount: 0,
  },
  organizations: [],
  suppliers: initialSuppliers,
  baskets: (mockBasketsData as any)?.data?.baskets || [],
  orders: [],
  loading: false,
  error: null,
}

export const fetchAdminOverview = createAsyncThunk(
  'admin/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/organizations/admin/overview/')
      return response.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch admin overview.')
    }
  }
)

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
  extraReducers: (builder) => {
    builder.addCase(fetchAdminOverview.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchAdminOverview.fulfilled, (state, action) => {
      state.loading = false
      state.stats = action.payload.stats || state.stats
      state.organizations = action.payload.pendingOrganizations || []
      state.orders = action.payload.recentOrders || []
    })
    builder.addCase(fetchAdminOverview.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
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
