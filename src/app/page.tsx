import type { Metadata } from "next";
import { CinematicHero } from "@/components/home/CinematicHero";
import { TrustedByMarquee } from "@/components/home/TrustedByMarquee";
import { AIFeaturesGrid } from "@/components/home/AIFeaturesGrid";
// import { StickyScrollShowcase } from "@/components/home/StickyScrollShowcase";
// import { ProductExperience } from "@/components/home/ProductExperience";
import { AnimatedStats } from "@/components/home/AnimatedStats";
import { CaseStudies } from "@/components/home/CaseStudies";
import { ExpertiseSection } from "@/components/home/ExpertiseSection";
import { Testimonials } from "@/components/home/Testimonials";
import { TransitionSection } from "@/components/home/TransitionSection";
import { CatchTheLogoSection } from "@/components/home/CatchTheLogoSection";
import { CTAFooter } from "@/components/home/CTAFooter";

export const metadata: Metadata = {
  title: "AI Creative Agency for Video Production & Storytelling",
  description:
    "AI creative agency specializing in video production, brand storytelling, and content that drives engagement and audience growth.",
  keywords: [
    "AI Video Production Agency",
    "AI Content Creation",
    "Brand Storytelling",
    "Creative Agency",
    "AI Marketing Agency",
    "Commercial Video Production",
    "Digital Content Creation",
    "Social Media Content Production",
    "Branded Content Agency",
    "AI Creative Services",
  ],
  alternates: {
    canonical: "https://www.contenaissance.com/",
  },
};

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
      <TransitionSection />
      <CatchTheLogoSection />
      <CTAFooter />
    </main>
  );
}
