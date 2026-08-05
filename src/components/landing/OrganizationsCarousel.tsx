import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  School, University, Landmark, Heart, Briefcase, Building, Hospital,
  ChevronRight, ChevronLeft
} from 'lucide-react'

const orgs = [
  {
    icon: School,
    title: 'Schools',
    desc: 'Primary, secondary, and preparatory schools with regular stationery and classroom supply needs.',
  },
  {
    icon: University,
    title: 'Universities',
    desc: 'Higher education institutions managing procurement across multiple departments and faculties.',
  },
  {
    icon: Landmark,
    title: 'Government Offices',
    desc: 'Federal ministries, regional bureaus, and city administrations running formal procurement cycles.',
  },
  {
    icon: Heart,
    title: 'NGOs',
    desc: 'Non-governmental organizations managing donor-funded procurement with strict budget accountability.',
  },
  {
    icon: Briefcase,
    title: 'Private Companies',
    desc: 'Corporate procurement teams consolidating annual office supply purchasing across branches.',
  },
  {
    icon: Building,
    title: 'Banks & Financial Institutions',
    desc: 'Regulated institutions with centralized procurement and multi-branch supply requirements.',
  },
  {
    icon: Hospital,
    title: 'Hospitals & Health Centres',
    desc: 'Healthcare facilities procuring administrative stationery alongside clinical supplies.',
  }
]

export function OrganizationsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setActiveIndex((curr) => (curr + 1) % orgs.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Check window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }
    handleResize() // check on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const next = () => {
    setDirection(1)
    setActiveIndex((curr) => (curr + 1) % orgs.length)
  }
  
  const prev = () => {
    setDirection(-1)
    setActiveIndex((curr) => (curr - 1 + orgs.length) % orgs.length)
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 30 : -30,
      opacity: 0,
    })
  }

  return (
    <section className="section-pad bg-background overflow-hidden border-t border-border">
      <div className="container-base">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Copy & Controls */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <p className="text-label text-primary mb-4">Who We Serve</p>
              <h2 className="font-display text-[2.5rem] lg:text-[3rem] text-foreground leading-[1.1] font-bold max-w-sm">
                For organizations going places.
              </h2>
            </div>
            
            <p className="text-body-md text-muted-foreground max-w-md">
              From small NGOs in regional towns to the largest government ministries in Addis Ababa —
              any institution with a recurring stationery budget can benefit from our pooled procurement model.
            </p>

            {/* Carousel Controls (Hidden on Mobile) */}
            {!isMobile && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={prev}
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button 
                  onClick={next}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover transition-colors shadow-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Calm Carousel (Hidden on Mobile) */}
          {!isMobile && (
            <div className="relative h-[260px] md:h-[300px] w-full max-w-md md:max-w-lg mx-auto lg:mx-0 lg:ml-auto">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-full"
                >
                  <div className="h-full w-full bg-card border border-border rounded-xl p-10 shadow-sm flex flex-col justify-center">
                    {(() => {
                      const org = orgs[activeIndex]
                      const Icon = org.icon
                      return (
                        <>
                          <div className="w-14 h-14 rounded-xl bg-primary-subtle flex items-center justify-center mb-8">
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="text-2xl font-display font-semibold text-foreground mb-4">
                            {org.title}
                          </h3>
                          <p className="text-body-md text-muted-foreground leading-relaxed">
                            {org.desc}
                          </p>
                        </>
                      )
                    })()}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Grid: 4 items (Shown ONLY on Mobile <= 640px) */}
        {isMobile && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {orgs.slice(0, 4).map((org) => {
              const Icon = org.icon
              return (
                <div key={org.title} className="bg-card border border-border rounded-xl p-3 shadow-sm flex flex-col">
                  <div className="w-8 h-8 rounded-lg bg-primary-subtle flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-display font-semibold text-foreground mb-1">
                    {org.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {org.desc}
                  </p>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
