import { useEffect, useState, useCallback } from 'react'
import { PageMeta } from '@/components/PageMeta'
import {
  TrendingUp,
  Save,
  RefreshCw,
  Sparkles,
  Calendar,
  AlertTriangle,
  Clock,
  Archive,
  LineChart as LineChartIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProducts,
  selectAllProducts,
} from '@/store/slices/productsSlice'
import { adminApi } from '@/lib/adminApi'

const BI_MONTHLY_PERIODS = [
  'Sept - Oct',
  'Nov - Dec',
  'Jan - Feb',
  'Mar - Apr',
  'May - Jun',
  'Jul - Aug',
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function AdminMarketDataPage() {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectAllProducts)

  // Top Global Selection Controls (Product & Brand ONLY)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentWeekNum = Math.min(Math.floor((now.getDate() - 1) / 7) + 1, 4)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // -------------------------------------------------------------
  // ISOLATED SECTION 1 STATE: Bi-Monthly Historical Ranges
  // -------------------------------------------------------------
  const [biMonthlyYear, setBiMonthlyYear] = useState<number>(currentYear)
  const [biMonthlyForm, setBiMonthlyForm] = useState<Record<string, any>>({})
  const [, setLoadingBiMonthly] = useState<boolean>(false)
  const [savingBiMonthly, setSavingBiMonthly] = useState<boolean>(false)

  // -------------------------------------------------------------
  // ISOLATED SECTION 2 STATE: Current Month Weekly Spot Prices Entry
  // -------------------------------------------------------------
  const [weeklyForm, setWeeklyForm] = useState<Record<number, string>>({})
  const [, setLoadingWeekly] = useState<boolean>(false)
  const [savingWeekly, setSavingWeekly] = useState<boolean>(false)

  // -------------------------------------------------------------
  // ISOLATED SECTION 3 STATE: Financial Loss Analysis
  // -------------------------------------------------------------
  const [lossForm, setLossForm] = useState({
    basePrice: '',
    peakSurgePrice: '',
    discountedOptimalPrice: '',
    singleCompanyLoss: '',
    aggregate500CompaniesLoss: '',
  })
  const [savingLoss, setSavingLoss] = useState<boolean>(false)

  // -------------------------------------------------------------
  // ISOLATED SECTION 4 STATE: Seasonal Procurement Guidance
  // -------------------------------------------------------------
  const [guidanceForm, setGuidanceForm] = useState({
    firstBestSeason: 'Sept - Oct',
    secondBestSeason: 'May - Jun',
    thirdBestSeason: 'Jan - Feb',
    seasonalBuyingGuideNotes: '',
    recommendationSummary: '',
  })
  const [savingGuidance, setSavingGuidance] = useState<boolean>(false)

  // -------------------------------------------------------------
  // ISOLATED SECTION 5 STATE: Spot Price History Archives (Graph & Table)
  // -------------------------------------------------------------
  const [archiveYear, setArchiveYear] = useState<number>(currentYear)
  const [archiveMonth, setArchiveMonth] = useState<number>(currentMonth)
  const [archiveSpotPrices, setArchiveSpotPrices] = useState<Array<{ week: string; price: number | null }>>([])
  const [loadingArchive, setLoadingArchive] = useState<boolean>(false)

  // Load product catalog on mount
  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 100, includeUnavailable: true }))
  }, [dispatch])

  // Select first product & brand by default if none selected
  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      const firstP = products[0]
      setSelectedProductId(firstP.id)
      const firstB = firstP.brands[0]
      if (firstB) setSelectedBrandId(firstB.id)
    }
  }, [products, selectedProductId])

  // -------------------------------------------------------------
  // ISOLATED FETCH HANDLERS
  // -------------------------------------------------------------

  // 1. Fetch Section 1 Bi-Monthly Ranges (Targeted to biMonthlyYear)
  const loadBiMonthlyData = useCallback(async () => {
    if (!selectedProductId) return
    setLoadingBiMonthly(true)
    try {
      const res = await adminApi.get('/pricing/admin/market-data/', {
        params: {
          product_id: selectedProductId,
          brand_id: selectedBrandId || undefined,
          year: biMonthlyYear,
        },
      })
      const metrics = res.data?.data?.biMonthlyMetrics || []
      const biMap: Record<string, any> = {}
      BI_MONTHLY_PERIODS.forEach((period) => {
        const existing = metrics.find((bm: any) => bm.period === period)
        biMap[period] = {
          minAveragePrice: existing?.minAveragePrice ?? '',
          maxAveragePrice: existing?.maxAveragePrice ?? '',
          minWeeklyIncrease: existing?.minWeeklyIncrease ?? '',
          maxWeeklyIncrease: existing?.maxWeeklyIncrease ?? '',
          minWeeklyDiscount: existing?.minWeeklyDiscount ?? '',
          maxWeeklyDiscount: existing?.maxWeeklyDiscount ?? '',
        }
      })
      setBiMonthlyForm(biMap)
    } catch (err) {
      console.error('Error fetching bi-monthly data:', err)
    } finally {
      setLoadingBiMonthly(false)
    }
  }, [selectedProductId, selectedBrandId, biMonthlyYear])

  // 2. Fetch Section 2 Current Month Spot Prices (Strictly bound to currentYear & currentMonth)
  const loadCurrentMonthSpotPrices = useCallback(async () => {
    if (!selectedProductId) return
    setLoadingWeekly(true)
    try {
      const res = await adminApi.get('/pricing/admin/market-data/', {
        params: {
          product_id: selectedProductId,
          brand_id: selectedBrandId || undefined,
          year: currentYear,
          month: currentMonth,
        },
      })
      const spotPrices = res.data?.data?.weeklySpotPrices || []
      const wMap: Record<number, string> = {}
      for (let w = 1; w <= 4; w++) {
        const existing = spotPrices.find((wp: any) => wp.weekNumber === w)
        wMap[w] = existing?.directPurchasePrice != null ? String(existing.directPurchasePrice) : ''
      }
      setWeeklyForm(wMap)
    } catch (err) {
      console.error('Error fetching current month spot prices:', err)
    } finally {
      setLoadingWeekly(false)
    }
  }, [selectedProductId, selectedBrandId, currentYear, currentMonth])

  // 3. Fetch Financial Loss & Procurement Guidance (Static product info)
  const loadLossAndGuidance = useCallback(async () => {
    if (!selectedProductId) return
    try {
      const res = await adminApi.get('/pricing/admin/market-data/', {
        params: {
          product_id: selectedProductId,
          brand_id: selectedBrandId || undefined,
          year: currentYear,
          month: currentMonth,
        },
      })
      const lossData = res.data?.data?.financialLossAnalysis
      if (lossData) {
        setLossForm({
          basePrice: String(lossData.basePrice || ''),
          peakSurgePrice: String(lossData.peakSurgePrice || ''),
          discountedOptimalPrice: String(lossData.discountedOptimalPrice || ''),
          singleCompanyLoss: String(lossData.singleCompanyLoss || ''),
          aggregate500CompaniesLoss: String(lossData.aggregate500CompaniesLoss || ''),
        })
      } else {
        setLossForm({ basePrice: '', peakSurgePrice: '', discountedOptimalPrice: '', singleCompanyLoss: '', aggregate500CompaniesLoss: '' })
      }

      const guidanceData = res.data?.data?.procurementGuidance
      if (guidanceData) {
        setGuidanceForm({
          firstBestSeason: guidanceData.firstBestSeason || 'Sept - Oct',
          secondBestSeason: guidanceData.secondBestSeason || 'May - Jun',
          thirdBestSeason: guidanceData.thirdBestSeason || 'Jan - Feb',
          seasonalBuyingGuideNotes: guidanceData.seasonalBuyingGuideNotes || '',
          recommendationSummary: guidanceData.recommendationSummary || '',
        })
      } else {
        setGuidanceForm({
          firstBestSeason: 'Sept - Oct',
          secondBestSeason: 'May - Jun',
          thirdBestSeason: 'Jan - Feb',
          seasonalBuyingGuideNotes: '',
          recommendationSummary: '',
        })
      }
    } catch (err) {
      console.error('Error loading loss and guidance data:', err)
    }
  }, [selectedProductId, selectedBrandId, currentYear, currentMonth])

  // 4. Fetch Section 5 Archive Spot Prices (Targeted to archiveYear & archiveMonth)
  const loadArchiveSpotPrices = useCallback(async () => {
    if (!selectedProductId) return
    setLoadingArchive(true)
    try {
      const res = await adminApi.get('/pricing/admin/market-data/', {
        params: {
          product_id: selectedProductId,
          brand_id: selectedBrandId || undefined,
          year: archiveYear,
          month: archiveMonth,
        },
      })
      const spotPrices = res.data?.data?.weeklySpotPrices || []
      const monthLabel = MONTH_NAMES[archiveMonth - 1]?.slice(0, 3) || 'M'
      const history = [1, 2, 3, 4].map((w) => {
        const existing = spotPrices.find((wp: any) => wp.weekNumber === w)
        return {
          week: `${monthLabel} W${w}`,
          price: existing?.directPurchasePrice != null ? parseFloat(existing.directPurchasePrice) : null,
        }
      })
      setArchiveSpotPrices(history)
    } catch (err) {
      console.error('Error fetching archive spot prices:', err)
    } finally {
      setLoadingArchive(false)
    }
  }, [selectedProductId, selectedBrandId, archiveYear, archiveMonth])

  // Trigger loads when global Product or Brand changes
  useEffect(() => {
    if (selectedProductId) {
      loadBiMonthlyData()
      loadCurrentMonthSpotPrices()
      loadLossAndGuidance()
      loadArchiveSpotPrices()
    }
  }, [selectedProductId, selectedBrandId])

  // Trigger Bi-Monthly reload when biMonthlyYear changes (ONLY affects Section 1!)
  useEffect(() => {
    if (selectedProductId) {
      loadBiMonthlyData()
    }
  }, [biMonthlyYear])

  // Trigger Archive reload when archiveYear or archiveMonth changes (ONLY affects Section 5!)
  useEffect(() => {
    if (selectedProductId) {
      loadArchiveSpotPrices()
    }
  }, [archiveYear, archiveMonth])

  // -------------------------------------------------------------
  // SAVE HANDLERS (ISOLATED)
  // -------------------------------------------------------------

  // Save Section 1: Bi-Monthly Ranges
  const handleSaveBiMonthlyData = async () => {
    if (!selectedProductId) return
    setSavingBiMonthly(true)
    const biPayload = BI_MONTHLY_PERIODS.map((period) => ({
      period,
      minAveragePrice: parseFloat(biMonthlyForm[period]?.minAveragePrice) || 0,
      maxAveragePrice: parseFloat(biMonthlyForm[period]?.maxAveragePrice) || 0,
      minWeeklyIncrease: parseFloat(biMonthlyForm[period]?.minWeeklyIncrease) || 0,
      maxWeeklyIncrease: parseFloat(biMonthlyForm[period]?.maxWeeklyIncrease) || 0,
      minWeeklyDiscount: parseFloat(biMonthlyForm[period]?.minWeeklyDiscount) || 0,
      maxWeeklyDiscount: parseFloat(biMonthlyForm[period]?.maxWeeklyDiscount) || 0,
    }))

    try {
      await adminApi.post('/pricing/admin/market-data/', {
        productId: selectedProductId,
        brandId: selectedBrandId || undefined,
        year: biMonthlyYear,
        month: currentMonth,
        biMonthlyMetrics: biPayload,
        weeklySpotPrices: [],
      })

      toast.success(`Bi-monthly historical ranges for Year ${biMonthlyYear} saved successfully!`)
      loadBiMonthlyData()
    } catch (err: any) {
      toast.error('Failed to save bi-monthly ranges.')
    } finally {
      setSavingBiMonthly(false)
    }
  }

  // Save Section 2: Current Month Spot Prices
  const handleSaveWeeklySpotPrices = async () => {
    if (!selectedProductId) return
    setSavingWeekly(true)
    const monthLabel = MONTH_NAMES[currentMonth - 1]?.slice(0, 3) || 'M'
    const wPayload = [1, 2, 3, 4].map((w) => ({
      weekNumber: w,
      weekLabel: `${monthLabel} W${w}`,
      directPurchasePrice: weeklyForm[w] !== '' && weeklyForm[w] != null ? parseFloat(weeklyForm[w]) : null,
    }))

    try {
      const res = await adminApi.post('/pricing/admin/market-data/', {
        productId: selectedProductId,
        brandId: selectedBrandId || undefined,
        year: currentYear,
        month: currentMonth,
        biMonthlyMetrics: [],
        weeklySpotPrices: wPayload,
      })

      toast.success(res.data?.message || 'Current month weekly spot prices saved and synchronized successfully!')
      loadCurrentMonthSpotPrices()
      loadArchiveSpotPrices()
      dispatch(fetchProducts({ pageSize: 100, includeUnavailable: true }))
    } catch (err: any) {
      toast.error('Failed to save current month spot prices.')
    } finally {
      setSavingWeekly(false)
    }
  }

  // Save Section 3: Loss Analysis
  const handleSaveLossAnalysis = async () => {
    if (!selectedProductId) return
    setSavingLoss(true)
    try {
      await adminApi.post('/pricing/admin/financial-loss/', {
        productId: selectedProductId,
        brandId: selectedBrandId || undefined,
        basePrice: parseFloat(lossForm.basePrice) || 0,
        peakSurgePrice: parseFloat(lossForm.peakSurgePrice) || 0,
        discountedOptimalPrice: parseFloat(lossForm.discountedOptimalPrice) || 0,
        singleCompanyLoss: parseFloat(lossForm.singleCompanyLoss) || 0,
        aggregate500CompaniesLoss: parseFloat(lossForm.aggregate500CompaniesLoss) || 0,
      })
      toast.success('Financial loss analysis saved successfully!')
    } catch (err: any) {
      toast.error('Failed to save financial loss analysis.')
    } finally {
      setSavingLoss(false)
    }
  }

  // Save Section 4: Guidance
  const handleSaveGuidance = async () => {
    if (!selectedProductId) return

    if (
      !guidanceForm.firstBestSeason?.trim() ||
      !guidanceForm.secondBestSeason?.trim() ||
      !guidanceForm.thirdBestSeason?.trim() ||
      !guidanceForm.recommendationSummary?.trim() ||
      !guidanceForm.seasonalBuyingGuideNotes?.trim()
    ) {
      toast.error('Please fill out all fields in the Seasonal Buying Guidance section before publishing.')
      return
    }

    setSavingGuidance(true)
    try {
      await adminApi.post('/pricing/admin/guidance/', {
        productId: selectedProductId,
        brandId: selectedBrandId || undefined,
        ...guidanceForm,
      })
      toast.success('Procurement guidance saved successfully!')
    } catch (err: any) {
      toast.error('Failed to save guidance.')
    } finally {
      setSavingGuidance(false)
    }
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const availableBrands = selectedProduct?.brands || []
  const selectedBrand = availableBrands.find((b) => b.id === selectedBrandId)

  return (
    <AdminLayout activePage="market-data">
      <PageMeta
        title="Market Data"
        description="Maintain market price history and analytics used across the platform."
        path="/admin/market-data"
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-[#2f81f7]" />
              Admin Market Data Entry & Management
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
              Select product and brand to configure bi-monthly historical ranges, current week spot prices, and procurement guidance.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadBiMonthlyData()
              loadCurrentMonthSpotPrices()
              loadLossAndGuidance()
              loadArchiveSpotPrices()
            }}
            className="border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/10 text-xs h-9 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh All
          </Button>
        </div>

        {/* Global Selector Bar (Product & Brand ONLY) */}
        <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: Select Product */}
            <div>
              <label className="text-xs font-mono font-semibold text-[#8b949e] block mb-1.5">
                1. Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const pId = e.target.value
                  setSelectedProductId(pId)
                  const p = products.find((prod) => prod.id === pId)
                  if (p && p.brands.length > 0) setSelectedBrandId(p.brands[0].id)
                  else setSelectedBrandId('')
                }}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:outline-none focus:border-[#f0f6fc]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.unitOfMeasure || 'unit'})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Brand */}
            <div>
              <label className="text-xs font-mono font-semibold text-[#8b949e] block mb-1.5">
                2. Select Brand
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:outline-none focus:border-[#f0f6fc]"
              >
                {availableBrands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Direct: ETB {b.babiPlatformPrice || b.price || 0})
                  </option>
                ))}
                {availableBrands.length === 0 && <option value="">No Brands Available</option>}
              </select>
            </div>
          </div>

          {/* Active Product & Brand Summary */}
          {selectedProduct && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#30363d] text-xs font-mono">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#238636]/20 text-[#3fb950] border-[#238636]/30">
                  Active Selection
                </Badge>
                <span className="text-[#f0f6fc]">
                  Product: <strong>{selectedProduct.name}</strong> · Brand:{' '}
                  <strong>{selectedBrand?.name || 'All Brands'}</strong>
                </span>
              </div>
              {selectedBrand && (
                <div className="text-[#8b949e]">
                  Synchronized Direct Purchase Price:{' '}
                  <strong className="text-[#58a6ff]">ETB {selectedBrand.babiPlatformPrice || selectedBrand.price || 0}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 1: Bi-Monthly Historical Ranges Entry Table (Isolated Year Selection) */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="border-b border-[#30363d] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg text-[#f0f6fc] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2f81f7]" />
                  Bi-Monthly Historical Pricing Ranges
                </CardTitle>
                <CardDescription className="text-xs text-[#8b949e] mt-0.5">
                  Enter min and max ranges for average price, weekly increase, and weekly discount across the 6 two-month periods.
                </CardDescription>
              </div>

              {/* Year Selector specific to Section 1 (Bi-Monthly Historical Entry) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8b949e]">Select Year:</span>
                <select
                  value={biMonthlyYear}
                  onChange={(e) => setBiMonthlyYear(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono font-bold text-[#f0f6fc] focus:outline-none"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#30363d] text-[#8b949e] uppercase">
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Avg Price Range (ETB)</th>
                    <th className="py-2.5 px-3">Weekly Increase Range (ETB)</th>
                    <th className="py-2.5 px-3">Weekly Discount Range (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {BI_MONTHLY_PERIODS.map((period) => {
                    const pData = biMonthlyForm[period] || {}
                    return (
                      <tr key={period} className="hover:bg-[#0d1117]/50">
                        <td className="py-3 px-3 font-bold text-[#f0f6fc]">{period}</td>
                        {/* Avg Price Min - Max */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={pData.minAveragePrice ?? ''}
                              onChange={(e) =>
                                setBiMonthlyForm({
                                  ...biMonthlyForm,
                                  [period]: { ...pData, minAveragePrice: e.target.value },
                                })
                              }
                              className="w-24 h-8 bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                            />
                            <span className="text-[#8b949e]">→</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={pData.maxAveragePrice ?? ''}
                              onChange={(e) =>
                                setBiMonthlyForm({
                                  ...biMonthlyForm,
                                  [period]: { ...pData, maxAveragePrice: e.target.value },
                                })
                              }
                              className="w-24 h-8 bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                            />
                          </div>
                        </td>
                        {/* Weekly Increase Min - Max */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={pData.minWeeklyIncrease ?? ''}
                              onChange={(e) =>
                                setBiMonthlyForm({
                                  ...biMonthlyForm,
                                  [period]: { ...pData, minWeeklyIncrease: e.target.value },
                                })
                              }
                              className="w-24 h-8 bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                            />
                            <span className="text-[#8b949e]">→</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={pData.maxWeeklyIncrease ?? ''}
                              onChange={(e) =>
                                setBiMonthlyForm({
                                  ...biMonthlyForm,
                                  [period]: { ...pData, maxWeeklyIncrease: e.target.value },
                                })
                              }
                              className="w-24 h-8 bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                            />
                          </div>
                        </td>
                        {/* Weekly Discount Min - Max */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={pData.minWeeklyDiscount ?? ''}
                              onChange={(e) =>
                                setBiMonthlyForm({
                                  ...biMonthlyForm,
                                  [period]: { ...pData, minWeeklyDiscount: e.target.value },
                                })
                              }
                              className="w-24 h-8 bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                            />
                            <span className="text-[#8b949e]">→</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={pData.maxWeeklyDiscount ?? ''}
                              onChange={(e) =>
                                setBiMonthlyForm({
                                  ...biMonthlyForm,
                                  [period]: { ...pData, maxWeeklyDiscount: e.target.value },
                                })
                              }
                              className="w-24 h-8 bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                onClick={handleSaveBiMonthlyData}
                disabled={savingBiMonthly || !selectedProductId}
                size="sm"
                className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold h-9 gap-1.5"
              >
                <Save className="w-4 h-4" />
                {savingBiMonthly ? 'Saving...' : `Save Bi-Monthly Ranges (${biMonthlyYear})`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Current Month Weekly Spot Prices Entry (100% Protected & Bound to Current Month/Year) */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="border-b border-[#30363d] pb-4">
            <CardTitle className="text-base sm:text-lg text-[#f0f6fc] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#3fb950]" />
              Current Month Weekly Spot Prices Entry ({MONTH_NAMES[currentMonth - 1]} {currentYear})
            </CardTitle>
            <CardDescription className="text-xs text-[#8b949e] mt-0.5">
              Weekly spot prices represent Direct Purchase Prices. Saving the current week price updates Product & Pricing in real time.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 font-mono">
            {/* Current-week context note */}
            <div className="flex items-center gap-2 text-xs text-[#8b949e] bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
              <span>
                Today is <strong className="text-[#f0f6fc]">{MONTH_NAMES[currentMonth - 1]} {currentYear} (Week {currentWeekNum})</strong>.
                {' '}Weeks 1–{currentWeekNum} are open for entry. Weeks beyond Week {currentWeekNum} are locked until reached.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((w) => {
                const monthLabel = MONTH_NAMES[currentMonth - 1]?.slice(0, 3) || 'M'
                const val = weeklyForm[w] ?? ''
                const hasValue = val !== ''

                const isCurrentWeek = w === currentWeekNum
                const isLocked = w > currentWeekNum

                return (
                  <div
                    key={w}
                    className={`p-3 rounded-lg border space-y-2 ${
                      isCurrentWeek
                        ? 'bg-[#0d2318] border-[#238636]/60'
                        : isLocked
                        ? 'bg-[#0d1117]/60 border-[#30363d]/40 opacity-50'
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#f0f6fc]">{monthLabel} Week {w}</span>
                      {isCurrentWeek ? (
                        <Badge className="bg-[#238636]/30 text-[#3fb950] border-[#238636]/50 text-[10px]">
                          ● Current Week
                        </Badge>
                      ) : isLocked ? (
                        <Badge variant="outline" className="text-[10px] border-[#30363d]/50 text-[#8b949e]/50">
                          Locked
                        </Badge>
                      ) : hasValue ? (
                        <Badge className="bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/30 text-[10px]">
                          Entered
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-[#30363d] text-[#8b949e]">
                          Empty
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8b949e]">Direct Purchase Price (ETB):</label>
                      <Input
                        type="number"
                        placeholder={isLocked ? '—' : 'e.g. 650'}
                        value={val}
                        disabled={isLocked}
                        onChange={(e) => setWeeklyForm({ ...weeklyForm, [w]: e.target.value })}
                        className={`h-9 border-[#30363d] text-sm font-bold ${
                          isCurrentWeek
                            ? 'bg-[#0d1117]! text-[#3fb950] border border-[#238636]/60'
                            : 'bg-[#0d1117]! border border-[#30363d] text-[#f0f6fc]'
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end pt-3">
              <Button
                onClick={handleSaveWeeklySpotPrices}
                disabled={savingWeekly || !selectedProductId}
                className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold h-9 gap-1.5"
              >
                <Save className="w-4 h-4" />
                {savingWeekly ? 'Saving...' : 'Publish Current Month Spot Prices'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: Financial Loss Analysis Entry */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="border-b border-[#30363d] pb-4">
            <CardTitle className="text-base sm:text-lg text-[#f0f6fc] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#d29922]" />
              Financial Loss Analysis Data Entry
            </CardTitle>
            <CardDescription className="text-xs text-[#8b949e] mt-0.5">
              Configure price fluctuation examples and estimated annual losses for company comparison analysis.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#8b949e] block mb-1">Base Price (ETB):</label>
                <Input
                  type="number"
                  placeholder="e.g. 650"
                  value={lossForm.basePrice}
                  onChange={(e) => setLossForm({ ...lossForm, basePrice: e.target.value })}
                  className="bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8b949e] block mb-1">Peak Surge Price (ETB):</label>
                <Input
                  type="number"
                  placeholder="e.g. 720"
                  value={lossForm.peakSurgePrice}
                  onChange={(e) => setLossForm({ ...lossForm, peakSurgePrice: e.target.value })}
                  className="bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8b949e] block mb-1">Discounted Optimal Price (ETB):</label>
                <Input
                  type="number"
                  placeholder="e.g. 690"
                  value={lossForm.discountedOptimalPrice}
                  onChange={(e) => setLossForm({ ...lossForm, discountedOptimalPrice: e.target.value })}
                  className="bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8b949e] block mb-1">Single Company Loss (ETB/yr):</label>
                <Input
                  type="number"
                  placeholder="e.g. 20000"
                  value={lossForm.singleCompanyLoss}
                  onChange={(e) => setLossForm({ ...lossForm, singleCompanyLoss: e.target.value })}
                  className="bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs text-[#8b949e] block mb-1">500 Companies Loss (ETB/yr):</label>
                <Input
                  type="number"
                  placeholder="e.g. 10000000"
                  value={lossForm.aggregate500CompaniesLoss}
                  onChange={(e) => setLossForm({ ...lossForm, aggregate500CompaniesLoss: e.target.value })}
                  className="bg-[#0d1117]! border border-[#30363d] text-xs text-[#f0f6fc]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                onClick={handleSaveLossAnalysis}
                disabled={savingLoss || !selectedProductId}
                size="sm"
                className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold h-9 gap-1.5"
              >
                <Save className="w-4 h-4" />
                {savingLoss ? 'Saving...' : 'Save Loss Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: Seasonal Buying Guidance */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="border-b border-[#30363d] pb-4">
            <CardTitle className="text-base sm:text-lg text-[#f0f6fc] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#58a6ff]" />
              Seasonal Buying Guidance & Procurement Calendar Recommendations
            </CardTitle>
            <CardDescription className="text-xs text-[#8b949e] mt-0.5">
              Configure 1st/2nd/3rd best procurement seasons and advice text (available for products with OR without bi-monthly historical data).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#8b949e] block mb-1">1st Best Season:</label>
                <select
                  value={guidanceForm.firstBestSeason}
                  onChange={(e) => setGuidanceForm({ ...guidanceForm, firstBestSeason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                >
                  {BI_MONTHLY_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8b949e] block mb-1">2nd Best Season:</label>
                <select
                  value={guidanceForm.secondBestSeason}
                  onChange={(e) => setGuidanceForm({ ...guidanceForm, secondBestSeason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                >
                  {BI_MONTHLY_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8b949e] block mb-1">3rd Best Season:</label>
                <select
                  value={guidanceForm.thirdBestSeason}
                  onChange={(e) => setGuidanceForm({ ...guidanceForm, thirdBestSeason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                >
                  {BI_MONTHLY_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8b949e] block mb-1">Recommendation Summary:</label>
                <textarea
                  rows={2}
                  value={guidanceForm.recommendationSummary}
                  onChange={(e) => setGuidanceForm({ ...guidanceForm, recommendationSummary: e.target.value })}
                  placeholder="e.g. Procure in bulk during Sept - Oct to save up to 25% versus market peaks."
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8b949e] block mb-1">Seasonal Buying Guide Notes:</label>
                <textarea
                  rows={3}
                  value={guidanceForm.seasonalBuyingGuideNotes}
                  onChange={(e) => setGuidanceForm({ ...guidanceForm, seasonalBuyingGuideNotes: e.target.value })}
                  placeholder="Detailed procurement guidance and market supply cycle observations..."
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                onClick={handleSaveGuidance}
                disabled={savingGuidance || !selectedProductId}
                size="sm"
                className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold h-9 gap-1.5"
              >
                <Save className="w-4 h-4" />
                {savingGuidance ? 'Saving...' : 'Save Procurement Guidance'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5: Historical Weekly Spot Price Archives (Graph + Summary Table) */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="border-b border-[#30363d] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg text-[#f0f6fc] flex items-center gap-2">
                  <Archive className="w-5 h-5 text-[#2f81f7]" />
                  Weekly Spot Price History Archives & Interactive Graph
                </CardTitle>
                <CardDescription className="text-xs text-[#8b949e] mt-0.5">
                  Select year and month to inspect previously recorded weekly spot price graph for <strong>{selectedProduct?.name || 'Selected Product'}</strong>.
                </CardDescription>
              </div>

              {/* Year & Month Selection specifically for Archive Section */}
              <div className="flex items-center gap-2">
                <select
                  value={archiveYear}
                  onChange={(e) => setArchiveYear(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono font-bold text-[#f0f6fc] focus:outline-none"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>

                <select
                  value={archiveMonth}
                  onChange={(e) => setArchiveMonth(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono font-bold text-[#f0f6fc] focus:outline-none"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  onClick={loadArchiveSpotPrices}
                  disabled={loadingArchive}
                  className="bg-[#2f81f7] hover:bg-[#388bfd] text-white text-xs font-semibold h-8 gap-1.5"
                >
                  <LineChartIcon className={`w-3.5 h-3.5 ${loadingArchive ? 'animate-spin' : ''}`} />
                  Load Graph
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6 font-mono">
            {/* Archive Interactive Graph */}
            <div>
              <p className="text-xs font-bold text-[#8b949e] uppercase mb-3 tracking-wider">
                {MONTH_NAMES[archiveMonth - 1]} {archiveYear} — Spot Price Trend Line
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={archiveSpotPrices} margin={{ top: 10, right: 35, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#8b949e', fontFamily: 'IBM Plex Mono' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8b949e', fontFamily: 'IBM Plex Mono' }}
                    domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin - 2)), (dataMax: number) => Math.ceil(dataMax + 2)]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'IBM Plex Mono',
                      color: '#f0f6fc',
                    }}
                    formatter={(val) => (val ? [`ETB ${val}`, 'Direct Spot Price'] : ['No record', ''])}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#2f81f7"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#2f81f7' }}
                    activeDot={{ r: 7, fill: '#58a6ff' }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Archive Summary Table */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              {archiveSpotPrices.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f0f6fc]">{item.week}</span>
                    {item.price != null ? (
                      <Badge className="bg-[#238636]/20 text-[#3fb950] border-[#238636]/30 text-[10px]">
                        Recorded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-[#30363d] text-[#8b949e]">
                        No Record
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] block">Spot Price:</span>
                    <span className="text-sm font-bold text-[#58a6ff]">
                      {item.price != null ? `ETB ${item.price}` : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
