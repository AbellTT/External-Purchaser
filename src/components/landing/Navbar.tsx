import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingBasket } from 'lucide-react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass = `text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 cursor-pointer`

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
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShoppingBasket className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-base tracking-tight text-foreground">
            External Purchaser
          </span>
        </a>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className={navLinkClass}>How It Works</a>
          <a href="#faq" className={navLinkClass}>FAQ</a>
        </div>

        {/* ── Right Actions ── */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Login
          </a>
          <Button size="sm">
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
          <a
            href="#how-it-works"
            className="block py-2 text-sm font-medium text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#faq"
            className="block py-2 text-sm font-medium text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            FAQ
          </a>
          <div className="pt-3 flex gap-3 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => window.location.href='/login'}>Login</Button>
            <Button className="flex-1">Get Started</Button>
          </div>
        </div>
      )}
    </header>
  )
}

