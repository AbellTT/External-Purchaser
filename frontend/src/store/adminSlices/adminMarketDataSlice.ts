import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { adminApi } from '@/lib/adminApi'
import type { RootState } from '@/store'

export interface BiMonthlyMetricInput {
  id?: number
  period: string
  minAveragePrice: number
  maxAveragePrice: number
  minWeeklyIncrease: number
  maxWeeklyIncrease: number
  minWeeklyDiscount: number
  maxWeeklyDiscount: number
}

export interface WeeklySpotPriceInput {
  id?: number
  weekNumber: number
  weekLabel: string
  directPurchasePrice: number | null
}

export interface FinancialLossInput {
  id?: number
  basePrice: number
  peakSurgePrice: number
  discountedOptimalPrice: number
  singleCompanyLoss: number
  aggregate500CompaniesLoss: number
}

export interface ProcurementGuidanceInput {
  id?: number
  firstBestSeason: string
  secondBestSeason: string
  thirdBestSeason: string
  seasonalBuyingGuideNotes: string
  recommendationSummary: string
}

interface AdminMarketDataState {
  selectedProductId: string
  selectedBrandId: string
  selectedYear: number
  selectedMonth: number
  biMonthlyMetrics: BiMonthlyMetricInput[]
  weeklySpotPrices: WeeklySpotPriceInput[]
  financialLoss: FinancialLossInput | null
  procurementGuidance: ProcurementGuidanceInput | null
  loading: boolean
  saving: boolean
  error: string | null
}

const now = new Date()
const initialState: AdminMarketDataState = {
  selectedProductId: '',
  selectedBrandId: '',
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,
  biMonthlyMetrics: [],
  weeklySpotPrices: [],
  financialLoss: null,
  procurementGuidance: null,
  loading: false,
  saving: false,
  error: null,
}

// Fetch Admin Market Data
export const fetchAdminMarketData = createAsyncThunk(
  'adminMarketData/fetchAdminMarketData',
  async (
    {
      productId,
      brandId,
      year,
      month,
    }: {
      productId: string
      brandId?: string
      year: number
      month: number
    },
    { rejectWithValue }
  ) => {
    try {
      const params: Record<string, any> = { product_id: productId, year, month }
      if (brandId) params.brand_id = brandId

      const response = await adminApi.get('/pricing/admin/market-data/', { params })
      return response.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch admin market data.')
    }
  }
)

// Save Admin Market Data
export const saveAdminMarketData = createAsyncThunk(
  'adminMarketData/saveAdminMarketData',
  async (
    payload: {
      productId: string
      brandId?: string
      year: number
      month: number
      biMonthlyMetrics: BiMonthlyMetricInput[]
      weeklySpotPrices: WeeklySpotPriceInput[]
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.post('/pricing/admin/market-data/', payload)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to save market data.')
    }
  }
)

// Save Financial Loss Analysis
export const saveAdminFinancialLoss = createAsyncThunk(
  'adminMarketData/saveAdminFinancialLoss',
  async (
    payload: {
      productId: string
      brandId?: string
      basePrice: number
      peakSurgePrice: number
      discountedOptimalPrice: number
      singleCompanyLoss: number
      aggregate500CompaniesLoss: number
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.post('/pricing/admin/financial-loss/', payload)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to save financial loss analysis.')
    }
  }
)

// Save Procurement Guidance
export const saveAdminProcurementGuidance = createAsyncThunk(
  'adminMarketData/saveAdminProcurementGuidance',
  async (
    payload: {
      productId: string
      brandId?: string
      firstBestSeason: string
      secondBestSeason: string
      thirdBestSeason: string
      seasonalBuyingGuideNotes: string
      recommendationSummary: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.post('/pricing/admin/guidance/', payload)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to save procurement guidance.')
    }
  }
)

const adminMarketDataSlice = createSlice({
  name: 'adminMarketData',
  initialState,
  reducers: {
    setSelectedProduct(state, action: PayloadAction<string>) {
      state.selectedProductId = action.payload
    },
    setSelectedBrand(state, action: PayloadAction<string>) {
      state.selectedBrandId = action.payload
    },
    setSelectedYear(state, action: PayloadAction<number>) {
      state.selectedYear = action.payload
    },
    setSelectedMonth(state, action: PayloadAction<number>) {
      state.selectedMonth = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminMarketData.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchAdminMarketData.fulfilled, (state, action) => {
      state.loading = false
      state.biMonthlyMetrics = action.payload.biMonthlyMetrics || []
      state.weeklySpotPrices = action.payload.weeklySpotPrices || []
      state.financialLoss = action.payload.financialLossAnalysis || null
      state.procurementGuidance = action.payload.procurementGuidance || null
    })
    builder.addCase(fetchAdminMarketData.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Save market data
    builder.addCase(saveAdminMarketData.pending, (state) => {
      state.saving = true
    })
    builder.addCase(saveAdminMarketData.fulfilled, (state) => {
      state.saving = false
    })
    builder.addCase(saveAdminMarketData.rejected, (state, action) => {
      state.saving = false
      state.error = action.payload as string
    })
  },
})

export const { setSelectedProduct, setSelectedBrand, setSelectedYear, setSelectedMonth } = adminMarketDataSlice.actions
export default adminMarketDataSlice.reducer

export const selectAdminMarketData = (state: RootState) => state.adminMarketData
