"use client";

import Image from "next/image";
import Link from "next/link";

interface AdminLogoProps {
  showWordmark?: boolean;
  size?: number;
  href?: string;
}

export function AdminLogo({
  showWordmark = true,
  size = 40,
  href,
}: AdminLogoProps) {
  const content = (
    <div className="flex items-center gap-3">
      <div
        className="admin-logo-mark relative shrink-0 overflow-hidden rounded-xl"
        style={{ width: size, height: size }}
      >
        <Image
          src="/assets/favicon.png"
          alt="Contenaissance logo"
          fill
          className="object-contain p-1"
          priority
        />
      </div>
      {showWordmark ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[0.22em] text-[var(--admin-gold)] uppercase">
            Contenaissance
          </p>
          <p className="text-xs text-[var(--admin-muted)]">Admin Console</p>
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="admin-logo-link block">
        {content}
      </Link>
    );
  }

  return content;
}
