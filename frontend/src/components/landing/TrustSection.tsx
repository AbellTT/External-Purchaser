import { useTranslation } from 'react-i18next'

export function TrustSection() {
  const { t } = useTranslation()
  const stats = [
    { value: '500+',   label: t('trust.stats.0.label') },
    { value: '14,000+', label: t('trust.stats.1.label') },
    { value: '5 Years', label: t('trust.stats.2.label') },
    { value: '5–20%',  label: t('trust.stats.3.label') },
  ]

  return (
    <section className="bg-primary py-14">
      <div className="container-base">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-data text-3xl md:text-4xl text-primary-foreground font-bold">
                {value}
              </p>
              <p className="text-label text-primary-foreground/70 mt-1.5 normal-case tracking-normal text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}