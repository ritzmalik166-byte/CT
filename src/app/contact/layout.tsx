import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Contenaissance | Start Your Creative Project",
  description:
    "Contact our creative team to discuss AI-powered videos, brand campaigns, and content solutions for your business goals.",
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
