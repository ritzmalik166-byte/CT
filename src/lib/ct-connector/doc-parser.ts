/**
 * Server-side version of the admin panel's Word (.docx) upload parser
 * (src/components/admin/ManageBlogs.tsx → uploadDocx). Same template, same labels:
 *
 *   Meta Title: ...
 *   Slug URL: ...
 *   Blog Keywords: ...
 *   Author: ...
 *   Meta Description: ...
 *   Blog Content:
 *   <article body — everything below this label>
 */

export const TEMPLATE_LABELS = [
  "Meta Title",
  "Slug URL",
  "Blog Keywords",
  "Author",
  "Meta Description",
] as const;

export type TemplateLabel = (typeof TEMPLATE_LABELS)[number];

export type ParsedBlogDoc = {
  fields: Record<TemplateLabel, string>;
  contentHtml: string;
};

const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "link", "wbr"]);

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (key[0] === "#") {
      const code = key[1]?.toLowerCase() === "x" ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    }
    return ENTITIES[key.toLowerCase()] ?? entity;
  });
}

function textContent(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Split mammoth's flat HTML output into its top-level elements (<p>, <h2>, <ul>, <table>…). */
export function splitTopLevelBlocks(html: string): string[] {
  const blocks: string[] = [];
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let depth = 0;
  let start = 0;

  for (const match of html.matchAll(tagPattern)) {
    const [raw, closing, name, selfClosing] = match;
    const index = match.index ?? 0;
    const isVoid = VOID_TAGS.has(name.toLowerCase()) || selfClosing === "/";

    if (isVoid) {
      if (depth === 0) blocks.push(raw);
      continue;
    }

    if (!closing) {
      if (depth === 0) start = index;
      depth++;
      continue;
    }

    depth = Math.max(0, depth - 1);
    if (depth === 0) blocks.push(html.slice(start, index + raw.length));
  }

  return blocks;
}

function labelPattern(label: string) {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*(.*)$`, "i");
}

const LABEL_PATTERNS = TEMPLATE_LABELS.map((label) => [label, labelPattern(label)] as const);
const CONTENT_LABEL = /^Blog Content\s*:\s*/i;

function isAnyLabel(line: string) {
  return CONTENT_LABEL.test(line) || LABEL_PATTERNS.some(([, pattern]) => pattern.test(line));
}

export function parseBlogDocHtml(html: string): ParsedBlogDoc {
  const blocks = splitTopLevelBlocks(html);
  const lines = blocks.map(textContent);

  const fields = Object.fromEntries(TEMPLATE_LABELS.map((label) => [label, ""])) as Record<
    TemplateLabel,
    string
  >;

  let contentHtml = "";
  let insideContent = false;

  for (let i = 0; i < blocks.length; i++) {
    const line = lines[i];

    if (insideContent) {
      contentHtml += blocks[i];
      continue;
    }

    if (CONTENT_LABEL.test(line)) {
      insideContent = true;
      const firstContent = line.replace(CONTENT_LABEL, "").trim();
      if (firstContent) contentHtml += `<p>${escapeHtml(firstContent)}</p>`;
      continue;
    }

    for (const [label, pattern] of LABEL_PATTERNS) {
      const match = line.match(pattern);
      if (!match) continue;

      // Value on the same line, or (like the admin upload) on the next line — unless that line is another label.
      const next = lines[i + 1] ?? "";
      fields[label] = match[1].trim() || (next && !isAnyLabel(next) ? next : "");
      break;
    }
  }

  return { fields, contentHtml: contentHtml.trim() };
}
