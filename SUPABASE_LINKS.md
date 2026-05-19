# Supabase Links — Contenaissance Website

All media is served from **Supabase Storage** (public bucket).

| Property | Value |
|----------|--------|
| **Project host** | `lfnxmldvqzqsgjigzibk.supabase.co` |
| **Bucket path** | `/storage/v1/object/public/Contenaisaance/` |
| **Base URL** | `https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/` |

---

## Unique asset URLs

### Videos

| Asset | Full URL |
|-------|----------|
| `01.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/01.mp4 |
| `02.MP4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/02.MP4 |
| `03.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/03.mp4 |
| `05.MP4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/05.MP4 |
| `09.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/09.mp4 |
| `10.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/10.mp4 |
| `12.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/12.mp4 |
| `13.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/13.mp4 |
| `14.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/14.mp4 |
| `15.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/15.mp4 |
| `auto.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/auto.mp4 |
| `home.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/home.mp4 |
| `Mzha Nhi Aaya-02.1.mp4` | https://contenaissance.blob.core.windows.net/ct-assets/Mzha%20Nhi%20Aaya-02.1.mp4 *(Azure Blob — not Supabase)* |
| `website_popup to view.mp4` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/website_popup%20to%20view.mp4 |

### Images

| Asset | Full URL |
|-------|----------|
| `gemini.png` | https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/gemini.png |

---

## Usage by page / component

### Hero & critical preload

| URL | Used in |
|-----|---------|
| `Mzha Nhi Aaya-02.1.mp4` (Azure) | `src/lib/critical-assets.ts` (exported as `HERO_VIDEO_URL`), `src/components/home/HeroWithAnimation.tsx`, `src/components/home/CinematicHero.tsx` (via import) |

### Services page

| URL | Used in |
|-----|---------|
| `home.mp4` | `src/app/services/page.tsx` |
| `Mzha Nhi Aaya-02.1.mp4` (Azure) | `src/app/services/page.tsx` |
| `website_popup to view.mp4` | `src/app/services/page.tsx` |

### Portfolio page

| URL | Used in |
|-----|---------|
| `01.mp4`, `02.MP4`, `03.mp4`, `05.MP4`, `09.mp4` | `src/app/portfolio/page.tsx`|

### Home — AI features grid

| URL | Used in |
|-----|---------|
| `01.mp4`, `02.MP4`, `03.mp4`, `05.MP4`, `09.mp4` | `src/components/home/AIFeaturesGrid.tsx` |

### Home — testimonials

| URL | Used in |
|-----|---------|
| `10.mp4`, `12.mp4`, `13.mp4`, `14.mp4`, `15.mp4`, `auto.mp4`, `09.mp4` | `src/components/home/Testimonials.tsx` |

### Home — marquees (logo)

| URL | Used in |
|-----|---------|
| `gemini.png` | `src/components/home/TrustedByMarquee.tsx`, `src/components/home/AiLogoMarquee.tsx` |

### Next.js config (image remote host)

| Setting | Used in |
|---------|---------|
| Hostname `lfnxmldvqzqsgjigzibk.supabase.co` (remote image pattern) | `next.config.ts` |

---

## Source files (all files referencing Supabase)

1. `web/src/lib/critical-assets.ts`
2. `web/src/app/portfolio/page.tsx`
3. `web/src/app/services/page.tsx`
4. `web/src/components/home/AIFeaturesGrid.tsx`
5. `web/src/components/home/TrustedByMarquee.tsx`
6. `web/src/components/home/Testimonials.tsx`
7. `web/src/components/home/AiLogoMarquee.tsx`
8. `web/src/components/home/HeroWithAnimation.tsx`
9. `web/src/components/home/CinematicHero.tsx` *(uses `HERO_VIDEO_URL` from `critical-assets.ts`; no direct URL string)*
10. `web/next.config.ts`

---

*Generated from codebase scan. No Supabase client SDK or env-based URLs were found — only public storage asset links.*
