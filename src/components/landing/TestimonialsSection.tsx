const testimonials = [
  {
    initials: 'AT',
    name: 'Ato Tadesse Bekele',
    role: 'Procurement Officer',
    org: 'Addis Ababa City Administration',
    quote:
      'We processed our first basket of 8,000 reams of A4 paper in August and saved ETB 138,400 compared to our previous retailer contract. The price trend charts are exactly what our finance team needed to justify the budget allocation.',
  },
  {
    initials: 'WG',
    name: 'W/ro Genet Haile',
    role: 'Finance Director',
    org: 'Ethiopian Red Cross Society',
    quote:
      'As an NGO with donor-funded budgets, we need to demonstrate value for every birr spent. This platform gives us the documentation and pricing transparency that our auditors require.',
  },
  {
    initials: 'DM',
    name: 'Dr. Mekdes Alemu',
    role: 'Registrar & Admin Director',
    org: 'Jimma University',
    quote:
      'Our procurement volume qualifies us for the six-month basket, which brings our A4 paper cost down to ETB 119.00 per ream. Over 25,000 reams a year, that is a significant budget line recovered.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="section-pad bg-muted/40">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">Testimonials</p>
          <h2 className="text-h1 text-foreground">From Procurement Officers</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            Real feedback from institutional procurement teams across Ethiopia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-lg p-6 flex flex-col">
              <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5 relative">
                <span className="absolute -top-1 -left-1 text-4xl text-primary/15 font-serif leading-none select-none">"</span>
                <span className="relative">{t.quote}</span>
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.org}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
