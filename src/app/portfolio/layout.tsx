import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creative Portfolio | Contenaissance AI Studio",
  description:
    "Explore Contenaissance's creative portfolio featuring AI brand films, commercials, social media content, and digital experiences designed for modern brands.",
  alternates: {
    canonical: "https://www.contenaissance.com/portfolio",
  },
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
