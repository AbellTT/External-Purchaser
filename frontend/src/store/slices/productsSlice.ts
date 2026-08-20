import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Product, Brand, CreateDirectPurchaseRequest, CreateOrderResponse } from '@/types/api'
import { api } from '@/lib/api'

// ==================== STATE INTERFACE ====================

interface ProductsState {
  products: Product[]
  catalogProducts: Array<Pick<Product, 'id' | 'name' | 'category' | 'unit'>>
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

const initialState: ProductsState = {
  products: [],
  catalogProducts: [],
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
  { category?: string; search?: string; minPrice?: number; maxPrice?: number; includeUnavailable?: boolean; page?: number; pageSize?: number } | void
>(
  'products/fetchProducts',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        if (filters.search) params.append('search', filters.search)
        if (filters.category) params.append('category', filters.category)
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
        if (filters.includeUnavailable) params.append('includeUnavailable', 'true')
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
      }

      const response = await api.get<{ success: boolean; data: { products: Product[] } | Product[] }>(
        `/products/?${params.toString()}`
      )
      
      const data = response.data.data
      if (Array.isArray(data)) {
        return data
      } else if (data && Array.isArray(data.products)) {
        return data.products
      }
      return []
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to load products')
    }
  }
)

export const fetchCatalogProducts = createAsyncThunk<ProductsState['catalogProducts']>(
  'products/fetchCatalogProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: ProductsState['catalogProducts'] }>('/products/catalog-options')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to load catalog products')
    }
  }
)

export const createCatalogProduct = createAsyncThunk<ProductsState['catalogProducts'][number], { name: string; category: string; unit: string }>(
  'products/createCatalogProduct',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: ProductsState['catalogProducts'][number] }>('/products/catalog-options', payload)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to create catalog product')
    }
  }
)

export const saveCatalogProduct = createAsyncThunk<ProductsState['catalogProducts'][number], { productId: string; updates: { name: string; category: string; unit: string } }>(
  'products/saveCatalogProduct',
  async ({ productId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ success: boolean; data: ProductsState['catalogProducts'][number] }>(`/products/catalog-options/${productId}`, updates)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to save product')
    }
  }
)

export const createBrand = createAsyncThunk<Brand, { productId: string; brand: Omit<Brand, 'id' | 'babiPlatformPrice' | 'supplierCost'> }>(
  'products/createBrand',
  async ({ productId, brand }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: Brand }>(`/products/${productId}/brands`, brand)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to create brand')
    }
  }
)

export const saveBrand = createAsyncThunk<Brand, { brandId: string; updates: Partial<Brand> }>(
  'products/saveBrand',
  async ({ brandId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ success: boolean; data: Brand }>(`/products/brands/${brandId}`, updates)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to save brand')
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
  CreateDirectPurchaseRequest,
  { rejectValue: string }
>(
  'products/createDirectPurchaseOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateOrderResponse>(
        '/orders/direct-purchase',
        orderData
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to place direct purchase order.')
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
        state.products = action.payload
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchCatalogProducts.fulfilled, (state, action) => {
        state.catalogProducts = action.payload
      })
      .addCase(createCatalogProduct.fulfilled, (state, action) => {
        state.catalogProducts.push(action.payload)
      })
      .addCase(saveCatalogProduct.fulfilled, (state, action) => {
        const catalogIndex = state.catalogProducts.findIndex((product) => product.id === action.payload.id)
        if (catalogIndex >= 0) state.catalogProducts[catalogIndex] = action.payload
        const product = state.products.find((item) => item.id === action.payload.id)
        if (product) {
          product.name = action.payload.name
          product.category = action.payload.category
          product.unit = action.payload.unit
        }
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        const product = state.products.find((item) => item.id === action.meta.arg.productId)
        if (product) {
          product.brands.push(action.payload)
          product.inStock = product.brands.some((brand) => brand.inStock && brand.stockQuantity > 0)
        }
      })
      .addCase(saveBrand.fulfilled, (state, action) => {
        for (const product of state.products) {
          const index = product.brands.findIndex((brand) => brand.id === action.payload.id)
          if (index >= 0) {
            product.brands[index] = action.payload
            product.inStock = product.brands.some((brand) => brand.inStock && brand.stockQuantity > 0)
            break
          }
        }
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
export const selectCatalogProducts = (state: { products: ProductsState }) => state.products.catalogProducts
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
