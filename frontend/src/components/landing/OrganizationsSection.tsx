import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { School, Landmark, Briefcase, Building } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import CardSwap, { Card } from '@/components/ui/card-swap'
import type { CardSwapHandle } from '@/components/ui/card-swap'

const orgs = [
  {
    icon: School,
    title: 'organizations.items.0.title',
    desc: 'organizations.items.0.desc',
    tag: 'organizations.items.0.tag',
    variant: 'primary' as const,
  },
  {
    icon: Building,
    title: 'organizations.items.1.title',
    desc: 'organizations.items.1.desc',
    tag: 'organizations.items.1.tag',
    variant: 'card' as const,
  },
  {
    icon: Briefcase,
    title: 'organizations.items.2.title',
    desc: 'organizations.items.2.desc',
    tag: 'organizations.items.2.tag',
    variant: 'primary' as const,
  },
  {
    icon: Landmark,
    title: 'organizations.items.3.title',
    desc: 'organizations.items.3.desc',
    tag: 'organizations.items.3.tag',
    variant: 'card' as const,
  },
]

export function OrganizationsSection() {
  const { t } = useTranslation()
  const swapRef = useRef<CardSwapHandle>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }
    handleResize() // check on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="section-pad bg-background border-t border-border overflow-hidden">
      <div className="container-base">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Copy & button */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <p className="text-label text-primary mb-4">{t('organizations.whoWeServe')}</p>
              <h2 className="text-h1 text-foreground leading-tight">
                {t('organizations.titleLine1')}<br />{t('organizations.titleLine2')}
              </h2>
            </div>

            <p className="text-body-md text-muted-foreground max-w-md">
              {t('organizations.description')}
            </p>

            {!isMobile && (
              <button
                onClick={() => swapRef.current?.swap()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
              >
                {t('organizations.next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Card stack (Hidden on Mobile) */}
          {!isMobile && (
            <div className="flex items-center justify-center lg:justify-center lg:-ml-12 py-10 sm:py-20">
              <CardSwap
                ref={swapRef}
                width={380}
                height={260}
                cardDistance={50}
                verticalDistance={35}
                skewAmount={3}
                easing="elastic"
              >
                {orgs.map(({ icon: Icon, title, desc, tag, variant }) => (
                  <Card
                    key={title}
                    className={
                      variant === 'primary'
                        ? 'bg-primary border-primary'
                        : 'bg-card border-border'
                    }
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          variant === 'primary'
                            ? 'bg-white/15'
                            : 'bg-primary-subtle'
                        }`}>
                          <Icon className={`w-6 h-6 ${variant === 'primary' ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          variant === 'primary'
                            ? 'bg-white/15 text-white/80'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {t(tag)}
                        </span>
                      </div>
                        <h3 className={`text-h3 mb-3 ${variant === 'primary' ? 'text-white' : 'text-foreground'}`}>
                          {t(title)}
                        </h3>
                        <p className={`text-sm leading-relaxed ${
                          variant === 'primary' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {t(desc)}
                        </p>
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </div>
          )}

        </div>

        {/* Mobile Grid: 4 items (Shown ONLY on Mobile <= 640px) */}
        {isMobile && (
          <div className="mt-10 grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
            {orgs.map(({ icon: Icon, title, desc, tag, variant }) => (
              <div 
                key={title} 
                className={`rounded-xl p-4 shadow-sm flex flex-col ${
                  variant === 'primary'
                    ? 'bg-primary border-primary'
                    : 'bg-card border border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    variant === 'primary' ? 'bg-white/15' : 'bg-primary-subtle'
                  }`}>
                    <Icon className={`w-4 h-4 ${variant === 'primary' ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                    variant === 'primary'
                      ? 'bg-white/15 text-white/80'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {t(tag)}
                  </span>
                </div>
                  <h3 className={`text-sm font-display font-semibold mb-1.5 ${
                    variant === 'primary' ? 'text-white' : 'text-foreground'
                  }`}>
                    {t(title)}
                  </h3>
                  <p className={`text-[10px] leading-relaxed ${
                    variant === 'primary' ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {t(desc)}
                  </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
