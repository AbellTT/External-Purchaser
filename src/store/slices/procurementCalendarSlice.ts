import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

export interface BiMonthlyMetric {
  period: string
  average_price_etb: { min: number; max: number }
  weekly_increase_etb: { max: number }
  weekly_discount_etb: { max: number }
}

export interface MarketDataProduct {
  product: string
  bi_monthly_metrics: BiMonthlyMetric[]
}

export interface SeasonalGuide {
  bestSeason: string
  secondBestSeason: string
  worstSeason: string
  recommendation: string
}

export interface ProcurementCalendarData {
  productsWithData: string[]
  allProducts: string[]
  adminRecommendations: Record<string, string>
  seasonalGuides: Record<string, SeasonalGuide>
  marketData: MarketDataProduct[]
}

interface ProcurementCalendarState {
  data: ProcurementCalendarData | null
  selectedProduct: string
  showAllProducts: boolean
  loading: boolean
  error: string | null
}

const initialState: ProcurementCalendarState = {
  data: null,
  selectedProduct: 'Siner Line A4 Paper',
  showAllProducts: false,
  loading: false,
  error: null,
}

// ==================== ASYNC THUNKS ====================

export const fetchProcurementCalendarData = createAsyncThunk<ProcurementCalendarData>(
  'procurementCalendar/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: ProcurementCalendarData }>(
        '/procurement-calendar'
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch procurement calendar data')
    }
  }
)

// ==================== SLICE ====================

const procurementCalendarSlice = createSlice({
  name: 'procurementCalendar',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
    },
    setShowAllProducts: (state, action) => {
      state.showAllProducts = action.payload
    },
    clearCalendarError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcurementCalendarData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProcurementCalendarData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.error = null
      })
      .addCase(fetchProcurementCalendarData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedProduct, setShowAllProducts, clearCalendarError } = procurementCalendarSlice.actions

export const selectProcurementData = (state: { procurementCalendar: ProcurementCalendarState }) => state.procurementCalendar.data
export const selectSelectedProduct = (state: { procurementCalendar: ProcurementCalendarState }) => state.procurementCalendar.selectedProduct
export const selectShowAllProducts = (state: { procurementCalendar: ProcurementCalendarState }) => state.procurementCalendar.showAllProducts
export const selectCalendarLoading = (state: { procurementCalendar: ProcurementCalendarState }) => state.procurementCalendar.loading

export default procurementCalendarSlice.reducer
