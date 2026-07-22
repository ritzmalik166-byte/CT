"use client";

import { usePathname } from "next/navigation";
import { CustomCursor } from "@/components/CustomCursor";
import { GsapRouteSync } from "@/components/GsapRouteSync";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { SiteBootLoader } from "@/components/SiteBootLoader";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

export function ConditionalSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isBlog = pathname?.startsWith("/blog");

  if (isAdmin) {
    return <>{children}</>;
  }

  const publicShell = (
    <>
      <NoiseOverlay />
      <CustomCursor />
      <SiteBootLoader>
        {isBlog ? (
          <div className="site-scroll-stack relative z-[var(--z-page-content)] flex w-full min-h-[100dvh] flex-1 touch-pan-y flex-col">
            <GsapRouteSync>{children}</GsapRouteSync>
          </div>
        ) : (
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        )}
      </SiteBootLoader>
    </>
  );

  return publicShell;
}
