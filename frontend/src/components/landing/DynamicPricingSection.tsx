import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, TrendingDown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

/* Price per ream: ETB 1,000 retail → 5–12% discount range based on org count */
function getDiscount(orgs: number): number {
  const min = 5, max = 12
  return Math.round((min + (max - min) * (1 - Math.exp(-0.06 * orgs))) * 10) / 10
}

const RETAIL = 1000

export function DynamicPricingSection() {
  const { t } = useTranslation()
  const [orgs, setOrgs] = useState(30)

  const discountPct = getDiscount(orgs)
  const yourPrice   = Math.round(RETAIL * (1 - discountPct / 100))
  const savingsEach = RETAIL - yourPrice

  // SVG Chart Geometry — bigger viewbox for better label legibility
  const viewBoxWidth  = 600
  const viewBoxHeight = 200   // taller so Y-axis labels have more room
  const padLeft       = 72    // wider left padding so "ETB 950" doesn't clip
  const padRight      = 24
  const padTop        = 28
  const padBottom     = 28

  const plotWidth  = viewBoxWidth - padLeft - padRight
  const plotHeight = viewBoxHeight - padTop - padBottom

  const maxPrice = 950
  const minPrice = 880

  const getCoords = (o: number) => {
    const disc  = getDiscount(o)
    const price = RETAIL * (1 - disc / 100)
    const x = padLeft + ((o - 1) / 59) * plotWidth
    const y = padTop  + ((maxPrice - price) / (maxPrice - minPrice)) * plotHeight
    return { x, y, price, disc }
  }

  const allPoints = useMemo(() => {
    const pts = []
    for (let i = 1; i <= 60; i++) pts.push(getCoords(i))
    return pts
  }, [])

  const fullPathD = useMemo(() =>
    allPoints.reduce((acc, pt, idx) =>
      idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, ''),
  [allPoints])

  const activePoints = useMemo(() =>
    allPoints.filter(p => p.x <= getCoords(orgs).x + 0.5),
  [allPoints, orgs])

  const activeLineD = useMemo(() => {
    if (activePoints.length === 0) return ''
    return activePoints.reduce((acc, pt, idx) =>
      idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '')
  }, [activePoints])

  const activeAreaD = useMemo(() => {
    if (activePoints.length === 0) return ''
    const first  = activePoints[0]
    const last   = activePoints[activePoints.length - 1]
    const bottomY = padTop + plotHeight
    return `${activeLineD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`
  }, [activePoints, activeLineD])

  const currentCoord = getCoords(orgs)

  return (
    <section className="section-pad bg-primary">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-label text-primary-foreground/60 mb-3">{t('pricing.label')}</p>
          <h2 className="text-h1 text-primary-foreground">{t('pricing.title')}</h2>
          <p className="text-body-md text-primary-foreground/70 mt-4">
            {t('pricing.intro')}
            <strong className="text-primary-foreground">{t('pricing.savingsRange')}</strong>
            {t('pricing.outro')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Main Card */}
          <div className="bg-primary-hover rounded-2xl p-4 sm:p-6 md:p-8 mb-6 shadow-2xl border border-white/10">

            {/* Top Bar Header — compact on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> {t('pricing.curveLabel')}
                </span>
                <h3 className="text-sm sm:text-lg font-bold text-primary-foreground">{t('pricing.chartTitle')}</h3>
              </div>
              {/* Selected institutions badge — smaller on mobile */}
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 w-fit self-start sm:self-auto">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground/70" />
                <span className="text-xs text-primary-foreground/60">{t('pricing.selected')}</span>
                <span className="font-mono text-sm sm:text-base font-bold text-primary-foreground">{t('pricing.orgsLabel', { orgs })}</span>
              </div>
            </div>

            {/* Interactive Animated SVG Graph — taller viewBox + bigger font */}
            <div className="relative w-full mb-4 select-none">
              <svg
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="w-full h-auto overflow-visible"
              >
                <defs>
                  <linearGradient id="activeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#FFFFFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0}  />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal Grid lines & Y-axis Labels — font bumped to 13 */}
                {[950, 915, 880].map(val => {
                  const y = padTop + ((maxPrice - val) / (maxPrice - minPrice)) * plotHeight
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft} y1={y}
                        x2={viewBoxWidth - padRight} y2={y}
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 5}
                        fill="rgba(255, 255, 255, 0.55)"
                        fontSize="13"
                        fontFamily="monospace"
                        textAnchor="end"
                        fontWeight="600"
                      >
                        ETB {val}
                      </text>
                    </g>
                  )
                })}

                {/* Background (Inactive) Curve */}
                <path
                  d={fullPathD}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Active Area Gradient Fill */}
                <motion.path
                  d={activeAreaD}
                  fill="url(#activeAreaGrad)"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* Active Highlighted Line */}
                <motion.path
                  d={activeLineD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  filter="url(#glow)"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* Vertical Indicator Line */}
                <line
                  x1={currentCoord.x} y1={padTop}
                  x2={currentCoord.x} y2={padTop + plotHeight}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeDasharray="3 3"
                />

                {/* Glowing Target Dot */}
                <g transform={`translate(${currentCoord.x}, ${currentCoord.y})`}>
                  <circle r="10" fill="rgba(255, 255, 255, 0.2)" className="animate-ping" />
                  <circle r="6"  fill="#FFFFFF" stroke="var(--color-primary-hover)" strokeWidth="2" filter="url(#glow)" />
                  <circle r="2.5" fill="var(--color-primary-hover)" />
                </g>
              </svg>
            </div>

            {/* Slider Controls */}
            <div className="space-y-2 mb-6 sm:mb-8">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-1 text-xs font-semibold text-primary-foreground/80 mb-1">
                <span>{t('pricing.sliderPrompt')}</span>
                <span className="text-accent font-bold">{t('pricing.discountReached', { discountPct })}</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                value={orgs}
                onChange={e => setOrgs(Number(e.target.value))}
                className="w-full h-2.5 appearance-none rounded-full cursor-pointer transition-all"
                style={{
                  background: `linear-gradient(to right, #FFFFFF ${((orgs - 1) / 59) * 100}%, rgba(255,255,255,0.2) ${((orgs - 1) / 59) * 100}%)`,
                }}
              />
              {/* Slider legend — hide middle label on smallest screens */}
              <div className="flex justify-between text-[10px] sm:text-xs font-mono text-primary-foreground/40">
                <span>{t('pricing.legend1')}</span>
                <span className="hidden sm:inline">{t('pricing.legend30')}</span>
                <span>{t('pricing.legend60')}</span>
              </div>
            </div>

            {/* Result Cards — compact text on mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white/10 rounded-xl p-3 sm:p-5 text-center border border-white/5">
                <p className="text-[10px] sm:text-xs text-primary-foreground/50 mb-1 sm:mb-2 uppercase tracking-wider leading-tight">
                  {t('pricing.retailRef1')}<br className="sm:hidden" /> {t('pricing.retailRef2')}
                </p>
                <p className="font-mono text-primary-foreground/40 line-through text-sm sm:text-xl font-semibold">
                  ETB {RETAIL.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs text-primary-foreground/40 mt-1">{t('pricing.perReam')}</p>
              </div>

              <div className="bg-white/15 rounded-xl p-3 sm:p-5 text-center ring-2 ring-white/30 border border-white/20 shadow-lg">
                <p className="text-[10px] sm:text-xs text-primary-foreground/70 mb-1 sm:mb-2 uppercase tracking-wider font-semibold leading-tight">
                  {t('pricing.groupPrice1')}<br className="sm:hidden" /> {t('pricing.groupPrice2')}
                </p>
                <motion.p
                  key={yourPrice}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  className="font-mono text-primary-foreground text-sm sm:text-2xl font-bold"
                >
                  ETB {yourPrice.toLocaleString()}
                </motion.p>
                <p className="text-[10px] sm:text-xs text-primary-foreground/60 mt-1">{t('pricing.perReam')}</p>
              </div>

              <div className="bg-white/10 rounded-xl p-3 sm:p-5 text-center border border-white/5">
                <p className="text-[10px] sm:text-xs text-primary-foreground/50 mb-1 sm:mb-2 uppercase tracking-wider leading-tight">
                  {t('pricing.directSavings1')}<br className="sm:hidden" /> {t('pricing.directSavings2')}
                </p>
                <motion.div
                  key={discountPct}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  className="flex items-center justify-center gap-0.5 sm:gap-1"
                >
                  <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-accent shrink-0" />
                  <span className="font-mono text-accent text-sm sm:text-2xl font-bold">{discountPct}%</span>
                </motion.div>
                <p className="text-[10px] sm:text-xs text-primary-foreground/40 mt-1 leading-tight">
                  {t('pricing.saveAmount', { savingsEach })}<span className="hidden sm:inline"> {t('pricing.slashReam')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Context note */}
          <p className="text-center text-[10px] sm:text-xs text-primary-foreground/40 px-2">
            {t('pricing.contextNote')}
          </p>
        </div>
      </div>
    </section>
  )
}
