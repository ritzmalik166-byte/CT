export type EngagementMode = "picture-puzzle" | "neural-wheel";

export const ENGAGEMENT_MODES: EngagementMode[] = ["picture-puzzle", "neural-wheel"];

export const ENGAGEMENT_MODE_CONFIG: Record<
  EngagementMode,
  {
    subtitle: string;
    widgetLabel: string;
    ariaLabel: string;
  }
> = {
  "picture-puzzle": {
    subtitle: "AI picture puzzle",
    widgetLabel: "Solve the AI Puzzle",
    ariaLabel: "Open AI picture puzzle",
  },
  "neural-wheel": {
    subtitle: "Neural wheel spin",
    widgetLabel: "Spin the Neural Wheel",
    ariaLabel: "Open neural wheel challenge",
  },
};

const ROTATION_MS = 60_000;

export function getEngagementMode(now = Date.now()): EngagementMode {
  const slot = Math.floor(now / ROTATION_MS);
  return ENGAGEMENT_MODES[slot % ENGAGEMENT_MODES.length];
}

export function msUntilNextEngagementSwitch(now = Date.now()): number {
  return ROTATION_MS - (now % ROTATION_MS);
}
