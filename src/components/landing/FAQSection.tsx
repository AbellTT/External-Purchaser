import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How are basket prices calculated?',
    a: 'Basket prices are dynamically determined through our connections with different wholesale suppliers across Merkato and major markets. As more institutions join a basket and total order volume grows, we negotiate lower unit prices with suppliers — passing the savings directly to every participating institution.',
  },
  {
    q: 'What happens if a basket does not reach its target?',
    a: 'We keep all participants informed before a basket closes. For weekly baskets, notifications are sent 2 days before closing. For monthly baskets, notifications are sent 1 week before. For 6-month baskets, notifications are sent 2 weeks before close. If a target is not met, participants can fulfill orders directly or roll their volume into the next basket.',
  },
  {
    q: 'When and how are deliveries handled?',
    a: 'All delivery logistics are confirmed and negotiated via a direct call with your procurement officer. As a guideline: Weekly baskets (starting Monday) are delivered on Saturday. Monthly baskets deliver during the 4th week of the cycle. 6-Month baskets deliver during the final month. Specific delivery dates are finalized on the call.',
  },
  {
    q: 'Can I order products directly without waiting for a basket?',
    a: 'Yes. Our Direct Purchasing option allows institutions to place orders at negotiated wholesale rates without waiting for a basket cycle to complete. Delivery terms and scheduling for direct orders are arranged directly with our team over a phone call.',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="section-pad bg-background py-24">
      <div className="container-base">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <p className="text-label text-primary mb-4">FAQ</p>
            <h2 className="text-h1 text-foreground">Common Questions</h2>
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="text-lg font-bold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-8 pb-8">
                    <p className="text-base text-muted-foreground leading-relaxed pt-2">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-base text-muted-foreground mt-12">
            Have another question?{' '}
            <a href="#contact" className="text-primary font-bold hover:underline">
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
