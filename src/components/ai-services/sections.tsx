import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CTA_TILES, INTERLUDE_IMAGE, type AiService, type Insight } from "./content";
import {
  CtaTiles,
  DrawLine,
  ExpandableText,
  MagneticLink,
  ParallaxImage,
  Reveal,
  TextReveal,
  TiltCard,
} from "./motion";

function ServiceRow({ service, index }: { service: AiService; index: number }) {
  const number = String(index + 1).padStart(2, "0");
  const titleId = `${service.id}-title`;

  return (
    <article id={service.id} aria-labelledby={titleId} className="scroll-mt-24">
      <DrawLine />
      <div className="grid items-start gap-8 py-10 sm:py-12 md:gap-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-14 xl:gap-20">
        <div>
          <Reveal>
            <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-(--ais-muted)">
              <span className="tabular-nums">{number}</span>
              <span aria-hidden className="h-px w-5 bg-current" />
              <span>Services</span>
            </p>
          </Reveal>

          <h3
            id={titleId}
            className="ais-serif mt-5 text-[clamp(2.25rem,3.7vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.01em]"
          >
            <TextReveal text={service.title} delay={0.1} />
          </h3>

          <Reveal delay={0.15}>
            <ExpandableText
              paragraphs={service.description}
              className="mt-4 max-w-[30rem] text-[15px] leading-[1.7] text-(--ais-muted)"
            />
          </Reveal>

          <Reveal delay={0.25}>
            <ul aria-label={`${service.title} capabilities`} className="mt-6 flex flex-wrap gap-2.5">
              {service.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-(--ais-chip-line) bg-(--ais-chip) px-3.5 py-[7px] text-[12px] font-medium leading-none text-(--ais-ink) transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-(--ais-ink) hover:bg-(--ais-ink) hover:text-(--ais-bg)"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={48} amount={0.2}>
          <TiltCard
            className="group/tilt aspect-[448/263] w-full"
            surfaceClassName="overflow-hidden rounded-[18px] bg-zinc-900 transition-shadow duration-700 group-hover/tilt:shadow-[0_40px_70px_-40px_rgba(17,17,17,0.55)] sm:rounded-[20px]"
          >
            <ParallaxImage
              src={service.image.src}
              alt={service.image.alt}
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 92vw"
              className="h-full w-full"
              imageClassName="transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tilt:scale-[1.05]"
            />
          </TiltCard>
        </Reveal>
      </div>
    </article>
  );
}

export function ServicesList({ services }: { services: AiService[] }) {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="scroll-mt-10 px-5 pt-10 sm:px-8 md:pt-14 lg:px-14"
    >
      <h2 id="services-heading" className="sr-only">
        What we do
      </h2>
      <div className="mx-auto max-w-[1240px]">
        {services.map((service, index) => (
          <ServiceRow key={service.id} service={service} index={index} />
        ))}
        <DrawLine />
      </div>
    </section>
  );
}

export function Interlude() {
  return (
    <section aria-label="Human and AI collaboration" className="mt-12 md:mt-16">
      <ParallaxImage
        src={INTERLUDE_IMAGE.src}
        alt={INTERLUDE_IMAGE.alt}
        sizes="100vw"
        distance={10}
        className="aspect-[1024/397] min-h-[240px] w-full bg-[#d9c7bd]"
      />
    </section>
  );
}

const UNDERLINE =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_1px]";

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Link
      href={insight.href}
      className="group block rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-(--ais-ink)"
    >
      <div className="relative aspect-[288/180] overflow-hidden rounded-[10px] bg-(--ais-soft)">
        <Image
          src={insight.image}
          alt=""
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
          unoptimized={!insight.optimizable}
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10"
        />
      </div>

      <p className="mt-4 flex items-center gap-2.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-(--ais-muted)">
        <span>{insight.category}</span>
        <span aria-hidden className="size-[3px] rounded-full bg-current" />
        {insight.publishedAt ? (
          <time dateTime={insight.publishedAt} className="normal-case tracking-normal">
            {insight.dateLabel}
          </time>
        ) : (
          <span className="normal-case tracking-normal">{insight.dateLabel}</span>
        )}
      </p>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h3 className="ais-serif text-[clamp(1.15rem,1.45vw,1.3rem)] font-semibold leading-[1.25]">
          <span className={UNDERLINE}>{insight.title}</span>
        </h3>
        <span
          aria-hidden
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-(--ais-soft) transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45 group-hover:bg-(--ais-ink) group-hover:text-(--ais-bg)"
        >
          <ArrowUpRight className="size-3.5" strokeWidth={2.2} />
        </span>
      </div>
    </Link>
  );
}

export function FeaturedInsights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <section aria-labelledby="insights-title" className="px-5 py-14 sm:px-8 md:py-20 lg:px-14">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <h2
            id="insights-title"
            className="ais-serif text-[clamp(2.25rem,4.3vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.01em]"
          >
            <TextReveal text="Our featured Insights" />
          </h2>
          <Reveal delay={0.2} y={12}>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 pb-1 text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--ais-ink)"
            >
              <span className={UNDERLINE}>View all articles</span>
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>

        <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <li key={`${insight.href}-${index}`}>
              <Reveal delay={index * 0.1} y={36} amount={0.2}>
                <InsightCard insight={insight} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ProjectCta() {
  return (
    <section
      aria-labelledby="project-cta-title"
      className="relative isolate overflow-hidden bg-(--ais-dark) px-5 pb-20 pt-16 text-white sm:px-8 md:pb-24 md:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-(--ais-accent)/10 blur-[140px]"
      />

      <div className="mx-auto max-w-[1240px] text-center">
        <Reveal y={12}>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-(--ais-accent)">
            Start a project
          </p>
        </Reveal>

        <h2
          id="project-cta-title"
          className="ais-serif mt-5 text-[clamp(2.4rem,5.2vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.01em]"
        >
          <TextReveal text="Let's talk about your project" />
        </h2>

        <Reveal delay={0.25} y={16} className="mt-7">
          <MagneticLink
            href="/contact"
            className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-[14px] font-semibold text-zinc-950 shadow-[0_12px_30px_-12px_rgba(255,255,255,0.35)] transition-[background-color,box-shadow] duration-300 hover:bg-(--ais-bg) hover:shadow-[0_18px_40px_-12px_rgba(255,255,255,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Get in touch
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-300 group-hover:rotate-45"
              strokeWidth={2.2}
            />
          </MagneticLink>
        </Reveal>

        <CtaTiles tiles={CTA_TILES} />
      </div>
    </section>
  );
}
