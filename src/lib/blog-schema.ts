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
  headingLevel: number | null;
  text: string;
  /** Fully bold (or a heading / `<summary>`): how editors mark questions and section titles. */
  emphasized: boolean;
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

const BOLD_WEIGHT = /font-weight\s*:\s*(?:bold|[6-9]00)/i;
const NORMAL_WEIGHT_SPAN = /<span\b[^>]*font-weight\s*:\s*(?:normal|[1-5]00)\b/i;
const BOLD_TAG = /<(strong|b)\b(?![^>]*font-weight\s*:\s*(?:normal|[1-5]00))[^>]*>[\s\S]*?<\/\1\s*>/gi;

/** True when every visible character is bold (CMS / Google Docs paste aware; tolerates unbalanced fragments). */
function isFullyBold(html: string): boolean {
  if (BOLD_WEIGHT.test(html)) return !NORMAL_WEIGHT_SPAN.test(html);
  if (!new RegExp(BOLD_TAG.source, "i").test(html)) return false;
  return htmlToText(html.replace(BOLD_TAG, "").replace(/<\/?(?:strong|b)\b[^>]*>/gi, "")) === "";
}

/** Visible text of a bold run at the very start of the block (`<p><strong>Q?</strong> A</p>`). */
function leadingBoldText(html: string): string {
  const match = /^\s*(?:<(?!\/?(?:strong|b)\b)[^>]+>\s*)*<(strong|b)\b(?![^>]*font-weight\s*:\s*normal)[^>]*>([\s\S]*?)<\/\1\s*>/i.exec(
    html,
  );
  return match ? htmlToText(match[2]) : "";
}

function parseBlocks(html: string): ContentBlock[] {
  const blockPattern = /<(h[1-6]|p|li|dt|dd|summary)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  const blocks: ContentBlock[] = [];

  for (const match of html.matchAll(blockPattern)) {
    const tag = match[1].toLowerCase();
    const inner = match[2];

    if (tag[0] === "h" || tag === "summary") {
      const text = htmlToText(inner);
      if (text) {
        blocks.push({ headingLevel: tag[0] === "h" ? Number(tag[1]) : null, text, emphasized: true });
      }
      continue;
    }

    // "Question?<br>Answer" pasted into a single paragraph becomes separate lines.
    for (const line of inner.split(/<br\s*\/?>/i)) {
      const text = htmlToText(line);
      if (!text) continue;

      if (isFullyBold(line)) {
        blocks.push({ headingLevel: null, text, emphasized: true });
        continue;
      }

      // "<strong>Question?</strong> Answer" in a single line.
      const leading = leadingBoldText(line);
      if (leading.endsWith("?") && text.startsWith(leading)) {
        const rest = text.slice(leading.length).trim();
        blocks.push({ headingLevel: null, text: leading, emphasized: true });
        if (rest) blocks.push({ headingLevel: null, text: rest, emphasized: false });
        continue;
      }

      blocks.push({ headingLevel: null, text, emphasized: false });
    }
  }

  return blocks;
}

const STRICT_FAQ_TITLE = /^(?:faqs?|f\.a\.q\.?s?|frequently asked questions)\b/i;
const LOOSE_FAQ_TITLE = /\b(?:faqs?|frequently asked|questions|answers|q\s*&\s*a|people also ask)\b/i;
const MAX_SECTION_TITLE_LENGTH = 80;

/** "FAQs" anywhere; looser wording ("Questions marketing teams ask…") only when styled as a title. */
function isFaqSectionTitle(block: ContentBlock): boolean {
  const normalized = block.text.replace(/[\s:.\-–—]+$/, "").trim();
  if (normalized.length > MAX_SECTION_TITLE_LENGTH || normalized.endsWith("?")) return false;
  if (STRICT_FAQ_TITLE.test(normalized)) return true;
  return (block.headingLevel !== null || block.emphasized) && LOOSE_FAQ_TITLE.test(normalized);
}

/** Closing calls to action phrased as questions ("Ready to start your project?"). */
const CALL_TO_ACTION = /^(?:ready|want to|looking for|interested in|would you like|let'?s|shall we)\b/i;

const QUESTION_START =
  /^(?:what|how|why|when|where|who|whom|whose|which|is|are|was|were|do|does|did|can|could|should|would|will|has|have|had|may|might|must|shall)\b/i;
/** Plain (unstyled) inline questions need more words so short rhetorical openers stay in answers. */
const MIN_INLINE_QUESTION_WORDS = { emphasized: 4, plain: 6 };

function stripQuestionPrefix(text: string): string {
  return text
    .replace(/^(?:q(?:uestion)?\s*\d*\s*[:.)\-–]|\d+\s*[.):\-–])\s*/i, "")
    .trim();
}

