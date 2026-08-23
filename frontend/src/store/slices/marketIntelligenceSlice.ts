import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import type { RootState } from '@/store'

export interface RangeVal {
  min: number
  max: number
}

export interface BiMonthlyPeriodData {
  period: string
  average_price_etb: RangeVal
  weekly_increase_etb: RangeVal
  weekly_discount_etb: RangeVal
}

export interface UserMarketProduct {
  id: string
  name: string
  category: string
  unit: string
  brandId?: string | null
  brandName?: string | null
  current_pricing: {
    regularMarketPrice: number
    merkatoRetailerPrice: number
    platformDirectPrice: number
  }
  weeklyHistory: { week: string; price: number | null }[]
  biMonthlyDataByYear: Record<number, BiMonthlyPeriodData[]>
  hasBiMonthlyData: boolean
}

export interface CapitalLossAnalysis {
  totalCapitalWasted: number
  organizationsAnalyzed: number
  avgLossPerCompany: number
  lossBreakdown: { product: string; lossAmount: number }[]
}

export interface CalendarProduct {
  id: string
  name: string
  category: string
  unit: string
  brandName?: string | null
  hasBiMonthlyData: boolean
  biMonthlyDataByYear: Record<number, BiMonthlyPeriodData[]>
  seasonalGuidance: {
    firstBestSeason: string
    secondBestSeason: string
    thirdBestSeason: string
    buyingGuideNotes: string
    recommendationSummary: string
  }
}

interface MarketIntelligenceState {
  products: UserMarketProduct[]
  calendarProducts: CalendarProduct[]
  capitalLossAnalysis: CapitalLossAnalysis | null
  loading: boolean
  calendarLoading: boolean
  error: string | null
}

const initialState: MarketIntelligenceState = {
  products: [],
  calendarProducts: [],
  capitalLossAnalysis: null,
  loading: false,
  calendarLoading: false,
  error: null,
}

// Fetch Market Intelligence User Data
export const fetchMarketIntelligence = createAsyncThunk(
  'marketIntelligence/fetchMarketIntelligence',
  async ({ silent = false }: { silent?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/pricing/market-intelligence/')
      return response.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch market intelligence data.')
    }
  }
)

// Fetch Procurement Calendar User Data
export const fetchProcurementCalendar = createAsyncThunk(
  'marketIntelligence/fetchProcurementCalendar',
  async ({ silent = false }: { silent?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/pricing/procurement-calendar/')
      return response.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch procurement calendar data.')
    }
  }
)

const marketIntelligenceSlice = createSlice({
  name: 'marketIntelligence',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMarketIntelligence.pending, (state, action) => {
      if (!action.meta.arg?.silent) state.loading = true
      state.error = null
    })
    builder.addCase(fetchMarketIntelligence.fulfilled, (state, action) => {
      state.loading = false
      state.products = action.payload.products || []
      state.capitalLossAnalysis = action.payload.capitalLossAnalysis || null
    })
    builder.addCase(fetchMarketIntelligence.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Calendar
    builder.addCase(fetchProcurementCalendar.pending, (state, action) => {
      if (!action.meta.arg?.silent) state.calendarLoading = true
    })
    builder.addCase(fetchProcurementCalendar.fulfilled, (state, action) => {
      state.calendarLoading = false
      state.calendarProducts = action.payload.products || []
    })
    builder.addCase(fetchProcurementCalendar.rejected, (state) => {
      state.calendarLoading = false
    })
  },
})

export default marketIntelligenceSlice.reducer

export const selectMarketIntelligenceProducts = (state: RootState) => state.marketIntelligence.products
export const selectMarketProducts = selectMarketIntelligenceProducts
export const fetchMarketData = fetchMarketIntelligence
export const selectCapitalLossAnalysis = (state: RootState) => state.marketIntelligence.capitalLossAnalysis
export const selectMarketIntelligenceLoading = (state: RootState) => state.marketIntelligence.loading
export const selectCalendarProducts = (state: RootState) => state.marketIntelligence.calendarProducts
export const selectCalendarLoading = (state: RootState) => state.marketIntelligence.calendarLoading
