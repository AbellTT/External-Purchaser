import { useTranslation } from 'react-i18next'

const tiers = [
  {
    label: 'savings.tiers.0.label',
    example: 'savings.tiers.0.example',
    volume: 'savings.tiers.0.volume',
    retailCost: 'ETB 250,000',
    basketCost: 'ETB 225,000',
    savings: 'ETB 25,000',
    rate: '−10%',
    desc: 'savings.tiers.0.desc',
  },
  {
    label: 'savings.tiers.1.label',
    example: 'savings.tiers.1.example',
    volume: 'savings.tiers.1.volume',
    retailCost: 'ETB 1,500,000',
    basketCost: 'ETB 1,335,000',
    savings: 'ETB 165,000',
    rate: '−11%',
    featured: true,
    desc: 'savings.tiers.1.desc',
  },
  {
    label: 'savings.tiers.2.label',
    example: 'savings.tiers.2.example',
    volume: 'savings.tiers.2.volume',
    retailCost: 'ETB 12,000,000',
    basketCost: 'ETB 10,560,000',
    savings: 'ETB 1,440,000',
    rate: '−12%',
    desc: 'savings.tiers.2.desc',
  },
]

export function SavingsSection() {
  const { t } = useTranslation()

  return (
    <section className="section-pad bg-muted/40">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">{t('savings.whyItMatters')}</p>
          <h2 className="text-h1 text-foreground font-display">{t('savings.title')}</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            {t('savings.subtitleBefore')}{' '}
            <strong className="text-foreground">{t('savings.subtitleHighlight')}</strong>{' '}
            {t('savings.subtitleAfter')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className={`bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                tier.featured
                  ? 'border-2 border-primary/40 ring-4 ring-primary/5 shadow-md'
                  : 'border border-border'
              }`}
            >
              {tier.featured && (
                <div className="mb-4">
                  <span className="badge-savings">{t('savings.typicalCase')}</span>
                </div>
              )}
              <p className="text-label text-muted-foreground mb-1 normal-case tracking-normal">{t(tier.label)}</p>
              <p className="text-xs text-muted-foreground italic mb-2">{t(tier.example)}</p>
              <p className="text-xs font-semibold text-primary mb-5">{t(tier.volume)}</p>

              <div className="space-y-3 mb-6 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{t('savings.retailCostLabel')}</span>
                  <span className="font-mono text-muted-foreground line-through">{tier.retailCost}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-foreground">{t('savings.basketCostLabel')}</span>
                  <span className="font-mono text-foreground">{tier.basketCost}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="text-xs font-bold text-success">{t('savings.totalSavingsLabel')}</span>
                  <span className="font-mono text-lg font-bold text-success">{tier.savings} <span className="text-xs font-normal">({tier.rate})</span></span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
                {t(tier.desc)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
