import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { MarketProduct } from '@/types/api'
import { api } from '@/lib/api'
import marketIntelligenceMock from '@/data/MI/marketIntelligence.json'

// ==================== STATE INTERFACE ====================

interface CapitalLossAnalysis {
  totalCapitalWasted: number
  organizationsAnalyzed: number
  avgLossPerCompany: number
  lossBreakdown: Array<{
    product: string
    lossAmount: number
  }>
}

interface MarketIntelligenceState {
  products: MarketProduct[]
  capitalLossAnalysis: CapitalLossAnalysis | null
  loading: boolean
  error: string | null
}

const initialState: MarketIntelligenceState = {
  products: [],
  capitalLossAnalysis: null,
  loading: false,
  error: null,
}

// ==================== ASYNC THUNKS ====================

/**
 * Fetch market intelligence data
 */
export const fetchMarketData = createAsyncThunk<{products: MarketProduct[], capitalLossAnalysis: CapitalLossAnalysis}>(
  'marketIntelligence/fetchMarketData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: {products: MarketProduct[], capitalLossAnalysis: CapitalLossAnalysis} }>(
        '/market-intelligence'
      )
      return response.data.data
    } catch (error: any) {
      // Fallback to mock data if backend API is not available
      if (marketIntelligenceMock?.data) {
        return marketIntelligenceMock.data as unknown as {products: MarketProduct[], capitalLossAnalysis: CapitalLossAnalysis}
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch market data')
    }
  }
)

// ==================== SLICE ====================

const marketIntelligenceSlice = createSlice({
  name: 'marketIntelligence',
  initialState,
  reducers: {
    clearMarketIntelligenceError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMarketData.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.capitalLossAnalysis = action.payload.capitalLossAnalysis
        state.error = null
      })
      .addCase(fetchMarketData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// ==================== ACTIONS ====================

export const { clearMarketIntelligenceError } = marketIntelligenceSlice.actions

// ==================== SELECTORS ====================

export const selectMarketIntelligence = (state: { marketIntelligence: MarketIntelligenceState }) => 
  state.marketIntelligence
export const selectMarketProducts = (state: { marketIntelligence: MarketIntelligenceState }) => 
  state.marketIntelligence.products
export const selectCapitalLossAnalysis = (state: { marketIntelligence: MarketIntelligenceState }) => 
  state.marketIntelligence.capitalLossAnalysis
export const selectMarketIntelligenceLoading = (state: { marketIntelligence: MarketIntelligenceState }) => 
  state.marketIntelligence.loading
export const selectMarketIntelligenceError = (state: { marketIntelligence: MarketIntelligenceState }) => 
  state.marketIntelligence.error

// ==================== EXPORT ====================

export default marketIntelligenceSlice.reducer
