"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenisScrollLock } from "@/components/SmoothScrollProvider";
import {
  LEGAL_POLICIES,
  type LegalPolicy,
  type LegalPolicyId,
  type LegalPolicyParagraph,
  type LegalPolicySection,
  type LegalPolicySubsection,
} from "@/content/legal-policies";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const PARAGRAPH_CLASS =
  "text-sm leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-[1.75]";

const LINK_CLASS =
  "font-medium text-[#C9A84C] underline decoration-[#AE8C20]/50 underline-offset-[3px] transition-colors duration-200 hover:text-[#E0C068] hover:decoration-[#AE8C20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE8C20]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900";

type LegalPolicyModalProps = {
  policyId: LegalPolicyId | null;
  onClose: () => void;
};

function PolicyParagraph({
  content,
  className = PARAGRAPH_CLASS,
}: {
  content: LegalPolicyParagraph;
  className?: string;
}) {
  if (typeof content === "string") {
    return <p className={className}>{content}</p>;
  }

  return (
    <p className={className}>
      {content.map((segment, index) =>
        typeof segment === "string" ? (
          <span key={index}>{segment}</span>
        ) : (
          <a
            key={index}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            {segment.label}
          </a>
        )
      )}
    </p>
  );
}

function PolicyBulletList({ items, keyPrefix }: { items: string[]; keyPrefix: string }) {
  return (
    <ul className="space-y-0.5 pl-1 sm:pl-2">
      {items.map((item, index) => (
        <li
          key={`${keyPrefix}-b-${index}`}
          className="flex gap-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-[1.75]"
        >
          <span
            aria-hidden
            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#AE8C20]"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PolicySubsection({
  subsection,
  keyPrefix,
}: {
  subsection: LegalPolicySubsection;
  keyPrefix: string;
}) {
  return (
    <div className="space-y-3 sm:space-y-3.5">
      <h4 className="text-sm font-semibold tracking-tight text-zinc-200 sm:text-base">
        {subsection.subheading}
      </h4>
      {subsection.paragraphs.map((paragraph, index) => (
        <PolicyParagraph
          key={`${keyPrefix}-sub-p-${index}`}
          content={paragraph}
        />
      ))}
      {subsection.bullets ? (
        <PolicyBulletList items={subsection.bullets} keyPrefix={`${keyPrefix}-sub`} />
      ) : null}
      {subsection.paragraphsAfterBullets?.map((paragraph, index) => (
        <PolicyParagraph
          key={`${keyPrefix}-sub-after-p-${index}`}
          content={paragraph}
        />
      ))}
    </div>
  );
}

function PolicySection({ section }: { section: LegalPolicySection }) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
        {section.heading}
      </h3>

      {section.subsections ? (
        <div className="space-y-6 sm:space-y-7">
          {section.subsections.map((subsection) => (
            <PolicySubsection
              key={`${section.heading}-${subsection.subheading}`}
              subsection={subsection}
              keyPrefix={`${section.heading}-${subsection.subheading}`}
            />
          ))}
        </div>
      ) : null}

      {section.paragraphs?.map((paragraph, index) => (
        <PolicyParagraph
          key={`${section.heading}-p-${index}`}
          content={paragraph}
        />
      ))}

      {section.bullets ? (
        <PolicyBulletList items={section.bullets} keyPrefix={section.heading} />
      ) : null}

      {section.paragraphsAfterBullets?.map((paragraph, index) => (
        <PolicyParagraph
          key={`${section.heading}-after-p-${index}`}
          content={paragraph}
        />
      ))}

      {section.contactItems ? (
        <div className="space-y-2.5 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-4 py-4 sm:px-5 sm:py-5">
          {section.contactItems.map((item) => (
            <p
              key={`${section.heading}-${item.label}`}
              className="text-sm leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-[1.75]"
            >
              <span className="font-semibold text-zinc-200">{item.label}</span>{" "}
              {item.href ? (
                <a href={item.href} className={LINK_CLASS}>
                  {item.value}
                </a>
              ) : (
                <span>{item.value}</span>
              )}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PolicyBody({ policy }: { policy: LegalPolicy }) {
  return (
    <div className="space-y-9 sm:space-y-11">
      <div className="space-y-4 sm:space-y-5">
        {policy.intro.map((paragraph, index) => (
          <PolicyParagraph
            key={`intro-${index}`}
            content={paragraph}
            className="max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base sm:leading-[1.75]"
          />
        ))}
      </div>

      {policy.sections.map((section) => (
        <PolicySection key={section.heading} section={section} />
      ))}
    </div>
  );
}

export function LegalPolicyModal({ policyId, onClose }: LegalPolicyModalProps) {
  const open = policyId !== null;
  const policy = policyId ? LEGAL_POLICIES[policyId] : null;
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLenisScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const frame = requestAnimationFrame(() => {
      panel
        ?.querySelector<HTMLElement>("[data-legal-modal-close]")
        ?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0);

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, policyId, onClose]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && policy ? (
        <motion.div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-3 sm:p-6 lg:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <motion.div
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            aria-hidden="true"
            onClick={handleBackdropClick}
          />

          <motion.div
            ref={panelRef}
            className="relative z-10 flex h-[min(90vh,56rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/95 shadow-[0_32px_100px_rgba(0,0,0,0.55),0_0_60px_rgba(174,140,32,0.12)] backdrop-blur-xl sm:rounded-[1.75rem] lg:rounded-[2rem]"
            initial={{
              opacity: 0,
              scale: 0.88,
              y: 40,
              filter: "blur(10px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 24,
              filter: "blur(6px)",
            }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 280,
              mass: 0.8,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#AE8C20]/12 blur-[80px]"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.45, 0.75, 0.45],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 -translate-x-1/4 translate-y-1/4 rounded-full bg-[#AE8C20]/8 blur-[70px]"
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <div className="relative flex items-start justify-between gap-4 border-b border-zinc-800/70 px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#AE8C20] sm:text-[11px]">
                  {policy.eyebrow}
                </p>
                <h2
                  id={titleId}
                  className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.75rem]"
                >
                  {policy.title}
                </h2>
                {/* <p
                  id={descriptionId}
                  className="mt-1 text-xs text-zinc-500 sm:text-sm"
                >
                  Last updated {policy.lastUpdated}
                </p> */}
              </div>

              <button
                type="button"
                data-legal-modal-close
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-400 transition-colors duration-300 hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE8C20]/50 sm:h-11 sm:w-11"
                aria-label={`Close ${policy.title}`}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
              </button>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-label={`${policy.title} content`}
              data-lenis-prevent
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9 focus-visible:outline-none [scrollbar-width:thin] [scrollbar-color:#52525b_transparent]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <PolicyBody policy={policy} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
