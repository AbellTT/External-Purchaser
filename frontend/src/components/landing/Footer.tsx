import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBasket, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return

    setIsSubmitting(true)
    try {
      // Production: calls POST /api/contact/submit
      // Mock: simulates a 600ms network delay then succeeds
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Simulate ~95% success rate for mock
          if (Math.random() > 0.05) resolve()
          else reject(new Error('Network error'))
        }, 600)
      })
      // Uncomment when backend is live:
      // await api.post('/contact/submit', { email, message })

      setSent(true)
      setEmail('')
      setMessage('')
      toast.success('Message sent!', {
        description: "Our team will get back to you within 24 hours.",
      })
      setTimeout(() => setSent(false), 5000)
    } catch {
      toast.error('Failed to send message', {
        description: 'Please try again or email us directly.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer id="contact" className="bg-foreground text-primary-foreground">
      <div className="container-base py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBasket className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-lg">External Purchaser</span>
            </div>

            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-sm">
              Group procurement platform for Ethiopian institutions — connecting schools, universities, and organizations directly to wholesale prices.
            </p>

            <div className="space-y-3 pt-2">
              <a href="mailto:hello@externalpurchaser.et" className="flex items-center gap-2.5 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                hello@externalpurchaser.et
              </a>
              <a href="tel:+251115000000" className="flex items-center gap-2.5 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                +251 11 500 0000
              </a>
              <p className="flex items-center gap-2.5 text-sm text-primary-foreground/60">
                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                Addis Ababa, Ethiopia
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/40 mb-3">Platform Access</p>
              <Link to="/login" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors underline underline-offset-4">
                Institutional Member Login →
              </Link>
            </div>
          </div>

          {/* Contact Us Form Col */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-primary-foreground mb-1">Contact Us</h3>
            <p className="text-xs text-primary-foreground/60 mb-6">
              Have questions about dynamic basket pricing or registration? Send us a direct message.
            </p>

            {sent ? (
              <div className="bg-primary/20 border border-primary/30 rounded-xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                <p className="font-semibold text-primary-foreground text-sm">Message Sent Successfully!</p>
                <p className="text-xs text-primary-foreground/60">Thank you for reaching out. Our procurement team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="footer-email" className="block text-xs font-medium text-primary-foreground/70 mb-1.5">
                    Your Email
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    required
                    placeholder="name@institution.edu.et"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="footer-msg" className="block text-xs font-medium text-primary-foreground/70 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="footer-msg"
                    required
                    rows={3}
                    placeholder="Tell us about your institution's stationery requirements..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2 font-semibold text-sm">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/30">
            © {year} External Purchaser. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/30">
            Built for Ethiopian institutions.
          </p>
        </div>
      </div>
    </footer>
  )
}

