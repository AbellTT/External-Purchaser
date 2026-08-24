import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'faq.items.0.q',
    a: 'faq.items.0.a',
  },
  {
    q: 'faq.items.1.q',
    a: 'faq.items.1.a',
  },
  {
    q: 'faq.items.2.q',
    a: 'faq.items.2.a',
  },
  {
    q: 'faq.items.3.q',
    a: 'faq.items.3.a',
  },
]

export function FAQSection() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="section-pad bg-background py-24">
      <div className="container-base">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <p className="text-label text-primary mb-4">{t('faq.label')}</p>
            <h2 className="text-h1 text-foreground">{t('faq.title')}</h2>
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
                  <span className="text-lg font-bold text-foreground pr-4">{t(faq.q)}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-8 pb-8">
                    <p className="text-base text-muted-foreground leading-relaxed pt-2">{t(faq.a)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-base text-muted-foreground mt-12">
            {t('faq.haveAnotherQuestion')}{' '}
            <a href="#contact" className="text-primary font-bold hover:underline">
              {t('faq.contactOurTeam')}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
