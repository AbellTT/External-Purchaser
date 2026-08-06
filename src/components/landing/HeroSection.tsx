import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import BlurText from '@/components/ui/blur-text'
import { ArrowRight, ShoppingCart, TrendingDown, Users, PackageCheck, LineChart } from 'lucide-react'

/* ──────────────────────────────────────────────────────────────
   Floating Graphics — surrounding the center
────────────────────────────────────────────────────────────── */
function HeroFloatingGraphics() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden min-[1563px]:block overflow-hidden z-0">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Floating Card 1: Basket Status (Top Left) */}
      <motion.div
        initial={{ y: 30, opacity: 0, rotate: -4 }}
        animate={{ y: 0, opacity: 1, rotate: -8 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        className="absolute top-32 left-12 xl:left-24 w-80 bg-card border border-border shadow-2xl rounded-2xl p-6 z-10"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center shrink-0">
             <ShoppingCart className="text-primary w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">A4 Paper (80gsm)</div>
            <div className="text-xs text-muted-foreground">Active Pool • 45 orgs</div>
          </div>
        </div>
        <div className="space-y-3">
           <div className="flex justify-between text-xs">
             <span className="text-muted-foreground">Volume Commitment</span>
             <span className="font-semibold text-foreground">7,500 / 10,000</span>
           </div>
           <div className="w-full bg-muted rounded-full h-2.5">
             <div className="bg-primary h-2.5 rounded-full w-[75%]" />
           </div>
        </div>
      </motion.div>

      {/* Floating Card 2: Savings Tag (Bottom Right) */}
      <motion.div
         initial={{ y: -30, opacity: 0, rotate: 4 }}
         animate={{ y: 0, opacity: 1, rotate: 8 }}
         transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
         className="absolute bottom-32 right-12 xl:right-32 bg-primary text-primary-foreground shadow-2xl rounded-xl p-5 flex items-center gap-4 border border-primary-hover z-20"
      >
         <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-white" />
         </div>
         <div>
            <div className="text-2xl font-bold font-display leading-none mb-1">5–20%</div>
            <div className="text-xs text-white/80 font-medium">Below Retail Price</div>
         </div>
      </motion.div>

      {/* Floating Card 3: Network Stats (Bottom Left) */}
      <motion.div
         initial={{ x: -30, opacity: 0, rotate: -5 }}
         animate={{ x: 0, opacity: 1, rotate: -12 }}
         transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
         className="absolute bottom-40 left-20 xl:left-40 bg-card border border-border shadow-xl rounded-xl p-4 flex items-center gap-3 z-0"
      >
         <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-accent" />
         </div>
         <div>
            <div className="text-sm font-bold text-foreground">500+</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Institutions</div>
         </div>
      </motion.div>

      {/* Floating Card 4: Delivery Pill (Top Right) */}
      <motion.div
         initial={{ y: 20, opacity: 0, rotate: 8 }}
         animate={{ y: 0, opacity: 1, rotate: 12 }}
         transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 }}
         className="absolute top-24 right-20 xl:right-48 bg-card border border-border shadow-lg rounded-full py-2 px-4 flex items-center gap-2 z-10"
      >
         <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <PackageCheck className="w-3.5 h-3.5 text-green-700" />
         </div>
         <span className="text-xs font-semibold text-foreground">Delivery Verified</span>
      </motion.div>
      
      {/* Floating Card 5: Price Alert (Middle Right) */}
      <motion.div
         initial={{ x: 30, opacity: 0, rotate: 6 }}
         animate={{ x: 0, opacity: 1, rotate: 4 }}
         transition={{ duration: 1.4, ease: "easeOut", delay: 0.7 }}
         className="absolute top-1/2 right-12 xl:right-24 -translate-y-1/2 bg-card border border-border shadow-xl rounded-2xl p-4 flex items-center gap-3 z-30"
      >
         <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <LineChart className="w-5 h-5 text-orange-600" />
         </div>
         <div>
            <div className="text-sm font-bold text-foreground">Price Drop</div>
            <div className="text-xs text-muted-foreground">Pens & Markers</div>
         </div>
      </motion.div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Hero Section — Center aligned
────────────────────────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-background pt-16 sm:pt-20 flex items-center justify-center overflow-hidden">
      <HeroFloatingGraphics />

      {/* ── Content ── */}
      <div className="relative z-10 container-base w-full py-12 sm:py-20 md:py-28 flex flex-col items-center text-center">
        <div className="max-w-5xl">

          {/* Main Headline */}
          <div className="mb-6 sm:mb-10 flex flex-col items-center w-full">
            <BlurText
              text="Purchase Smarter."
              delay={50}
              className="text-[2.25rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-display font-bold leading-[1.1] text-foreground flex justify-center tracking-tight text-center"
            />
            <BlurText
              text="Save More Together."
              delay={50}
              className="text-[2.25rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-display font-bold leading-[1.1] text-primary flex justify-center tracking-tight text-center"
              animationFrom={{ filter: 'blur(12px)', opacity: 0, y: 40 }}
            />
          </div>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 px-2"
          >
            Ethiopian institutions — schools, universities, NGOs, government offices, and companies —
            combine their purchasing power to unlock wholesale prices directly from Merkato suppliers.
            Two years of monthly price history, live basket tracking, and full procurement analytics.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
            className="flex justify-center w-full max-w-sm sm:max-w-md mx-auto"
          >
            <Button
              asChild
              size="lg"
              className="w-full h-13 sm:h-14 text-base sm:text-lg font-bold gap-2 shadow-lg rounded-xl px-8"
            >
              <Link to="/signup">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

