import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { BLOG_AUTHORS } from "@/lib/blog-utils";
import {
  ConnectorError,
  createDraftBlogFromGoogleDoc,
  getBlogAuthors,
  getBlogs,
  uploadBlogBanner,
} from "@/lib/ct-connector/service";

type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function ok(payload: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

function toolError(error: unknown, tool: string): ToolResult {
  const safe =
    error instanceof ConnectorError
      ? { error: error.code, message: error.message }
      : { error: "INTERNAL_ERROR", message: "The request could not be completed" };

  if (!(error instanceof ConnectorError)) {
    console.error(`[ct-connector] ${tool} failed:`, error);
  }

  const payload = { success: false, ...safe };
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
    isError: true,
  };
}

async function run(tool: string, fn: () => Promise<Record<string, unknown>>) {
  try {
    return ok(await fn());
  } catch (error) {
    return toolError(error, tool);
  }
}

// ~600 KB of binary is ~820k base64 chars; leave headroom so oversized files get the friendly size error.
const MAX_BASE64_CHARS = 1_200_000;

export const CT_CONNECTOR_INSTRUCTIONS = [
  "Contenaissance (CT) blog connector.",
  "You can list blogs and authors, upload a cover image, and create DRAFT blogs from a Google Doc.",
  "You cannot publish, schedule, edit or delete blogs; every blog you create is saved as a draft for the CT team to review.",
  "Workflow: list_blogs (search) to avoid duplicates -> (optional) list_authors -> (optional) upload_banner -> create_blog_draft.",
  "The Google Doc must use the CT template labels, one per line: Meta Title:, Slug URL:, Blog Keywords:, Author:, Meta Description:, then Blog Content: followed by the article.",
  "Share the Google Doc as Viewer with the CT importer service account.",
].join(" ");

export function registerCtConnectorTools(server: McpServer) {
  server.registerTool(
    "list_authors",
    {
      title: "List blog authors",
      description:
        "List the author names allowed on CT blogs. Use one of them in the doc's Author: line or as authorName in create_blog_draft.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => run("list_authors", async () => getBlogAuthors())
  );

  server.registerTool(
    "list_blogs",
    {
      title: "List existing blogs",
      description:
        "List existing CT blogs (newest first) with title, slug, public URL, status and author. Use search to check for duplicates before creating a draft.",
      inputSchema: z.object({
        page: z.number().int().min(1).max(10_000).optional().describe("Page number, starting at 1 (default 1)."),
        limit: z.number().int().min(1).max(50).optional().describe("Results per page, max 50 (default 20)."),
        status: z
          .enum(["draft", "scheduled", "published", "inactive"])
          .optional()
          .describe("Only return blogs with this status."),
        search: z.string().trim().max(100).optional().describe("Text to match against blog title or slug."),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => run("list_blogs", () => getBlogs(args))
  );

  server.registerTool(
    "upload_banner",
    {
      title: "Upload blog cover image",
      description:
        "Upload a cover (banner) image for a blog draft. JPG, PNG or WebP only, less than 600 KB. Send the image bytes as base64. Returns coverImageUrl to pass to create_blog_draft. Does not create a blog.",
      inputSchema: z.object({
        filename: z.string().trim().min(1).max(200).describe("File name used for the SEO-friendly image URL, e.g. ai-content-strategy.webp."),
        mimeType: z
          .string()
          .trim()
          .max(100)
          .optional()
          .describe("image/jpeg, image/png or image/webp. Checked against the actual file bytes."),
        dataBase64: z
          .string()
          .min(1)
          .max(MAX_BASE64_CHARS)
          .describe("Image file contents encoded as base64 (a data: URL prefix is allowed)."),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (args) => run("upload_banner", () => uploadBlogBanner(args))
  );

  server.registerTool(
    "create_blog_draft",
    {
      title: "Create blog draft from Google Doc",
      description:
        "Create a new CT blog as a DRAFT from a Google Doc that follows the CT template (Meta Title:, Slug URL:, Blog Keywords:, Author:, Meta Description:, Blog Content:). Title, slug, keywords, meta description and author are read from the doc; the optional fields below override them. The blog is always saved as a draft; it is never published or scheduled. Provide googleDocUrl or googleDocId.",
      inputSchema: z.object({
        googleDocUrl: z.string().trim().max(2048).optional().describe("https://docs.google.com/document/d/<ID>/... link."),
        googleDocId: z.string().trim().max(200).optional().describe("Google Docs document ID."),
        blogTitle: z.string().trim().max(255).optional().describe("Overrides the doc's Meta Title."),
        blogSlug: z
          .string()
          .trim()
          .max(200)
          .optional()
          .describe("Overrides the doc's Slug URL (lowercase letters, numbers, hyphens)."),
        authorName: z
          .enum(BLOG_AUTHORS as [string, ...string[]])
          .optional()
          .describe("Overrides the doc's Author. Must be one of list_authors."),
        coverImageUrl: z
          .string()
          .trim()
          .max(500)
          .optional()
          .describe("coverImageUrl returned by upload_banner (optional for drafts)."),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => run("create_blog_draft", () => createDraftBlogFromGoogleDoc(args))
  );
}
