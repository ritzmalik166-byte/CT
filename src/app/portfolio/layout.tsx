import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creative Portfolio | AI Brand Films & Commercials",
  description:
    "View our portfolio of AI-generated commercials, brand films, and digital content campaigns.",
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
