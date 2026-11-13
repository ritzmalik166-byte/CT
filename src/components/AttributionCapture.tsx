"use client";
import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Records UTM / click-ID / referrer on the visitor's landing page so lead forms can send it to the CRM. */
export default function AttributionCapture() {
  useEffect(() => { captureAttribution(); }, []);
  return null;
}
