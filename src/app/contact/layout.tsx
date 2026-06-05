import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Contenaissance | Start Your Creative Project",
  description:
    "Discuss your next AI-powered video, campaign, or content project with our creative team.",
  alternates: {
    canonical: "https://www.contenaissance.com/contact",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
