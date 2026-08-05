import {
  ShoppingBasket, Package, BarChart2, TrendingDown,
  LayoutDashboard, Bell, ShieldCheck
} from 'lucide-react'

const features = [
  {
    icon: ShoppingBasket,
    title: 'Collective Purchasing',
    desc: 'Pool orders with multiple institutions to unlock wholesale volume pricing unavailable to single buyers.',
  },
  {
    icon: Package,
    title: 'Direct Purchasing',
    desc: 'Need items immediately? Place direct orders at negotiated wholesale rates without waiting for a basket.',
  },
  {
    icon: BarChart2,
    title: 'Monthly Price Intelligence',
    desc: 'Access 2 years of monthly market price data collected across our network of Merkato wholesale suppliers.',
  },
  {
    icon: TrendingDown,
    title: 'Market Updates',
    desc: 'Regularly updated market intelligence so your procurement team stays informed on seasonal price shifts.',
  },
  {
    icon: LayoutDashboard,
    title: 'Procurement Dashboard',
    desc: 'A unified view of active baskets, direct orders, and overall institutional spending.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Timely notifications for upcoming basket closings, price shifts, and target threshold updates.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Organization Accounts',
    desc: 'Secure access for institutional procurement officers using verified email and password credentials.',
  },
]

export function FeaturesSection() {
  return (
    <section className="section-pad bg-background">
      <div className="container-base">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">Platform Features</p>
          <h2 className="text-h1 text-foreground">Everything Procurement Needs</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            Built for the operational realities of Ethiopian institutional procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-card border border-border rounded-lg p-6 md:p-7 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-h3 text-foreground mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
