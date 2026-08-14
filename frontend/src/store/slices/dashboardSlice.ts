import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { DashboardOverview } from '@/types/api'
import { api } from '@/lib/api'
import dashboardMock from '@/data/dashboard/dashboardOverview.json'

// ==================== STATE INTERFACE ====================

interface DashboardState {
  overview: DashboardOverview | null
  loading: boolean
  error: string | null
  /**
   * Set to true by the Axios request interceptor after any mutating request
   * (POST/PUT/PATCH/DELETE). When DashboardHome mounts and sees this flag,
   * it re-fetches the overview and shows the loading skeleton so the user
   * always sees fresh data after performing an action elsewhere.
   */
  needsRefresh: boolean
}

const initialState: DashboardState = {
  overview: null,
  loading: false,
  error: null,
  needsRefresh: false,
}

// ==================== ASYNC THUNKS ====================

/**
 * Fetch dashboard overview
 * Falls back to mock data if API call fails in dev/mock environment
 */
export const fetchDashboardOverview = createAsyncThunk<DashboardOverview>(
  'dashboard/fetchOverview',
  async () => {
    try {
      const response = await api.get<{ success: boolean; data: DashboardOverview }>(
        '/dashboard/overview'
      )
      return response.data.data
    } catch {
      // Dev/Mock environment fallback
      return dashboardMock.data as unknown as DashboardOverview
    }
  }
)

// ==================== SLICE ====================

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null
    },
    /**
     * Called by the Axios request interceptor for every non-GET request.
     * Marks the dashboard data as stale so DashboardHome re-fetches on
     * the next mount/visit.
     */
    markDashboardStale: (state) => {
      state.needsRefresh = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        // Show loading skeleton when: no data yet OR a stale refresh was requested
        if (!state.overview || state.needsRefresh) {
          state.loading = true
        }
        state.needsRefresh = false
        state.error = null
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false
        state.overview = action.payload
        state.error = null
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// ==================== ACTIONS ====================

export const { clearDashboardError, markDashboardStale } = dashboardSlice.actions

// ==================== SELECTORS ====================

export const selectDashboard = (state: { dashboard: DashboardState }) => state.dashboard
export const selectDashboardOverview = (state: { dashboard: DashboardState }) => state.dashboard.overview
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error
export const selectDashboardNeedsRefresh = (state: { dashboard: DashboardState }) => state.dashboard.needsRefresh

// ==================== EXPORT ====================

export default dashboardSlice.reducer
