import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp, Calendar, ShieldCheck } from 'lucide-react'

const insights = [
  {
    icon: TrendingUp,
    color: 'text-error',
    bg: 'bg-error-bg',
    title: 'marketIntel.insights.0.title',
    desc: 'marketIntel.insights.0.desc',
  },
  {
    icon: TrendingDown,
    color: 'text-success',
    bg: 'bg-success-bg',
    title: 'marketIntel.insights.1.title',
    desc: 'marketIntel.insights.1.desc',
  },
  {
    icon: Calendar,
    color: 'text-info',
    bg: 'bg-info-bg',
    title: 'marketIntel.insights.2.title',
    desc: 'marketIntel.insights.2.desc',
  },
  {
    icon: ShieldCheck,
    color: 'text-primary',
    bg: 'bg-primary-subtle',
    title: 'marketIntel.insights.3.title',
    desc: 'marketIntel.insights.3.desc',
  },
]

export function MarketIntelligenceSection() {
  const { t } = useTranslation()

  return (
    <section className="section-pad bg-background">
      <div className="container-base">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-label text-primary mb-3">{t('marketIntel.label')}</p>
          <h2 className="text-h1 text-foreground">{t('marketIntel.title')}</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            {t('marketIntel.intro')}
          </p>
        </div>

        {/* Teaser banner */}
        <div className="bg-primary-subtle border border-primary/20 rounded-2xl px-8 py-7 mb-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-base mb-1">{t('marketIntel.bannerTitle')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('marketIntel.bannerDesc')}
            </p>
          </div>
          <Link
            to="/signup"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors shadow-xs"
          >
            {t('marketIntel.registerCta')}
          </Link>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="text-h3 text-foreground mb-2">{t(title)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
