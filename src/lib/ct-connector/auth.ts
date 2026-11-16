import { createHash, timingSafeEqual } from "crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";

const MIN_SECRET_LENGTH = 32;

function getMcpSecret(): string | null {
  const secret = process.env.CT_MCP_SECRET?.trim();
  if (!secret || secret.length < MIN_SECRET_LENGTH || secret.startsWith("<")) {
    return null;
  }
  return secret;
}

export function isMcpSecretConfigured(): boolean {
  return getMcpSecret() !== null;
}

function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function verifyMcpBearerToken(
  req: Request,
  bearerToken?: string,
): AuthInfo | undefined {
  const secret = getMcpSecret();

  const authorization = req.headers.get("Authorization");
  const headerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1] ?? authorization;

  const token = bearerToken ?? headerToken?.trim();

  if (!secret || !token || !secretsMatch(token, secret)) {
    console.error("[ct-connector] MCP authentication failed");
    return undefined;
  }

  return {
    token,
    clientId: "ct-mcp-shared-secret",
    scopes: ["ct:blogs:read", "ct:blogs:draft"],
  };
}
