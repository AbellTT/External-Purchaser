import { CalendarDays, TrendingDown, Sparkles, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const CALENDAR = [
  {
    month: 'September',
    monthNum: 9,
    items: ['Sinar Line A4 Paper', 'Ballpoint Pens', 'Printer Ink'],
    recommendation: {
      text: 'A4 Paper prices historically spike in Sep–Oct. Buy this week\'s basket now.',
      type: 'urgent',
      savings: '~17% savings available',
    },
  },
  {
    month: 'November',
    monthNum: 11,
    items: ['Exercise Books', 'Pencils', 'Rulers'],
    recommendation: {
      text: 'November is historically the lowest-price month for exercise books. Ideal for 6-month basket.',
      type: 'opportunity',
      savings: '~22% savings expected',
    },
  },
  {
    month: 'January',
    monthNum: 1,
    items: ['Cleaning Materials', 'Mop Heads', 'Cleaning Agents'],
    recommendation: {
      text: 'Cleaning materials peak in December. January baskets capture post-peak pricing.',
      type: 'plan',
      savings: '~14% savings projected',
    },
  },
  {
    month: 'March',
    monthNum: 3,
    items: ['Ledger Books', 'Box Files Kent', 'Stamps & Ink Pads'],
    recommendation: {
      text: 'End-of-fiscal-year archiving demand. Ledger book prices are stable — good monthly basket window.',
      type: 'plan',
      savings: '~16% savings projected',
    },
  },
  {
    month: 'June',
    monthNum: 6,
    items: ['HP Toner Ink', 'Copier Paper', 'Staples'],
    recommendation: {
      text: 'HP toner prices dip mid-year. The 6-month basket opened in June achieved the lowest cartridge price in 18 months.',
      type: 'opportunity',
      savings: '~20% savings projected',
    },
  },
]

const REC_STYLES = {
  urgent:      'bg-warning-bg border-warning/30 text-warning',
  opportunity: 'bg-success-bg border-success/30 text-success',
  plan:        'bg-info-bg border-info/30 text-info',
}

const REC_ICONS = {
  urgent:      '🔔',
  opportunity: '✨',
  plan:        '📅',
}

export function ProcurementCalendarPage() {
  const currentMonth = new Date().getMonth() + 1

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Procurement Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Annual procurement planning based on historical Merkato price patterns and seasonal demand.
          </p>
        </div>

        {/* Smart insight banner */}
        <div className="bg-primary-subtle border border-primary/20 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Procurement Intelligence</p>
            <p className="text-xs text-muted-foreground mt-1">
              This calendar is built from 2 years of Merkato price data. Recommendations are generated based on seasonal patterns,
              not just availability. Planning your procurement around these windows can reduce annual stationery costs by an estimated
              <strong className="text-primary"> 15–22%</strong>.
            </p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          {CALENDAR.map((month) => {
            const isCurrent = month.monthNum === currentMonth
            return (
              <Card
                key={month.month}
                className={`border-border transition-all ${isCurrent ? 'ring-2 ring-primary/30 shadow-sm' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-mono">
                        {String(month.monthNum).padStart(2, '0')}
                      </div>
                      <CardTitle className="text-base">📅 {month.month}</CardTitle>
                      {isCurrent && (
                        <Badge className="text-[10px] bg-primary text-primary-foreground">Current Month</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold font-mono text-muted-foreground mb-2 uppercase tracking-wide">Planned Items</p>
                    <div className="flex flex-wrap gap-2">
                      {month.items.map((item) => (
                        <div key={item} className="flex items-center gap-1.5 text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5">
                          <Package className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className={`rounded-lg border p-3.5 flex items-start gap-3 ${REC_STYLES[month.recommendation.type as keyof typeof REC_STYLES]}`}>
                    <span className="text-lg shrink-0">{REC_ICONS[month.recommendation.type as keyof typeof REC_ICONS]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-0.5">{month.recommendation.text}</p>
                      <p className="text-[11px] font-mono font-bold flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {month.recommendation.savings}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
