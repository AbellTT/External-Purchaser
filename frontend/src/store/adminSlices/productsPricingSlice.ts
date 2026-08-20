import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Brand, Product } from '@/types/api'
import { adminApi } from '@/lib/adminApi'

const PAGE_SIZE = 6

export type CatalogProduct = Pick<Product, 'id' | 'name' | 'category' | 'unit'>

interface ProductsPricingPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ProductsPricingState {
  products: Product[]
  catalogProducts: CatalogProduct[]
  searchQuery: string
  categoryFilter: string
  currentPage: number
  totalPages: number
  totalItems: number
  loading: boolean
  initialized: boolean
  error: string | null
}

interface ProductsPricingRefreshResult {
  products: Product[]
  catalogProducts: CatalogProduct[]
  pagination: ProductsPricingPagination
}

const initialState: ProductsPricingState = {
  products: [],
  catalogProducts: [],
  searchQuery: '',
  categoryFilter: 'all',
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  initialized: false,
  error: null,
}

function buildSearchParams(state: ProductsPricingState) {
  const params = new URLSearchParams()

  if (state.searchQuery.trim()) {
    params.set('search', state.searchQuery.trim())
  }

  if (state.categoryFilter !== 'all') {
    params.set('category', state.categoryFilter)
  }

  params.set('includeUnavailable', 'true')
  params.set('page', String(state.currentPage))
  params.set('pageSize', String(PAGE_SIZE))

  return params
}

export const refreshProductsPricing = createAsyncThunk<
  ProductsPricingRefreshResult,
  void,
  { state: { adminProductsPricing: ProductsPricingState }; rejectValue: string }
>('adminProductsPricing/refresh', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().adminProductsPricing
    const params = buildSearchParams(state)

    const [productsResponse, catalogResponse] = await Promise.all([
      adminApi.get<{
        success: boolean
        data: { products: Product[]; pagination: ProductsPricingPagination }
      }>(`/products/?${params.toString()}`),
      adminApi.get<{ success: boolean; data: CatalogProduct[] }>('/products/catalog-options'),
    ])

    return {
      products: productsResponse.data.data.products || [],
      catalogProducts: catalogResponse.data.data || [],
      pagination: productsResponse.data.data.pagination,
    }
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Unable to load product pricing.')
  }
})

export const createCatalogProduct = createAsyncThunk<CatalogProduct, { name: string; category: string; unit: string }, { rejectValue: string }>(
  'adminProductsPricing/createCatalogProduct',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await adminApi.post<{ success: boolean; data: CatalogProduct }>('/products/catalog-options', payload)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to create catalog product.')
    }
  }
)

export const createBrand = createAsyncThunk<Brand, { productId: string; brand: Omit<Brand, 'id' | 'babiPlatformPrice' | 'supplierCost'> }, { rejectValue: string }>(
  'adminProductsPricing/createBrand',
  async ({ productId, brand }, { rejectWithValue }) => {
    try {
      const response = await adminApi.post<{ success: boolean; data: Brand }>(`/products/${productId}/brands`, brand)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to create brand.')
    }
  }
)

export const saveBrand = createAsyncThunk<Brand, { brandId: string; updates: Partial<Brand> }, { rejectValue: string }>(
  'adminProductsPricing/saveBrand',
  async ({ brandId, updates }, { rejectWithValue }) => {
    try {
      const response = await adminApi.patch<{ success: boolean; data: Brand }>(`/products/brands/${brandId}`, updates)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Unable to save brand.')
    }
  }
)

const productsPricingSlice = createSlice({
  name: 'adminProductsPricing',
  initialState,
  reducers: {
    setProductsPricingSearch: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.currentPage = 1
    },
    setProductsPricingCategory: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload
      state.currentPage = 1
    },
    setProductsPricingPage: (state, action: PayloadAction<number>) => {
      state.currentPage = Math.max(1, action.payload)
    },
    markProductsPricingStale: (state) => {
      state.initialized = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshProductsPricing.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(refreshProductsPricing.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.products = action.payload.products
        state.catalogProducts = action.payload.catalogProducts
        state.currentPage = action.payload.pagination.page
        state.totalPages = action.payload.pagination.totalPages
        state.totalItems = action.payload.pagination.total
      })
      .addCase(refreshProductsPricing.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message || 'Unable to load product pricing.'
      })

      .addCase(createCatalogProduct.fulfilled, (state, action) => {
        const exists = state.catalogProducts.some((product) => product.id === action.payload.id)
        if (!exists) {
          state.catalogProducts.unshift(action.payload)
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
  },
})

export const {
  setProductsPricingSearch,
  setProductsPricingCategory,
  setProductsPricingPage,
  markProductsPricingStale,
} = productsPricingSlice.actions

export const selectProductsPricing = (state: { adminProductsPricing: ProductsPricingState }) => state.adminProductsPricing
export const selectProductsPricingProducts = (state: { adminProductsPricing: ProductsPricingState }) => state.adminProductsPricing.products
export const selectProductsPricingCatalogProducts = (state: { adminProductsPricing: ProductsPricingState }) => state.adminProductsPricing.catalogProducts
export const selectProductsPricingLoading = (state: { adminProductsPricing: ProductsPricingState }) => state.adminProductsPricing.loading
export const selectProductsPricingPagination = (state: { adminProductsPricing: ProductsPricingState }) => ({
  currentPage: state.adminProductsPricing.currentPage,
  totalPages: state.adminProductsPricing.totalPages,
  totalItems: state.adminProductsPricing.totalItems,
})

export default productsPricingSlice.reducer
