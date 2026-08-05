import { Clock, TrendingDown, Layers } from 'lucide-react'

const baskets = [
  {
    type: 'Weekly Basket',
    for: 'Schools & institutions needing fast replenishment',
    savings: '5–10%',
    delivery: 'Starts Monday, delivered Saturday (confirmed via call)',
    desc: 'Shortest cycle for rapid restocks. Quick turnaround with solid collective savings.',
    color: 'border-info/30 bg-info-bg/30',
  },
  {
    type: 'Monthly Basket',
    for: 'Universities, government offices & companies',
    savings: '8–15%',
    delivery: 'Delivered in the 4th week (confirmed via call)',
    desc: 'Longer pooling window aggregates higher order volume, unlocking deeper wholesale discounts.',
    color: 'border-primary/30 bg-primary-subtle/50',
  },
  {
    type: 'Six-Month Basket',
    for: 'Large institutions planning annual procurement budgets',
    savings: '12–20%',
    delivery: 'Delivered in the final month (confirmed via call)',
    desc: 'Maximum accumulation window. Massive volume pooling achieves the absolute lowest unit prices.',
    color: 'border-accent/30 bg-accent-subtle/30',
  },
]

export function SolutionSection() {
  return (
    <section className="section-pad bg-muted/40">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">The Solution</p>
          <h2 className="text-h1 text-foreground">A Smarter Way to Buy Stationery</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            Our basket purchasing system pools orders across Ethiopian institutions.
            As basket duration increases, more orders accumulate — higher collective volume directly drives down unit prices, unlocking savings between <strong className="text-foreground">5% and 20%</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {baskets.map((b) => (
            <div
              key={b.type}
              className={`bg-card rounded-xl border p-6 md:p-5 lg:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${b.color}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-h3 text-foreground">{b.type}</h3>
                  <span className="badge-savings text-sm px-3 py-1">{b.savings}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{b.for}</p>

                <p className="text-xs text-foreground/80 leading-relaxed mb-6 bg-background/50 p-3 rounded-lg border border-border/40">
                  {b.desc}
                </p>
              </div>

              {/* Stats & Delivery */}
              <div className="space-y-3 pt-5 border-t border-border/50 mt-auto">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Layers className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Volume build unlocks up to <strong className="text-primary">{b.savings}</strong> off retail.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-info shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Delivery: {b.delivery}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

