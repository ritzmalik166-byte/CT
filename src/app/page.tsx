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
export const metadata: Metadata = {
  title: "Contenaissance | AI Creative Agency, Branding & Digital Marketing Company",
  description:
    "Contenaissance is an AI-powered creative agency offering branding, website development, digital marketing, content creation, UI/UX design, and business growth solutions for modern brands.",
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
      <IndependenceCorner />
      <FloatingCTA />
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
      <HiddenHeadings />
      <CTAFooter />
    </main>
  );
}
