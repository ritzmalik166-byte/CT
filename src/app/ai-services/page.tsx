import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import {
  AI_SERVICES,
  AI_SERVICES_PATH,
  FALLBACK_INSIGHT_IMAGES,
  FALLBACK_INSIGHTS,
  type Insight,
} from "@/components/ai-services/content";
import { Hero } from "@/components/ai-services/Hero";
import { MotionProvider } from "@/components/ai-services/motion";
import {
  FeaturedInsights,
  Interlude,
  ProjectCta,
  ServicesList,
} from "@/components/ai-services/sections";
import { CTAFooter } from "@/components/home/CTAFooter";
import { serializeJsonLd } from "@/lib/blog-schema";
import { query } from "@/lib/db";
import type { Blog } from "@/types/admin";
import "@/components/ai-services/ai-services.css";

/** Featured insights come from the blog DB; refresh hourly without a redeploy. */
export const revalidate = 3600;

// No explicit `weight`: static weights make Turbopack production builds fail for this family.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-ais-serif",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-ais-sans", display: "swap" });

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.contenaissance.com").replace(
  /\/+$/,
  "",
);
const SITE_NAME = "Contenaissance";

/** Must stay in sync with `images.remotePatterns` in next.config.ts. */
const OPTIMIZABLE_REMOTE_PREFIXES = [
  "https://contenaissance.blob.core.windows.net/ct-assets/",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

type InsightRow = Pick<Blog, "slug" | "title" | "cover_image" | "blog_keywords" | "published_at">;

function toInsight(row: InsightRow, index: number): Insight {
  const cover = row.cover_image?.trim();
  const image = cover || FALLBACK_INSIGHT_IMAGES[index % FALLBACK_INSIGHT_IMAGES.length];
  const keyword = row.blog_keywords?.split(",")[0]?.trim();
  const published = row.published_at ? new Date(row.published_at) : null;
  const hasDate = published !== null && !Number.isNaN(published.getTime());

  return {
    href: `/blog/${encodeURIComponent(row.slug)}`,
    title: row.title,
    category: keyword && keyword.length <= 22 ? keyword : "Journal",
    publishedAt: hasDate ? published.toISOString() : null,
    dateLabel: hasDate ? dateFormatter.format(published) : "From the journal",
    image,
    optimizable:
      image.startsWith("/") || OPTIMIZABLE_REMOTE_PREFIXES.some((p) => image.startsWith(p)),
  };
}

async function getFeaturedInsights(limit = 3): Promise<Insight[]> {
  try {
    const rows = await query<InsightRow>(
      `SELECT slug, title, cover_image, blog_keywords, published_at
       FROM blogs
       WHERE status = 'published'
       ORDER BY published_at DESC, created_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.length > 0 ? rows.map(toInsight) : FALLBACK_INSIGHTS;
  } catch (error) {
    console.error("[ai-services] Failed to load featured insights:", error);
    return FALLBACK_INSIGHTS;
  }
}

const TITLE = "AI Services | AI Brand Films, Campaigns & Visual Identity | Contenaissance";
const DESCRIPTION =
  "AI brand films, AI-powered campaigns, visual identity systems, and digital-first content from Contenaissance — an AI creative studio crafting cinematic, data-driven brand experiences.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI services",
    "AI brand films",
    "AI-powered campaigns",
    "visual identity system",
    "digital-first content",
    "generative AI studio",
    "AI creative agency India",
  ],
  alternates: { canonical: AI_SERVICES_PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: AI_SERVICES_PATH,
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: "/assets/ai-services/interlude-hands.png",
        width: 1024,
        height: 397,
        alt: "Two hands reaching toward each other above sunlit clouds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/assets/ai-services/interlude-hands.png"],
  },
};

function buildStructuredData() {
  const pageUrl = `${SITE_URL}${AI_SERVICES_PATH}`;
  const provider = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "AI Services", item: pageUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#services`,
        name: "AI Services",
        itemListElement: AI_SERVICES.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Service",
            "@id": `${pageUrl}#${service.id}`,
            name: service.title,
            serviceType: service.title,
            description: service.description,
            url: `${pageUrl}#${service.id}`,
            image: `${SITE_URL}${service.image.src}`,
            provider,
            areaServed: "IN",
          },
        })),
      },
    ],
  };
}

export default async function AiServicesPage() {
  const insights = await getFeaturedInsights();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildStructuredData()) }}
      />

      <div className={`ais-page relative ${serif.variable} ${sans.variable}`}>
        <MotionProvider>
          <main>
            <Hero />
            <ServicesList services={AI_SERVICES} />
            <Interlude />
            <FeaturedInsights insights={insights} />
            <ProjectCta />
          </main>
        </MotionProvider>
      </div>

      <CTAFooter showBrandHeading={false} />
    </>
  );
}
