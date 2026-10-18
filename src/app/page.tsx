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
import { HiddenHeadings } from "@/components/home/HiddenHeadings";
import FloatingCTA from "@/components/FloatingCTA";
import IndependenceCorner from "@/components/independence/IndependenceCorner";
import { SHOW_INDEPENDENCE_DAY } from "../../site-config";
import ClientReviewsSection from "@/components/home/ClientReviews";
import LogosSection from "@/components/home/logossection";
export const metadata: Metadata = {
  title: "AI Creative Agency & Digital Marketing Co. | Contenaissance",
  description:
    "Contenaissance helps brands stand out with AI-powered brand films, creative campaigns, branding, web design, SEO and digital marketing built around your goals.",
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
      {SHOW_INDEPENDENCE_DAY && <IndependenceCorner />}
      <FloatingCTA />
      <CinematicHero />
      <LogosSection />
      {/* <TrustedByMarquee /> */}
      <AIFeaturesGrid />
      {/* <StickyScrollShowcase /> */}
      {/* <ProductExperience /> */}
      {/* <AnimatedStats /> */}
      {/* <CaseStudies /> */}
      <ExpertiseSection />
      <Testimonials />
      <ClientReviewsSection />
      {/* <TransitionSection /> */}
      <CatchTheLogoSection />
      <HiddenHeadings />
      <CTAFooter />
    </main>
  );
}
