"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { SessionUser } from "@/types/admin";

export function DashboardHero({ user }: { user: SessionUser }) {
  const now = new Date();
  const time = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="ct-hero">
      <div className="ct-hero-inner">
        <div>
          <div className="ct-hero-badges">
            <span className="ct-chip">Contenaissance Admin</span>
            <span className="ct-chip ct-chip-accent">
              {user.role === "superadmin" ? "Super Admin" : "Admin"}
            </span>
          </div>
          <h2 className="ct-hero-greeting">Welcome back, {user.name.split(" ")[0]}</h2>
          <p className="ct-hero-sub">
            Manage blogs, website assets, and admin permissions from your executive dashboard.
          </p>
        </div>

        <div className="ct-hero-meta">
          <div className="ct-hero-clock">
            <span className="ct-hero-clock-icon">
              <Clock3 className="size-4" />
            </span>
            <div>
              <p className="ct-hero-clock-time">{time}</p>
              <p className="ct-hero-clock-date">{date}</p>
            </div>
          </div>
          <Link href="/admin/dashboard/blogs" className="ct-hero-action">
            Manage blogs
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
