import { Navbar }                   from '@/components/landing/Navbar'
import { HeroSection }               from '@/components/landing/HeroSection'
import { TrustSection }              from '@/components/landing/TrustSection'
import { ProblemSection }            from '@/components/landing/ProblemSection'
import { SolutionSection }           from '@/components/landing/SolutionSection'
import { DynamicPricingSection }     from '@/components/landing/DynamicPricingSection'
import { MarketIntelligenceSection } from '@/components/landing/MarketIntelligenceSection'
import { SavingsSection }            from '@/components/landing/SavingsSection'
import { FeaturesSection }           from '@/components/landing/FeaturesSection'
import { HowItWorks }                from '@/components/landing/HowItWorks'
import { OrganizationsSection }     from '@/components/landing/OrganizationsSection'
import { FAQSection }                from '@/components/landing/FAQSection'
import { FinalCTA }                  from '@/components/landing/FinalCTA'
import { Footer }                    from '@/components/landing/Footer'

export function Landing() {
  return (
    <div className="bg-background text-foreground font-sans">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ProblemSection />
      <SolutionSection />
      <DynamicPricingSection />
      <MarketIntelligenceSection />
      <SavingsSection />
      <FeaturesSection />
      <HowItWorks />
      <OrganizationsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}
