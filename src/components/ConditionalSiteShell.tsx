"use client";

import { usePathname } from "next/navigation";
import { CustomCursor } from "@/components/CustomCursor";
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

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <NoiseOverlay />
      <CustomCursor />
      <SiteBootLoader>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </SiteBootLoader>
    </>
  );
}
