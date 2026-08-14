import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Product, Brand, CreateDirectPurchaseRequest, CreateOrderResponse } from '@/types/api'
import { api } from '@/lib/api'
import productsMock from '@/data/products/productsList.json'

// ==================== STATE INTERFACE ====================

interface ProductsState {
  products: Product[]
  searchResults: Product[]
  selectedProduct: Product | null
  loading: boolean
  searchLoading: boolean
  orderLoading: boolean
  orderResult: CreateOrderResponse['data'] | null
  error: string | null
  filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
  }
}

const initialMockProducts = productsMock.data.products as unknown as Product[]

const initialState: ProductsState = {
  products: initialMockProducts,
  searchResults: [],
  selectedProduct: null,
  loading: false,
  searchLoading: false,
  orderLoading: false,
  orderResult: null,
  error: null,
  filters: {},
}

// ==================== ASYNC THUNKS ====================

/**
 * Fetch all products with optional filters
 * Falls back to mock data if API call fails in dev/mock environment
 */
export const fetchProducts = createAsyncThunk<
  Product[],
  { category?: string; minPrice?: number; maxPrice?: number } | void
>(
  'products/fetchProducts',
  async (filters) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.category) params.append('category', filters.category)
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      }

      const response = await api.get<{ success: boolean; data: { products: Product[] } | Product[] }>(
        `/products?${params.toString()}`
      )
      
      const data = response.data.data
      if (Array.isArray(data)) {
        return data
      } else if (data && Array.isArray(data.products)) {
        return data.products
      }
      return initialMockProducts
    } catch {
      // Dev/Mock environment fallback
      return initialMockProducts
    }
  }
)

/**
 * Search products by query
 */
export const searchProducts = createAsyncThunk<Product[], string>(
  'products/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: Product[] }>(
        `/products/search?q=${encodeURIComponent(query)}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Search failed')
    }
  }
)

/**
 * Fetch single product by ID
 */
export const fetchProductById = createAsyncThunk<Product, string>(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: Product }>(
        `/products/${productId}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product')
    }
  }
)

/**
 * Create Direct Purchase Order
 */
export const createDirectPurchaseOrder = createAsyncThunk<
  CreateOrderResponse['data'],
  CreateDirectPurchaseRequest
>(
  'products/createDirectPurchaseOrder',
  async (orderData) => {
    try {
      const response = await api.post<CreateOrderResponse>(
        '/orders/direct-purchase',
        orderData
      )
      return response.data.data
    } catch {
      // Dev/Mock environment fallback
      const total = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const randomId = Math.floor(1000 + Math.random() * 9000)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '/')
      return {
        orderId: `ord_${Date.now()}`,
        orderNumber: `ORD-${dateStr}-${randomId}`,
        total,
        status: 'pending' as const,
      }
    }
  }
)