function stripAnswerPrefix(text: string): string {
  return text.replace(/^(?:a|ans|answer)\s*[:.)\-–]\s*/i, "").trim();
}

function isQuestionText(text: string): boolean {
  const question = stripQuestionPrefix(text);
  return question.length > 3 && question.length <= MAX_QUESTION_LENGTH && question.endsWith("?");
}

/**
 * Splits "How long does it take? Usually two weeks." written as one block.
 * The answer must not itself be a question, so "Do you…? Will you…?" checklists stay intact.
 */
function splitInlineQuestion(block: ContentBlock): ContentBlock[] {
  if (block.headingLevel !== null || isQuestionText(block.text)) return [block];

  const match = /^(.+?\?)\s+((?:a|ans|answer)\s*[:.)\-–]\s*)?(.+)$/i.exec(block.text);
  if (!match) return [block];

  const [, question, answerLabel, answer] = match;
  const bare = stripQuestionPrefix(question);
  if (answer.length < MIN_ANSWER_LENGTH || answer.trim().endsWith("?")) return [block];

  // "Q: …? A: …" labels are explicit; otherwise require a real question shape.
  const labelled = Boolean(answerLabel) || bare !== question.trim();
  const minWords = block.emphasized
    ? MIN_INLINE_QUESTION_WORDS.emphasized
    : MIN_INLINE_QUESTION_WORDS.plain;
  if (!labelled && (!QUESTION_START.test(bare) || bare.split(/\s+/).length < minWords)) {
    return [block];
  }

  return [
    { headingLevel: null, text: question, emphasized: true },
    { headingLevel: null, text: answer, emphasized: false },
  ];
}

function extractSectionFaqs(marker: ContentBlock, rawSection: ContentBlock[]): FaqItem[] {
  const section = rawSection.flatMap(splitInlineQuestion);

  const requireEmphasis = section.some(
    (block) => isQuestionText(block.text) && block.emphasized,
  );
  const isQuestion = (block: ContentBlock) =>
    isQuestionText(block.text) && (!requireEmphasis || block.emphasized);

  const endsSection = (block: ContentBlock) => {
    if (block.headingLevel !== null && marker.headingLevel !== null && block.headingLevel <= marker.headingLevel) {
      return true;
    }
    if (isQuestionText(block.text)) return CALL_TO_ACTION.test(stripQuestionPrefix(block.text));
    if (block.headingLevel !== null) return marker.headingLevel === null;
    return requireEmphasis && block.emphasized && block.text.length <= MAX_SECTION_TITLE_LENGTH;
  };

  const pairs: { question: string; answer: string }[] = [];
  let current: { question: string; answerParts: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    pairs.push({
      question: current.question,
      answer: stripAnswerPrefix(current.answerParts.join(" ").replace(/\s+/g, " ")),
    });
    current = null;
  };

  for (const block of section) {
    if (endsSection(block)) break;
    if (isQuestion(block)) {
      flush();
      current = { question: stripQuestionPrefix(block.text), answerParts: [] };
      continue;
    }
    current?.answerParts.push(block.text);
  }
  flush();

  // A run of unanswered questions is a checklist ("Questions to ask an agency"), not an FAQ;
  // text after its last item is commentary on the list, not that item's answer.
  return pairs.filter(
    (pair, index) =>
      pair.answer.length >= MIN_ANSWER_LENGTH &&
      (index === 0 || pairs[index - 1].answer.length >= MIN_ANSWER_LENGTH),
  );
}

/**
 * Extracts Q&A pairs from every FAQ-style section ("FAQs", "Frequently Asked Questions",
 * "Questions teams ask…", "Quick answers…"). Questions are headings or emphasized blocks ending
 * in "?" — including "Question?<br>Answer" and "**Question?** Answer" paragraphs — and answers are
 * the text that follows them.
 */
export function extractFaqs(html: string): FaqItem[] {
  if (!html) return [];

  const blocks = parseBlocks(html);
  const markerIndexes = blocks.flatMap((block, index) => (isFaqSectionTitle(block) ? [index] : []));

  const faqs: FaqItem[] = [];
  const seen = new Set<string>();

  markerIndexes.forEach((markerIndex, i) => {
    const section = blocks.slice(markerIndex + 1, markerIndexes[i + 1] ?? blocks.length);
    for (const faq of extractSectionFaqs(blocks[markerIndex], section)) {
      const key = faq.question.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      faqs.push(faq);
    }
  });

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
