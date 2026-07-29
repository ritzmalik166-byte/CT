import type { SessionUser } from "@/types/admin";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data as T;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  return parseResponse<T>(response);
}

export async function apiSend<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(response);
}

export async function apiUpload<T>(url: string, file: File, fieldName = "file"): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return parseResponse<T>(response);
}

export async function getSessionClient(): Promise<SessionUser | null> {
  try {
    return await apiGet<SessionUser>("/api/auth/me");
  } catch {
    return null;
  }
}

export async function logoutClient() {
  await apiSend("/api/auth/logout", "POST");
}
