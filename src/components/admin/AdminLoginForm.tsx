"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  FileText,
  Info,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import { AdminLogo } from "./AdminLogo";
import { AdminThemeToggle } from "./AdminThemeToggle";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "One dashboard for everything",
    text: "Blogs, website assets, and admin permissions — all in one place.",
  },
  {
    icon: FileText,
    title: "Publish with confidence",
    text: "Draft, schedule, and preview posts before they go live.",
  },
];

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Login failed");
      }

      const next = searchParams.get("next") || "/admin/dashboard";
      router.push(next);
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth-shell">
      <aside className="admin-auth-brand-panel" aria-label="Contenaissance admin">
        <div className="admin-auth-brand-panel__bg" aria-hidden>
          <img src="/assets/dotted.svg" alt="" />
          <div className="admin-auth-brand-panel__overlay" />
        </div>

        <div className="admin-auth-brand-panel__inner">
          <div>
            <AdminLogo size={48} />
            <span className="admin-auth-brand-panel__version">
              <Sparkles className="size-3" />
              Admin v1
            </span>
            <h1 className="admin-auth-brand-panel__headline">
              Manage Contenaissance with clarity
            </h1>
            <p className="admin-auth-brand-panel__sub">
              A secure workspace for Contenaissance staff to publish content and
              manage the website.
            </p>
          </div>

          <ul className="admin-auth-brand-panel__features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="admin-auth-brand-panel__feature">
                <span className="admin-auth-brand-panel__feature-icon">
                  <Icon className="size-4" />
                </span>
                <span>
                  <strong>{title}</strong>
                  <br />
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <div className="admin-auth-brand-panel__info">
            <span className="admin-auth-brand-panel__info-icon">
              <Info className="size-4" />
            </span>
            <p>
              <strong>New to the admin panel?</strong> Your Super Administrator
              creates accounts from <strong>Manage Users</strong>. If you cannot
              sign in, ask them to verify your role and email.
            </p>
          </div>
        </div>
      </aside>

      <main className="admin-auth-form-panel">
        <div className="admin-auth-form-panel__topbar">
          <AdminThemeToggle compact />
        </div>

        <div className="admin-auth-form-panel__card">
          <p className="admin-auth-form-panel__eyebrow">Staff sign in</p>
          <h2 className="admin-auth-form-panel__title">Welcome back</h2>
          <p className="admin-auth-form-panel__intro">
            Use the credentials provided by your Super Administrator. All fields
            below are required.
          </p>

          <form onSubmit={handleSubmit} className="admin-auth-form">
            <div className="admin-auth-field">
              <label htmlFor="email" className="admin-auth-label">
                Work email
              </label>
              <div className="admin-auth-input">
                <Mail className="admin-auth-input__icon" aria-hidden />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@contenaissance.com"
                  autoComplete="email"
                  required
                />
              </div>
              <p className="admin-auth-field-hint">
                The email address registered for your admin account.
              </p>
            </div>

            <div className="admin-auth-field">
              <label htmlFor="password" className="admin-auth-label">
                Password
              </label>
              <div className="admin-auth-input">
                <Lock className="admin-auth-input__icon" aria-hidden />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="admin-auth-input--with-toggle"
                  required
                />
                <button
                  type="button"
                  className="admin-auth-input__toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error ? <p className="admin-auth-error">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="admin-auth-submit"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Access Admin Panel
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="admin-auth-trust-row">
            <span className="admin-auth-trust-item">
              <Shield className="size-3.5" />
              Secure session
            </span>
            <span className="admin-auth-trust-item">
              <Lock className="size-3.5" />
              Encrypted login
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
