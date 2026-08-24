import { useTranslation } from 'react-i18next'

const steps = [
  {
    n: '01',
    title: 'howItWorks.steps.0.title',
    desc: 'howItWorks.steps.0.desc',
  },
  {
    n: '02',
    title: 'howItWorks.steps.1.title',
    desc: 'howItWorks.steps.1.desc',
  },
  {
    n: '03',
    title: 'howItWorks.steps.2.title',
    desc: 'howItWorks.steps.2.desc',
  },
  {
    n: '04',
    title: 'howItWorks.steps.3.title',
    desc: 'howItWorks.steps.3.desc',
  },
]

export function HowItWorks() {
  const { t } = useTranslation()
  return (
    <section id="how-it-works" className="section-pad bg-muted/40 py-24">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <p className="text-label text-primary mb-4">{t('howItWorks.label')}</p>
          <h2 className="text-h1 text-foreground">{t('howItWorks.title')}</h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-border z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-10 relative z-10">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-start lg:items-center">
                {/* Number Badge */}
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display text-xl font-bold shrink-0 mb-8 ring-8 ring-background">
                  {s.n}
                </div>

                <div className="lg:text-justify">
                  <h3 className="text-h3 text-foreground mb-4 lg:text-center">{t(s.title)}</h3>
                  <p className="text-body-md text-muted-foreground leading-relaxed">{t(s.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
