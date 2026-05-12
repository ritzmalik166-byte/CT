import { CinematicHero } from "@/components/home/CinematicHero";
import { TrustedByMarquee } from "@/components/home/TrustedByMarquee";
import { AIFeaturesGrid } from "@/components/home/AIFeaturesGrid";
// import { StickyScrollShowcase } from "@/components/home/StickyScrollShowcase";
// import { ProductExperience } from "@/components/home/ProductExperience";
import { AnimatedStats } from "@/components/home/AnimatedStats";
import { CaseStudies } from "@/components/home/CaseStudies";
import { ExpertiseSection } from "@/components/home/ExpertiseSection";
import { Testimonials } from "@/components/home/Testimonials";
import { CTAFooter } from "@/components/home/CTAFooter";

export default function Home() {
  return (
    <main className="relative">
      <CinematicHero />
      <TrustedByMarquee />
      <AIFeaturesGrid />
      {/* <StickyScrollShowcase /> */}
      {/* <ProductExperience /> */}
      {/* <AnimatedStats /> */}
      {/* <CaseStudies /> */}
      <ExpertiseSection />
      <Testimonials />
      <CTAFooter />
    </main>
  );
}