// ==================== SLICE ====================

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null
    },
    clearOrderResult: (state) => {
      state.orderResult = null
    },
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    // Super Admin: Add new product
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload)
    },
    // Super Admin: Add new brand to an existing product
    addBrandToProduct: (state, action: PayloadAction<{ productId: string; brand: Brand }>) => {
      const prod = state.products.find(p => p.id === action.payload.productId)
      if (prod) {
        prod.brands.push(action.payload.brand)
        if (action.payload.brand.inStock) {
          prod.inStock = true
        }
      }
    },
    // Super Admin: Update product/brand prices
    updateProductPrices: (
      state,
      action: PayloadAction<{
        productId: string
        brandId?: string
        regularMarketPrice?: number
        merkatoRetailerPrice?: number
        directPurchasePrice?: number
        babiPlatformPrice?: number | null
        supplierCost?: number | null
      }>
    ) => {
      const {
        productId,
        brandId,
        regularMarketPrice,
        merkatoRetailerPrice,
        directPurchasePrice,
        babiPlatformPrice,
        supplierCost,
      } = action.payload

      const prod = state.products.find(p => p.id === productId)
      if (prod) {
        if (regularMarketPrice !== undefined) prod.regularMarketPrice = regularMarketPrice
        if (merkatoRetailerPrice !== undefined) prod.merkatoRetailerPrice = merkatoRetailerPrice
        if (directPurchasePrice !== undefined) prod.directPurchasePrice = directPurchasePrice
        if (babiPlatformPrice !== undefined) prod.babiPlatformPrice = babiPlatformPrice
        if (supplierCost !== undefined) prod.supplierCost = supplierCost

        if (brandId) {
          const brand = prod.brands.find(b => b.id === brandId)
          if (brand) {
            if (directPurchasePrice !== undefined) brand.price = directPurchasePrice
            if (regularMarketPrice !== undefined) brand.regularMarketPrice = regularMarketPrice
            if (merkatoRetailerPrice !== undefined) brand.merkatoRetailerPrice = merkatoRetailerPrice
            if (babiPlatformPrice !== undefined) brand.babiPlatformPrice = babiPlatformPrice
            if (supplierCost !== undefined) brand.supplierCost = supplierCost
          }
        }
      }
    },
    // Super Admin: Update brand stock quantity and inStock status
    updateBrandStock: (
      state,
      action: PayloadAction<{ productId: string; brandId: string; stockQuantity: number; inStock: boolean }>
    ) => {
      const prod = state.products.find(p => p.id === action.payload.productId)
      if (prod) {
        const brand = prod.brands.find(b => b.id === action.payload.brandId)
        if (brand) {
          brand.stockQuantity = action.payload.stockQuantity
          brand.inStock = action.payload.inStock
        }
        prod.inStock = prod.brands.some(b => b.inStock && b.stockQuantity > 0)
      }
    },
    // Super Admin: Delete product
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    // ===== FETCH PRODUCTS =====
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        // Keep existing products if populated, otherwise use action payload
        if (!state.products || state.products.length === 0) {
          state.products = action.payload
        }
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== SEARCH PRODUCTS =====
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload
        state.error = null
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload as string
      })

    // ===== FETCH PRODUCT BY ID =====
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedProduct = action.payload
        state.error = null
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ===== CREATE DIRECT PURCHASE ORDER =====
    builder
      .addCase(createDirectPurchaseOrder.pending, (state) => {
        state.orderLoading = true
        state.error = null
      })
      .addCase(createDirectPurchaseOrder.fulfilled, (state, action) => {
        state.orderLoading = false
        state.orderResult = action.payload
        state.error = null
      })
      .addCase(createDirectPurchaseOrder.rejected, (state, action) => {
        state.orderLoading = false
        state.error = action.payload as string
      })
  },
})

// ==================== ACTIONS ====================

export const {
  clearProductsError,
  clearOrderResult,
  setFilters,
  clearFilters,
  clearSearchResults,
  addProduct,
  addBrandToProduct,
  updateProductPrices,
  updateBrandStock,
  deleteProduct,
} = productsSlice.actions

// ==================== SELECTORS ====================

export const selectProducts = (state: { products: ProductsState }) => state.products
export const selectAllProducts = (state: { products: ProductsState }) => state.products.products
export const selectSearchResults = (state: { products: ProductsState }) => state.products.searchResults
export const selectSelectedProduct = (state: { products: ProductsState }) => state.products.selectedProduct
export const selectProductsLoading = (state: { products: ProductsState }) => state.products.loading
export const selectSearchLoading = (state: { products: ProductsState }) => state.products.searchLoading
export const selectOrderLoading = (state: { products: ProductsState }) => state.products.orderLoading
export const selectOrderResult = (state: { products: ProductsState }) => state.products.orderResult
export const selectProductsError = (state: { products: ProductsState }) => state.products.error
export const selectProductsFilters = (state: { products: ProductsState }) => state.products.filters

// ==================== EXPORT ====================

export default productsSlice.reducer
