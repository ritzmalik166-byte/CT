import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Content Creation & Video Production Services",
  description:
    "Professional AI video production, content creation, and digital marketing services tailored to help brands grow faster.",
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
