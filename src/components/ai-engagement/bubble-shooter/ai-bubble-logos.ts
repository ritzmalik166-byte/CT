export const CT_ASSETS_BASE =
  "https://contenaissance.blob.core.windows.net/ct-assets";

export type AIBubbleLogo = {
  id: string;
  name: string;
  /** Primary URL — local path when present in /public, else CDN. */
  src: string;
  /** Shown inside bubble when the image fails to load. */
  shortLabel: string;
  ring: string;
  glow: string;
  fill: string;
};

/** AI brand logos used as bubble types — colors tuned for dark canvas. */
export const AI_BUBBLE_LOGOS: AIBubbleLogo[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    src: "/assets/chatgpt.png",
    shortLabel: "GPT",
    ring: "#10B981",
    glow: "rgba(16, 185, 129, 0.55)",
    fill: "#064E3B",
  },
  {
    id: "claude",
    name: "Claude",
    src: "/assets/claude.png",
    shortLabel: "CL",
    ring: "#F97316",
    glow: "rgba(249, 115, 22, 0.55)",
    fill: "#7C2D12",
  },
  {
    id: "gemini",
    name: "Gemini",
    src: `${CT_ASSETS_BASE}/gemini.png`,
    shortLabel: "GM",
    ring: "#818CF8",
    glow: "rgba(129, 140, 248, 0.55)",
    fill: "#312E81",
  },
  {
    id: "copilot",
    name: "Copilot",
    src: "/assets/Copilot.png",
    shortLabel: "CP",
    ring: "#38BDF8",
    glow: "rgba(56, 189, 248, 0.55)",
    fill: "#0C4A6E",
  },
  {
    id: "grok",
    name: "Grok",
    src: "/assets/Grok.png",
    shortLabel: "GK",
    ring: "#F472B6",
    glow: "rgba(244, 114, 182, 0.55)",
    fill: "#831843",
  },
  {
    id: "pika",
    name: "Pika",
    src: "/assets/Pika.png",
    shortLabel: "PK",
    ring: "#A855F7",
    glow: "rgba(168, 85, 247, 0.55)",
    fill: "#581C87",
  },
];

export const BUBBLE_TYPE_COUNT = AI_BUBBLE_LOGOS.length;

export function isDrawableImage(img: HTMLImageElement | undefined): img is HTMLImageElement {
  return (
    !!img &&
    img.complete &&
    img.naturalWidth > 0 &&
    img.naturalHeight > 0
  );
}

/** Load bubble logos; only successfully decoded images are returned. */
export function loadAIBubbleImages(): Promise<Map<string, HTMLImageElement>> {
  const map = new Map<string, HTMLImageElement>();

  const loadOne = (src: string): Promise<void> =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";

      const finish = (ok: boolean) => {
        if (ok && img.naturalWidth > 0 && img.naturalHeight > 0) {
          map.set(src, img);
        }
        resolve();
      };

      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      img.src = src;
    });

  return Promise.all(AI_BUBBLE_LOGOS.map((logo) => loadOne(logo.src))).then(() => map);
}
