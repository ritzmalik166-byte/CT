import { randomUUID } from "crypto";
import path from "path";
import { uploadToAzureBlob } from "@/lib/azure-blob";

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function validateBlogImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed";
  }

  if (file.size > MAX_SIZE) {
    return "Image must be 5MB or smaller";
  }

  return null;
}

export async function saveBlogImage(file: File): Promise<string> {
  const validationError = validateBlogImage(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = EXT_BY_TYPE[file.type] || path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return uploadToAzureBlob(buffer, filename, file.type);
}
