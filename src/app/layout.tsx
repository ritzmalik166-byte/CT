import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteBootLoader } from "@/components/SiteBootLoader";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
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
      <head>
        <link rel="dns-prefetch" href="https://contenaissance.blob.core.windows.net" />
        <link rel="preconnect" href="https://contenaissance.blob.core.windows.net" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-white overflow-x-hidden" suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9KKTHS4QY2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9KKTHS4QY2');
          `}
        </Script>
        <NoiseOverlay />
        <CustomCursor />
        <SiteBootLoader>
          <SmoothScrollProvider>
          
            {children}
          </SmoothScrollProvider>
        </SiteBootLoader>
      </body>
    </html>
  );
}
