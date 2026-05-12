import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { CustomCursor } from "@/components/CustomCursor";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contenaissance - The Future of AI Storytelling",
  description: "Build, deploy, and scale AI applications with unprecedented speed. Enterprise-grade infrastructure for the next generation of intelligent systems.",
  keywords: ["AI", "Machine Learning", "Storytelling", "Enterprise", "Contenaissance", "GenAI"],
  authors: [{ name: "Contenaissance" }],
  icons: {
    icon: "/assets/fav-icon.png",
    apple: "/assets/fav-icon.png",
  },
  openGraph: {
    title: "Contenaissance - The Future of AI Storytelling",
    description: "Build, deploy, and scale AI applications with unprecedented speed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "overflow-x-hidden", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-white overflow-x-hidden" suppressHydrationWarning>
        <SmoothScroll>
          <NoiseOverlay />
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
