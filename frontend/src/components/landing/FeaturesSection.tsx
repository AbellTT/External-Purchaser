import { useTranslation } from 'react-i18next'
import {
  ShoppingBasket, Package, BarChart2, TrendingDown,
  LayoutDashboard, Bell, ShieldCheck
} from 'lucide-react'

const features = [
  {
    icon: ShoppingBasket,
    title: 'features.items.0.title',
    desc: 'features.items.0.desc',
  },
  {
    icon: Package,
    title: 'features.items.1.title',
    desc: 'features.items.1.desc',
  },
  {
    icon: BarChart2,
    title: 'features.items.2.title',
    desc: 'features.items.2.desc',
  },
  {
    icon: TrendingDown,
    title: 'features.items.3.title',
    desc: 'features.items.3.desc',
  },
  {
    icon: LayoutDashboard,
    title: 'features.items.4.title',
    desc: 'features.items.4.desc',
  },
  {
    icon: Bell,
    title: 'features.items.5.title',
    desc: 'features.items.5.desc',
  },
  {
    icon: ShieldCheck,
    title: 'features.items.6.title',
    desc: 'features.items.6.desc',
  },
]

export function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <section className="section-pad bg-background">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">{t('features.label')}</p>
          <h2 className="text-h1 text-foreground">{t('features.title')}</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-card border border-border rounded-lg p-6 md:p-7 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-h3 text-foreground mb-2">{t(title)}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
