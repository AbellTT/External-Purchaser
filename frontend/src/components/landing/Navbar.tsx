import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingBasket, ChevronDown, Building2, Package, Users, Truck } from 'lucide-react'

const HOW_IT_WORKS_STEPS = [
  { n: '01', title: 'Register Organization', desc: 'Create account & verify TIN for wholesale rates.', icon: Building2 },
  { n: '02', title: 'Select Stationery', desc: 'Browse catalog with 2 yrs price trends.', icon: Package },
  { n: '03', title: 'Join Volume Pool', desc: 'Combine demand with other institutions.', icon: Users },
  { n: '04', title: 'Scheduled Delivery', desc: 'Confirm terms via call & receive goods.', icon: Truck },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHowDropdown, setShowHowDropdown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setShowHowDropdown(false)
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navLinkClass = `text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 cursor-pointer flex items-center gap-1`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-card/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-base h-16 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShoppingBasket className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-base tracking-tight text-foreground">
            External Purchaser
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-6">
          {/* How It Works with Dropdown Preview */}
          <div
            className="relative"
            onMouseEnter={() => setShowHowDropdown(true)}
            onMouseLeave={() => setShowHowDropdown(false)}
          >
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className={navLinkClass}
            >
              How It Works
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHowDropdown ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showHowDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 z-50">
                <div className="bg-card border border-border rounded-xl shadow-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-mono font-semibold text-primary uppercase">4 Simple Steps</span>
                    <span className="text-[11px] text-muted-foreground">Hover overview</span>
                  </div>
                  <div className="space-y-2">
                    {HOW_IT_WORKS_STEPS.map(({ n, title, desc, icon: Icon }) => (
                      <div key={n} className="flex gap-2.5 items-start p-1.5 rounded-lg hover:bg-surface-muted transition-colors">
                        <div className="w-6 h-6 rounded-md bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <span className="text-primary font-mono text-[10px]">{n}.</span> {title}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="w-full text-center text-xs font-semibold text-primary hover:underline pt-1 block"
                  >
                    Scroll to detailed view ↓
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className={navLinkClass}
          >
            FAQ
          </button>
        </div>

        {/* ── Right Actions ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1"
          >
            Login
          </Link>
          <Button size="sm" onClick={() => navigate('/signup')} className="font-semibold shadow-xs">
            Get Started
          </Button>
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden p-2 rounded-md text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-sm font-medium text-foreground"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left py-2 text-sm font-medium text-foreground"
          >
            FAQ
          </button>
          <div className="pt-3 flex gap-3 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setMobileOpen(false)
                navigate('/login')
              }}
            >
              Login
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setMobileOpen(false)
                navigate('/signup')
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

