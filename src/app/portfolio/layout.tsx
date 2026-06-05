import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creative Portfolio | AI Brand Films & Commercials",
  description:
    "Explore our portfolio of AI-generated brand films, commercials, and digital campaigns designed to captivate audiences.",
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
