import type { Blog, BlogStatus } from "@/types/admin";

export const BLOG_STATUS = {
  INACTIVE: "inactive",
  PUBLISHED: "published",
  DRAFT: "draft",
  SCHEDULED: "scheduled",
} as const;

export const BLOG_STATUS_FILTERS = [
  { id: "all", label: "All Posts" },
  { id: BLOG_STATUS.PUBLISHED, label: "Published" },
  { id: BLOG_STATUS.DRAFT, label: "Drafts" },
  { id: BLOG_STATUS.SCHEDULED, label: "Scheduled" },
  { id: BLOG_STATUS.INACTIVE, label: "Inactive" },
] as const;

export const BLOG_AUTHORS = [
  "Contenaissance Team",
  "Aryan Tomar",
  "Shorye Verma",
  "Akansha Verma",
  "Manav Raj Chopra",
];

export function getBlogStatusLabel(status: BlogStatus): string {
  switch (status) {
    case "published":
      return "Published";
    case "draft":
      return "Draft";
    case "scheduled":
      return "Scheduled";
    case "inactive":
      return "Inactive";
    default:
      return status;
  }
}

export function countBlogs<T extends Blog>(blogs: T[]) {
  return {
    all: blogs.length,
    published: blogs.filter((b) => b.status === "published").length,
    draft: blogs.filter((b) => b.status === "draft").length,
    scheduled: blogs.filter((b) => b.status === "scheduled").length,
    inactive: blogs.filter((b) => b.status === "inactive").length,
  };
}

export function filterBlogs<T extends Blog>(blogs: T[], filter: string): T[] {
  if (filter === "all") return blogs;
  return blogs.filter((blog) => blog.status === filter);
}

export function getBlogRowClassName(status: BlogStatus): string {
  switch (status) {
    case "published":
      return "admin-row-published";
    case "draft":
      return "admin-row-draft";
    case "scheduled":
      return "admin-row-scheduled";
    case "inactive":
      return "admin-row-inactive";
    default:
      return "";
  }
}

export function formatBlogDate(value: Date | string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildScheduledIso(
  date: string,
  hour: string,
  minute: string,
  ampm: string,
): string | null {
  if (!date || hour === "" || minute === "") return "";
  const rawHour = Number(hour);
  const rawMinute = Number(minute);
  if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) return "";

  let hours24 = rawHour % 12;
  if (ampm === "PM") hours24 += 12;
  if (ampm === "AM" && rawHour === 12) hours24 = 0;
  if (ampm === "PM" && rawHour === 12) hours24 = 12;

  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = `${date}T${pad(hours24)}:${pad(rawMinute)}:00`;
  const scheduled = new Date(iso);

  if (Number.isNaN(scheduled.getTime())) return "";
  if (scheduled.getTime() <= Date.now()) return null;
  return scheduled.toISOString();
}

export function parseScheduledFields(value: Date | string | null) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return {
      scheduleDate: "",
      scheduleHour: "9",
      scheduleMinute: "00",
      scheduleAmPm: "AM" as const,
    };
  }

  const hours24 = date.getHours();
  const ampm = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    scheduleDate: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    scheduleHour: String(hours12),
    scheduleMinute: pad(date.getMinutes()),
    scheduleAmPm: ampm as "AM" | "PM",
  };
}

export function demoteH1(html: string) {
  if (!html) return "";
  return html
    .replace(/<h1\b([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}

export function readingTime(html: string) {
  if (!html) return 1;
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function decodeHeadingEntities(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    "#39": "'",
    "#x27": "'",
  };
  return value.replace(/&([a-z]+|#\d+|#x[0-9a-f]+);/gi, (entity, key) =>
    entities[key.toLowerCase()] ?? entity,
  );
}

export function buildToc(html: string) {
  if (!html) return { html: "", toc: [] as { id: string; text: string }[] };

  const toc: { id: string; text: string }[] = [];
  const usedIds = new Set<string>();

  const baseSlug = (text: string) => {
    const raw = text
      .toLowerCase()
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return raw || "section";
  };

  const uniqueSlug = (text: string) => {
    const base = baseSlug(text);
    let id = base;
    let i = 2;
    while (usedIds.has(id)) {
      id = `${base}-${i++}`;
    }
    usedIds.add(id);
    return id;
  };

  const transformed = html.replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs, inner) => {
      const plain = inner
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      const headingText = decodeHeadingEntities(plain);
      if (!headingText) return match;

      const existingId = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
      if (existingId) {
        const id = existingId[1];
        usedIds.add(id);
        toc.push({ id, text: headingText });
        return match;
      }

      const id = uniqueSlug(headingText);
      toc.push({ id, text: headingText });
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );

  return { html: transformed, toc };
}

export function wrapTablesInHtml(html: string) {
  if (!html) return html;
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/\s*table\s*>/gi, (match, offset, full) => {
    const before = full.slice(Math.max(0, offset - 200), offset);
    if (/ct-blog-table-scroll/i.test(before)) return match;
    return `<div class="ct-blog-table-scroll">${match}</div>`;
  });
}

export function excerptFromHtml(html: string, wordLimit = 35) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(" ")}…`;
}

export function formatBlogListDate(value: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function normalizeBlogHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/text-align\s*:\s*center/gi, "text-align:left")
    .replace(/text-align\s*:\s*right/gi, "text-align:left")
    .replace(/rgb\s*\(\s*56\s*,\s*118\s*,\s*29\s*\)/gi, "#9a7b1a")
    .replace(/rgb\s*\(\s*13\s*,\s*88\s*,\s*52\s*\)/gi, "#9a7b1a")
    .replace(/#38761d/gi, "#9a7b1a")
    .replace(/#0[Dd]5834/gi, "#9a7b1a")
    .replace(/font-family\s*:[^;"']*(;|(?="))/gi, "")
    .replace(/(<table\b[^>]*)\sstyle="[^"]*"/gi, "$1")
    .replace(/(<td\b[^>]*)\sstyle="[^"]*"/gi, "$1")
    .replace(/(<th\b[^>]*)\sstyle="[^"]*"/gi, "$1");
}

/** Promote first tbody row to header cells when CMS saves headers as td. */
export function enhanceBlogTables(html: string) {
  if (!html) return html;
  return html.replace(
    /<table\b([^>]*)>([\s\S]*?)<\/\s*table\s*>/gi,
    (match, attrs, inner) => {
      if (/<thead\b/i.test(inner)) {
        return attrs.includes("ct-blog-data-table")
          ? match
          : match.replace("<table", '<table class="ct-blog-data-table"');
      }

      const firstRow = inner.match(/<tr\b[^>]*>[\s\S]*?<\/\s*tr\s*>/i)?.[0];
      if (!firstRow || /<th\b/i.test(firstRow)) return match;

      const promoted = firstRow
        .replace(/<td\b/gi, "<th")
        .replace(/<\/td>/gi, "</th>");
      let bodyInner = inner.replace(firstRow, "");
      bodyInner = bodyInner.replace(/<\/?tbody\b[^>]*>/gi, "").trim();

      const classAttr = /class\s*=/.test(attrs)
        ? attrs.replace(/class\s*=\s*"([^"]*)"/i, 'class="$1 ct-blog-data-table"')
        : `${attrs} class="ct-blog-data-table"`;

      return `<table${classAttr}><thead>${promoted}</thead><tbody>${bodyInner}</tbody></table>`;
    },
  );
}
