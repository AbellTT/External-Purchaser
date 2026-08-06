import { Link } from 'react-router-dom'
import { TrendingDown, TrendingUp, Calendar, ShieldCheck } from 'lucide-react'

const insights = [
  {
    icon: TrendingUp,
    color: 'text-error',
    bg: 'bg-error-bg',
    title: 'Peak Pricing: Jan & Sept',
    desc: 'Academic semester cycles drive A4 paper demand up 10–15% above monthly baselines. Plan purchases early.',
  },
  {
    icon: TrendingDown,
    color: 'text-success',
    bg: 'bg-success-bg',
    title: 'Optimal Window: May–July',
    desc: 'Mid-year demand lulls result in the lowest historical paper rates. Seasonal baskets capture these lows.',
  },
  {
    icon: Calendar,
    color: 'text-info',
    bg: 'bg-info-bg',
    title: 'Monthly Price Tracking',
    desc: 'We monitor wholesale rates across our network of Merkato suppliers each month to update active basket pricing.',
  },
  {
    icon: ShieldCheck,
    color: 'text-primary',
    bg: 'bg-primary-subtle',
    title: 'Buy With Confidence',
    desc: 'Registered members access 2 years of monthly market intelligence data so you always know when to lock in rates.',
  },
]

export function MarketIntelligenceSection() {
  return (
    <section className="section-pad bg-background">
      <div className="container-base">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-label text-primary mb-3">Market Intelligence</p>
          <h2 className="text-h1 text-foreground">Know Before You Buy</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            Our platform continuously monitors stationery wholesale prices across Merkato.
            Members get 2 years of monthly market data so procurement officers can make
            confident, budget-backed decisions — never paying above true wholesale rates.
          </p>
        </div>

        {/* Teaser banner */}
        <div className="bg-primary-subtle border border-primary/20 rounded-2xl px-8 py-7 mb-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-base mb-1">Full Price History Available After Registration</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Register your organization to access 2 years of monthly Merkato price data, seasonal trend analysis,
              and procurement timing recommendations.
            </p>
          </div>
          <Link
            to="/signup"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors shadow-xs"
          >
            Register Free
          </Link>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="text-h3 text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

