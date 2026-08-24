import { useTranslation } from 'react-i18next'
import { Clock, Layers } from 'lucide-react'

const baskets = [
  {
    type: 'solution.baskets.0.type',
    for: 'solution.baskets.0.for',
    savings: '5–10%',
    delivery: 'solution.baskets.0.delivery',
    desc: 'solution.baskets.0.desc',
    color: 'border-info/30 bg-info-bg/30',
  },
  {
    type: 'solution.baskets.1.type',
    for: 'solution.baskets.1.for',
    savings: '8–15%',
    delivery: 'solution.baskets.1.delivery',
    desc: 'solution.baskets.1.desc',
    color: 'border-primary/30 bg-primary-subtle/50',
  },
  {
    type: 'solution.baskets.2.type',
    for: 'solution.baskets.2.for',
    savings: '12–20%',
    delivery: 'solution.baskets.2.delivery',
    desc: 'solution.baskets.2.desc',
    color: 'border-accent/30 bg-accent-subtle/30',
  },
]

export function SolutionSection() {
  const { t } = useTranslation()

  return (
    <section className="section-pad bg-muted/40">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">{t('solution.label')}</p>
          <h2 className="text-h1 text-foreground">{t('solution.title')}</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            {t('solution.intro')}
            <strong className="text-foreground">{t('solution.savingsRange')}</strong>
            {t('solution.outro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {baskets.map((b) => (
            <div
              key={b.type}
              className={`bg-card rounded-xl border p-6 md:p-5 lg:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${b.color}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-h3 text-foreground">{t(b.type)}</h3>
                  <span className="badge-savings text-sm px-3 py-1">{b.savings}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{t(b.for)}</p>

                <p className="text-xs text-foreground/80 leading-relaxed mb-6 bg-background/50 p-3 rounded-lg border border-border/40">
                  {t(b.desc)}
                </p>
              </div>

              {/* Stats & Delivery */}
              <div className="space-y-3 pt-5 border-t border-border/50 mt-auto">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Layers className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t('solution.volumeUnlockPrefix')} <strong className="text-primary">{b.savings}</strong> {t('solution.volumeUnlockSuffix')}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-info shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t('solution.deliveryLabel')} {t(b.delivery)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
