import type { BlogWithAuthor } from "@/types/admin";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.contenaissance.com"
).replace(/\/+$/, "");

const SITE_NAME = "Contenaissance";

const MAX_DESCRIPTION_LENGTH = 160;
const MAX_QUESTION_LENGTH = 300;
const MIN_ANSWER_LENGTH = 10;

export type BlogSchemaSource = Pick<
  BlogWithAuthor,
  | "title"
  | "slug"
  | "content"
  | "excerpt"
  | "blog_meta_description"
  | "blog_keywords"
  | "cover_image"
  | "author_name"
  | "published_at"
  | "updated_at"
>;

type SchemaPerson = { "@type": "Person"; name: string };
type SchemaOrganization = { "@type": "Organization"; name: string; url: string };

export interface BlogPostingSchema {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  "@id": string;
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
  url: string;
  headline: string;
  name: string;
  description?: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author: SchemaPerson | SchemaOrganization;
  publisher: SchemaOrganization;
  keywords?: string;
  wordCount?: number;
  inLanguage: string;
  isPartOf: { "@type": "Blog"; name: string; url: string };
}

export interface FaqPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  "@id": string;
  url: string;
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
}

export type FaqItem = {
  question: string;
  answer: string;
};

type ContentBlock = {
  tag: string;
  headingLevel: number | null;
  html: string;
  text: string;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (key[0] === "#") {
      const codePoint =
        key[1] === "x" || key[1] === "X"
          ? parseInt(key.slice(2), 16)
          : parseInt(key.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }
    return NAMED_ENTITIES[key.toLowerCase()] ?? entity;
  });
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function toIsoDate(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toAbsoluteUrl(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    return new URL(value.trim(), `${SITE_URL}/`).href;
  } catch {
    return undefined;
  }
}

function parseBlocks(html: string): ContentBlock[] {
  const blockPattern = /<(h[1-6]|p|li|dt|dd)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  const blocks: ContentBlock[] = [];

  for (const match of html.matchAll(blockPattern)) {
    const tag = match[1].toLowerCase();
    const text = htmlToText(match[2]);
    if (!text) continue;
    blocks.push({
      tag,
      headingLevel: tag[0] === "h" ? Number(tag[1]) : null,
      html: match[2],
      text,
    });
  }

  return blocks;
}

/** True when every visible character in the block is bold (CMS / Google Docs paste aware). */
function isFullyBold(html: string): boolean {
  if (/font-weight\s*:\s*(?:bold|[6-9]00)/i.test(html)) {
    return !/<span\b[^>]*font-weight\s*:\s*(?:normal|[1-5]00)\b/i.test(html);
  }

  const boldTag = /<(strong|b)\b(?![^>]*font-weight\s*:\s*(?:normal|[1-5]00))[^>]*>[\s\S]*?<\/\1\s*>/gi;
  if (!boldTag.test(html)) return false;
  return htmlToText(html.replace(boldTag, "")) === "";
}

function isFaqSectionTitle(text: string): boolean {
  const normalized = text.replace(/[\s:.\-–—]+$/, "").trim();
  if (normalized.length > 80 || normalized.endsWith("?")) return false;
  return /^(?:faqs?|f\.a\.q\.?s?|frequently asked questions)\b/i.test(normalized);
}

function stripQuestionPrefix(text: string): string {
  return text
    .replace(/^(?:q(?:uestion)?\s*\d*\s*[:.)\-–]|\d+\s*[.):\-–])\s*/i, "")
    .trim();
}

function stripAnswerPrefix(text: string): string {
  return text.replace(/^(?:a|ans|answer)\s*[:.)\-–]\s*/i, "").trim();
}

function looksLikeQuestion(block: ContentBlock): boolean {
  const question = stripQuestionPrefix(block.text);
  return (
    question.length > 3 &&
    question.length <= MAX_QUESTION_LENGTH &&
    question.endsWith("?")
  );
}

/**
 * Extracts Q&A pairs from an explicit "FAQ" / "Frequently Asked Questions" section.
 * Questions are blocks ending in "?"; answers are the text blocks that follow them.
 */
export function extractFaqs(html: string): FaqItem[] {
  if (!html) return [];

  const blocks = parseBlocks(html);
  const markerIndex = blocks.findIndex((block) => isFaqSectionTitle(block.text));
  if (markerIndex === -1) return [];

  const marker = blocks[markerIndex];
  const section = blocks.slice(markerIndex + 1);

  const candidates = section.filter(looksLikeQuestion);
  const requireEmphasis = candidates.some(
    (block) => block.headingLevel !== null || isFullyBold(block.html),
  );
  const isQuestion = (block: ContentBlock) =>
    looksLikeQuestion(block) &&
    (!requireEmphasis || block.headingLevel !== null || isFullyBold(block.html));

  const endsSection = (block: ContentBlock) => {
    if (block.headingLevel !== null) {
      return marker.headingLevel === null || block.headingLevel <= marker.headingLevel;
    }
    return requireEmphasis && isFullyBold(block.html) && block.text.length <= 80;
  };

  const faqs: FaqItem[] = [];
  const seen = new Set<string>();
  let current: { question: string; answerParts: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const answer = stripAnswerPrefix(current.answerParts.join(" ").replace(/\s+/g, " "));
    const key = current.question.toLowerCase();
    if (answer.length >= MIN_ANSWER_LENGTH && !seen.has(key)) {
      seen.add(key);
      faqs.push({ question: current.question, answer });
    }
    current = null;
  };

  for (const block of section) {
    if (isQuestion(block)) {
      flush();
      current = { question: stripQuestionPrefix(block.text), answerParts: [] };
      continue;
    }
    if (endsSection(block)) break;
    current?.answerParts.push(block.text);
  }
  flush();

  return faqs;
}

export function createBlogPostingSchema(blog: BlogSchemaSource): BlogPostingSchema {
  const url = `${SITE_URL}/blog/${blog.slug}`;
  const contentText = htmlToText(blog.content || "");

  const description =
    blog.blog_meta_description?.trim() ||
    blog.excerpt?.trim() ||
    (contentText ? truncate(contentText, MAX_DESCRIPTION_LENGTH) : undefined);

  const image = toAbsoluteUrl(blog.cover_image);
  const datePublished = toIsoDate(blog.published_at);
  const dateModified = toIsoDate(blog.updated_at) ?? datePublished;

  const keywords = [
    ...new Set(
      (blog.blog_keywords || "")
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    ),
  ];

  const publisher: SchemaOrganization = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };

  const authorName = blog.author_name?.trim();
  const wordCount = contentText ? contentText.split(" ").length : 0;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: truncate(blog.title, 110),
    name: blog.title,
    ...(description && { description }),
    ...(image && { image: [image] }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    author: authorName ? { "@type": "Person", name: authorName } : publisher,
    publisher,
    ...(keywords.length > 0 && { keywords: keywords.join(", ") }),
    ...(wordCount > 0 && { wordCount }),
    inLanguage: "en",
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} Blog`,
      url: `${SITE_URL}/blog`,
    },
  };
}

export function createFaqPageSchema(blog: Pick<BlogSchemaSource, "slug" | "content">): FaqPageSchema | null {
  const faqs = extractFaqs(blog.content || "");
  if (faqs.length === 0) return null;

  const url = `${SITE_URL}/blog/${blog.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function createBlogSchemas(blog: BlogSchemaSource) {
  return {
    blogPosting: createBlogPostingSchema(blog),
    faqSchema: createFaqPageSchema(blog),
  };
}

/** JSON for `<script type="application/ld+json">`; escapes characters that could close the tag or break parsing. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
