export type ContentImage = {
  src: string;
  alt: string;
};

export type AiService = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: ContentImage;
};

export type Insight = {
  href: string;
  title: string;
  category: string;
  publishedAt: string | null;
  dateLabel: string;
  image: string;
  /** False for hosts outside `images.remotePatterns`; rendered with `unoptimized`. */
  optimizable: boolean;
};

export const AI_SERVICES_PATH = "/ai-services";

export const NAV_LINKS: { label: string; href: string; active?: boolean }[] = [
  { label: "Studio", href: "/" },
  { label: "Services", href: AI_SERVICES_PATH, active: true },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

export const HERO_VIDEO_SRC =
  "https://contenaissance.blob.core.windows.net/ct-assets/home.mp4";

export const AI_SERVICES: AiService[] = [
  {
    id: "ai-brand-films",
    title: "AI Brand Films",
    description:
      "Cinematic brand films that fuse generative AI, 3D worlds and live action. Every frame, transition, and story beat is crafted to make your brand unforgettable.",
    tags: ["Generative Storytelling", "3D & CGI Worlds", "Cinematic Ads", "Brand Narratives"],
    image: {
      src: "/assets/ai-services/service-design.png",
      alt: "Monochrome 3D render of glowing metallic rings orbiting a light column",
    },
  },
  {
    id: "ai-powered-campaigns",
    title: "AI-Powered Campaigns",
    description:
      "Data-led campaigns that learn as they run. Predictive targeting, performance creative, and continuous optimisation turn every rupee of ad spend into measurable growth.",
    tags: ["Predictive Targeting", "Performance Creative", "Market Analysis", "Scalable Campaigns"],
    image: {
      src: "/assets/ai-services/service-development.png",
      alt: "Holographic code editor floating above a neon data grid",
    },
  },
  {
    id: "visual-identity",
    title: "Visual Identity System",
    description:
      "Scalable identity systems that define how your brand looks, moves, and behaves — from logo architecture and typography to motion and UI components.",
    tags: ["Brand Frameworks", "Design Systems", "Typography", "Motion Identity"],
    image: {
      src: "/assets/ai-services/service-brand.png",
      alt: "Blank canvas tote bag hanging on a concrete wall in dramatic light",
    },
  },
  {
    id: "digital-first-content",
    title: "Digital-First Content",
    description:
      "Platform-native content produced at the speed of culture. AI-assisted creation and audience analytics keep your social, web, and commerce creatives sharp and on-brand.",
    tags: ["Social Creatives", "Platform-Native", "AI Content Ops", "Audience Analytics"],
    image: {
      src: "/assets/G2.jpg",
      alt: "Editorial AI portrait of a face resting on iridescent sequinned hands",
    },
  },
];

export const INTERLUDE_IMAGE: ContentImage = {
  src: "/assets/ai-services/interlude-hands.png",
  alt: "Two hands reaching toward each other above sunlit clouds",
};

export const CTA_TILES: ContentImage[] = [
  { src: "/assets/ai-services/cta-tile-1.png", alt: "Symmetrical neon AI artwork in red and cyan" },
  { src: "/assets/ai-services/cta-tile-2.png", alt: "Pink fantasy forest with a glowing path" },
  { src: "/assets/ai-services/cta-tile-3.png", alt: "Monochrome generative glitch pattern" },
  { src: "/assets/ai-services/cta-tile-4.png", alt: "Red humanoid figure with glowing blue eyes" },
  { src: "/assets/ai-services/cta-tile-5.png", alt: "Cyan particle burst on a dark background" },
];

export const FALLBACK_INSIGHT_IMAGES = [
  "/assets/ai-services/insight-innovations.png",
  "/assets/ai-services/insight-craftsmanship.png",
  "/assets/ai-services/insight-webgl.png",
];

/** Shown when the blog has no published posts or the database is unreachable. */
export const FALLBACK_INSIGHTS: Insight[] = [
  { title: "Frontier innovations in UX and generative UI", category: "Innovations" },
  { title: "Merging physical craftsmanship with digital code", category: "Agency News" },
  { title: "Performance thresholds for WebGL and 3D web", category: "Development" },
].map((item, index) => ({
  ...item,
  href: "/blog",
  publishedAt: null,
  dateLabel: "From the journal",
  image: FALLBACK_INSIGHT_IMAGES[index],
  optimizable: true,
}));
