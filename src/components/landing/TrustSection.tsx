const stats = [
  { value: '500+',   label: 'Institutions Supplied' },
  { value: '14,000+', label: 'Orders Fulfilled' },
  { value: '5 Years', label: 'Supplier Experience' },
  { value: '5–20%',  label: 'Below Market Prices' },
]

export function TrustSection() {
  return (
    <section className="bg-primary py-14">
      <div className="container-base">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-data text-3xl md:text-4xl text-primary-foreground font-bold">
                {value}
              </p>
              <p className="text-label text-primary-foreground/70 mt-1.5 normal-case tracking-normal text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
