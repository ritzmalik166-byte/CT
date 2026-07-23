"use client";

import { useMemo } from "react";
import {
  buildToc,
  demoteH1,
  enhanceBlogTables,
  normalizeBlogHtml,
  wrapTablesInHtml,
} from "@/lib/blog-utils";
import "./blog.css";

export function prepareBlogHtml(html: string, withToc = false) {
  const normalized = normalizeBlogHtml(demoteH1(html || ""));
  const withTables = enhanceBlogTables(normalized);

  if (withToc) {
    const { html: withHeadingIds, toc } = buildToc(withTables);
    return {
      html: wrapTablesInHtml(withHeadingIds),
      toc,
    };
  }

  return {
    html: wrapTablesInHtml(withTables),
    toc: [] as { id: string; text: string }[],
  };
}

export function BlogContentBody({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const processed = useMemo(() => prepareBlogHtml(html).html, [html]);

  return (
    <div
      className={`ct-blog-content-body ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
