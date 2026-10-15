import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Content Creation & Video Production Services India",
  description:
    "Discover Contenaissance's AI-powered creative services, including brand films, digital content creation, marketing campaigns and visual identity design.",
  alternates: {
    canonical: "https://www.contenaissance.com/services",
  },
};

export default function ServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
