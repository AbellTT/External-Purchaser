import { useState } from 'react'
import { TrendingUp, Save, CheckCircle2, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface PriceEntry {
  period: string
  minPrice: number
  maxPrice: number
  maxWeeklyIncrease: number
  maxWeeklyDiscount: number
}

interface ProductData {
  productName: string
  unit: string
  currentMerkatoPrice: number
  currentPlatformPrice: number
  currentWeeklyPrices: { week: string; price: number | null }[]
  biMonthlyEntries: PriceEntry[]
  adminRecommendation: string
  bestBuyingPeriod: string
}

const INITIAL_PRODUCT_DATA: ProductData[] = [
  {
    productName: 'Siner Line A4 Paper',
    unit: 'ream',
    currentMerkatoPrice: 675,
    currentPlatformPrice: 650,
    currentWeeklyPrices: [
      { week: 'Aug W1', price: 670 },
      { week: 'Aug W2', price: 675 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ],
    biMonthlyEntries: [
      { period: 'Sept - Oct', minPrice: 480, maxPrice: 545, maxWeeklyIncrease: 65, maxWeeklyDiscount: 45 },
      { period: 'Nov - Dec', minPrice: 505, maxPrice: 630, maxWeeklyIncrease: 125, maxWeeklyDiscount: 95 },
      { period: 'Jan - Feb', minPrice: 630, maxPrice: 660, maxWeeklyIncrease: 30, maxWeeklyDiscount: 30 },
      { period: 'Mar - Apr', minPrice: 570, maxPrice: 650, maxWeeklyIncrease: 80, maxWeeklyDiscount: 80 },
      { period: 'May - Jun', minPrice: 570, maxPrice: 650, maxWeeklyIncrease: 80, maxWeeklyDiscount: 80 },
      { period: 'Jul - Aug', minPrice: 580, maxPrice: 700, maxWeeklyIncrease: 125, maxWeeklyDiscount: 120 },
    ],
    adminRecommendation:
      'Consider timing large orders around periods of lower market demand. Joining long-term baskets (3-6 months) can help lock in favorable rates.',
    bestBuyingPeriod: 'Sept - Oct',
  },
  {
    productName: 'OSA HP Toner',
    unit: 'cartridge',
    currentMerkatoPrice: 3200,
    currentPlatformPrice: 2800,
    currentWeeklyPrices: [
      { week: 'Aug W1', price: 2850 },
      { week: 'Aug W2', price: 2800 },
      { week: 'Aug W3', price: null },
      { week: 'Aug W4', price: null },
    ],
    biMonthlyEntries: [
      { period: 'Sept - Oct', minPrice: 2800, maxPrice: 3100, maxWeeklyIncrease: 200, maxWeeklyDiscount: 150 },
      { period: 'Nov - Dec', minPrice: 3000, maxPrice: 3400, maxWeeklyIncrease: 300, maxWeeklyDiscount: 200 },
      { period: 'Jan - Feb', minPrice: 3200, maxPrice: 3600, maxWeeklyIncrease: 250, maxWeeklyDiscount: 180 },
      { period: 'Mar - Apr', minPrice: 2900, maxPrice: 3200, maxWeeklyIncrease: 200, maxWeeklyDiscount: 150 },
      { period: 'May - Jun', minPrice: 2700, maxPrice: 3000, maxWeeklyIncrease: 180, maxWeeklyDiscount: 120 },
      { period: 'Jul - Aug', minPrice: 2750, maxPrice: 3100, maxWeeklyIncrease: 200, maxWeeklyDiscount: 140 },
    ],
    adminRecommendation:
      'Toner cartridges benefit from bulk purchasing strategies. Pre-ordering 2-3 months ahead and participating in volume-based baskets typically yields better pricing.',
    bestBuyingPeriod: 'May - Jun',
  },
]

export function AdminMarketDataPage() {
  const [products, setProducts] = useState<ProductData[]>(INITIAL_PRODUCT_DATA)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const selected = products[selectedIdx]

  const handleBiMonthlyChange = (
    periodIdx: number,
    field: keyof PriceEntry,
    value: number
  ) => {
    setProducts((prev) => {
      const updated = [...prev]
      const product = { ...updated[selectedIdx] }
      const entries = [...product.biMonthlyEntries]
      entries[periodIdx] = { ...entries[periodIdx], [field]: value }
      product.biMonthlyEntries = entries
      updated[selectedIdx] = product
      return updated
    })
  }

  const handleWeeklyChange = (weekIdx: number, value: string) => {
    setProducts((prev) => {
      const updated = [...prev]
      const product = { ...updated[selectedIdx] }
      const weekly = [...product.currentWeeklyPrices]
      weekly[weekIdx] = { ...weekly[weekIdx], price: value === '' ? null : Number(value) }
      product.currentWeeklyPrices = weekly
      updated[selectedIdx] = product
      return updated
    })
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Historical Market Intelligence Entry
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Update Merkato price data, weekly spot prices, and bi-monthly historical ranges visible to all platform users.
            </p>
          </div>
          {savedSuccess && (
            <div className="p-2 px-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Market data saved!
            </div>
          )}
        </div>

        {/* Product Tabs */}
        <div className="flex flex-wrap gap-2">
          {products.map((p, idx) => (
            <Button
              key={p.productName}
              size="sm"
              variant={selectedIdx === idx ? 'default' : 'outline'}
              onClick={() => setSelectedIdx(idx)}
              className={`text-xs ${
                selectedIdx === idx
                  ? 'bg-blue-600 text-white font-semibold hover:bg-blue-500'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.productName}
            </Button>
          ))}
        </div>

        {/* Current Weekly Prices */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="py-4 px-6 border-b border-slate-800">
            <CardTitle className="text-sm text-white">Current Month Weekly Spot Prices (Aug 2026)</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Updated weekly by admin. Null weeks display as &quot;data pending&quot; on user dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selected.currentWeeklyPrices.map((w, idx) => (
                <div key={w.week} className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">{w.week}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">ETB</span>
                    <input
                      type="number"
                      value={w.price ?? ''}
                      onChange={(e) => handleWeeklyChange(idx, e.target.value)}
                      placeholder="null"
                      className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-blue-400 font-bold font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bi-Monthly Historical Ranges */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="py-4 px-6 border-b border-slate-800">
            <CardTitle className="text-sm text-white">
              Bi-Monthly Historical Price Ranges — {selected.productName}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              2-year market price bands sourced from Merkato retail field data. Drives Market Intelligence charts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/40">
                    <th className="p-4">Period</th>
                    <th className="p-4">Min Price (ETB)</th>
                    <th className="p-4">Max Price (ETB)</th>
                    <th className="p-4">Max Weekly Increase</th>
                    <th className="p-4">Max Weekly Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selected.biMonthlyEntries.map((entry, periodIdx) => (
                    <tr key={entry.period} className="text-slate-300 hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-semibold text-blue-400">{entry.period}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={entry.minPrice}
                          onChange={(e) => handleBiMonthlyChange(periodIdx, 'minPrice', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={entry.maxPrice}
                          onChange={(e) => handleBiMonthlyChange(periodIdx, 'maxPrice', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={entry.maxWeeklyIncrease}
                          onChange={(e) => handleBiMonthlyChange(periodIdx, 'maxWeeklyIncrease', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={entry.maxWeeklyDiscount}
                          onChange={(e) => handleBiMonthlyChange(periodIdx, 'maxWeeklyDiscount', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Admin Recommendation */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="py-4 px-6 border-b border-slate-800">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Admin Procurement Recommendation
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Displayed to organization buyers on the Procurement Calendar page
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <textarea
              rows={3}
              value={selected.adminRecommendation}
              onChange={(e) => {
                setProducts((prev) => {
                  const updated = [...prev]
                  updated[selectedIdx] = { ...updated[selectedIdx], adminRecommendation: e.target.value }
                  return updated
                })
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Publish Market Data Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
