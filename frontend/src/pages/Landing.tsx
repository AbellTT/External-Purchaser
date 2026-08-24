import { useTranslation } from 'react-i18next'
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
import { PageMeta }                  from '@/components/PageMeta'

const LANDING_META = {
  en: {
    title: 'Collective Stationery Procurement',
    description: "Pool your organization's purchasing power with others to unlock wholesale pricing on stationery products.",
  },
  am: {
    title: 'የጋራ የጽሑፍ እቃ ግዢ',
    description: 'የድርጅትዎን የግዢ ኃይል ከሌሎች ጋር አንድ በማድረግ በጽሑፍ እቃዎች ላይ የጅምላ ዋጋ ያግኙ።',
  },
} as const

export function Landing() {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('am') ? 'am' : 'en'
  return (
    <div className="bg-background text-foreground font-sans">
      <PageMeta
        title={LANDING_META[lang].title}
        description={LANDING_META[lang].description}
        path="/"
      />
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
