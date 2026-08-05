const steps = [
  {
    n: '01',
    title: 'Register Your Organization',
    desc: 'Create an institutional account. Our team verifies your organization to unlock wholesale access.',
  },
  {
    n: '02',
    title: 'Choose Your Products',
    desc: 'Browse our stationery catalog with current basket prices and historical data.',
  },
  {
    n: '03',
    title: 'Join a Basket',
    desc: 'Pool demand with other institutions, or purchase directly at our wholesale rate.',
  },
  {
    n: '04',
    title: 'Receive Your Order',
    desc: 'Track your order from confirmation to delivery. Receive detailed invoices showing savings.',
  },
]

export function HowItWorks() {
  return (
    <section className="section-pad bg-muted/40 py-24">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <p className="text-label text-primary mb-4">How It Works</p>
          <h2 className="text-h1 text-foreground">Four Steps to Smarter Procurement</h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-border z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-10 relative z-10">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-start lg:items-center">
                {/* Number Badge */}
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display text-xl font-bold shrink-0 mb-8 ring-8 ring-background">
                  {s.n}
                </div>

                <div className="lg:text-justify">
                  <h3 className="text-h3 text-foreground mb-4 lg:text-center">{s.title}</h3>
                  <p className="text-body-md text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
