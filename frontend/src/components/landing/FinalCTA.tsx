import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

/* ── Decorative elegant curved lines ── */
function LeftSwirl() {
  return (
    <svg
      viewBox="0 0 420 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-64 md:w-96 text-primary"
      aria-hidden="true"
    >
      <path
        d="M 0 62
           C 55 62, 95 18, 145 18
           C 195 18, 235 82, 285 82
           C 335 82, 375 48, 420 48"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function RightSwirl() {
  return (
    <svg
      viewBox="0 0 420 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-64 md:w-96 text-primary"
      aria-hidden="true"
    >
      <path
        d="
          M 0 85
          C 65 85, 100 30, 145 25
          C 190 20, 220 43, 215 72
          C 210 105, 170 118, 145 94
          C 125 75, 140 50, 165 48
          C 195 45, 215 70, 242 79
          C 280 92, 335 65, 420 55
        "
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function FinalCTA() {
  const { t } = useTranslation()
  return (
    <section className="bg-secondary border-t border-border py-16 sm:py-24 overflow-hidden">
      <div className="container-base">
        <div className="flex items-center justify-center gap-6 md:gap-10">

          {/* Left decorative line */}
          <div className="hidden lg:flex text-foreground/30 shrink-0">
            <LeftSwirl />
          </div>

          {/* Centre content */}
          <div className="text-center max-w-3xl w-full">
            <h2 className="text-h2 text-foreground leading-tight px-2">
              {t('finalCta.headingStart')}{' '}
              <em className="not-italic text-primary">{t('finalCta.headingEmphasis')}</em>
            </h2>

            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-10 h-13 text-sm sm:text-base font-semibold gap-2 rounded-full shadow-sm"
              >
                <Link to="/signup">
                  {t('finalCta.ctaButton')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mt-5">
              {t('finalCta.note')}
            </p>
          </div>

          {/* Right decorative line */}
          <div className="hidden lg:flex text-foreground/30 shrink-0">
            <RightSwirl />
          </div>

        </div>
      </div>
    </section>
  )
}

