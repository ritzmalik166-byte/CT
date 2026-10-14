import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Contenaissance | Creative Agency in Noida",
  description:
    "Contact Contenaissance, a creative agency in Noida, to discuss AI video production, branding, digital marketing and creative solutions for your business.",
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
