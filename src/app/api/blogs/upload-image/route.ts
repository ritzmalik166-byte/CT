import {
  jsonError,
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission } from "@/lib/auth-guard";
import { saveBlogImage } from "@/lib/blog-upload";

function getUploadedFile(formData: FormData): File | null {
  const candidates = ["file", "image", "files[0]", "files"];

  for (const key of candidates) {
    const value = formData.get(key);
    if (value instanceof File && value.size > 0) {
      return value;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    await requirePermission("can_manage_blogs");

    const formData = await request.formData();
    const file = getUploadedFile(formData);

    if (!file) {
      return jsonError("No image file provided");
    }

    const url = await saveBlogImage(file);

    return jsonSuccess({
      url,
      files: [url],
      path: "",
      baseurl: "",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403
        ? jsonForbidden(error.message)
        : jsonError(error.message, error.status);
    }

    if (error instanceof Error) {
      return jsonError(error.message);
    }

    console.error("Blog image upload error:", error);
    return jsonServerError();
  }
}
