"use client";

import { useEffect, useState } from "react";
import {
  getEngagementMode,
  type EngagementMode,
} from "./engagement-rotation";

export function useRotatingEngagement() {
  const [mode, setMode] = useState<EngagementMode>(() => getEngagementMode());

  useEffect(() => {
    const sync = () => setMode(getEngagementMode());

    sync();
    const interval = window.setInterval(sync, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return mode;
}
