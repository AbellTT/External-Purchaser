const tiers = [
  {
    label: 'Small School',
    example: 'Bekele Molla Primary School, Addis',
    volume: '250 Reams of A4 Paper',
    retailCost: 'ETB 250,000',
    basketCost: 'ETB 225,000',
    savings: 'ETB 25,000',
    rate: '−10%',
    desc: 'At ETB 1,000/ream retail, pooling paper demand saves ETB 100 per ream for small school budgets.',
  },
  {
    label: 'Medium Organization',
    example: 'Hawassa City Administration',
    volume: '1,500 Reams of A4 Paper',
    retailCost: 'ETB 1,500,000',
    basketCost: 'ETB 1,335,000',
    savings: 'ETB 165,000',
    rate: '−11%',
    featured: true,
    desc: 'Consolidating quarterly paper purchasing recovers significant capital that can fund office equipment.',
  },
  {
    label: 'Large Institution',
    example: 'Addis Ababa University',
    volume: '12,000 Reams of A4 Paper',
    retailCost: 'ETB 12,000,000',
    basketCost: 'ETB 10,560,000',
    savings: 'ETB 1,440,000',
    rate: '−12%',
    desc: 'Multi-thousand ream volume unlocks maximum basket discounts, generating seven-figure annual savings.',
  },
]

export function SavingsSection() {
  return (
    <section className="section-pad bg-muted/40">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">Why It Matters</p>
          <h2 className="text-h1 text-foreground font-display">Small Price Drops, Transformative Savings</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            Using core stationery like <strong className="text-foreground">A4 Paper (80gsm)</strong> (ETB 1,000 retail reference), see how dynamic group purchasing lowers unit price and yields massive institutional savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {tiers.map((t) => (
            <div
              key={t.label}
              className={`bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                t.featured
                  ? 'border-2 border-primary/40 ring-4 ring-primary/5 shadow-md'
                  : 'border border-border'
              }`}
            >
              {t.featured && (
                <div className="mb-4">
                  <span className="badge-savings">Typical Case</span>
                </div>
              )}
              <p className="text-label text-muted-foreground mb-1 normal-case tracking-normal">{t.label}</p>
              <p className="text-xs text-muted-foreground italic mb-2">{t.example}</p>
              <p className="text-xs font-semibold text-primary mb-5">{t.volume}</p>

              <div className="space-y-3 mb-6 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Retail Retail Cost:</span>
                  <span className="font-mono text-muted-foreground line-through">{t.retailCost}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-foreground">Group Basket Cost:</span>
                  <span className="font-mono text-foreground">{t.basketCost}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="text-xs font-bold text-success">Total Net Savings:</span>
                  <span className="font-mono text-lg font-bold text-success">{t.savings} <span className="text-xs font-normal">({t.rate})</span></span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

