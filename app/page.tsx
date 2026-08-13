import { HeroSection } from "@/components/landing/hero-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { ReferralCapture } from "@/components/landing/referral-capture";

export default function LandingPage() {
  return (
    <main>
      <ReferralCapture />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
