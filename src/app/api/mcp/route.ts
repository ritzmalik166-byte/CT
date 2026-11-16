import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { CT_CONNECTOR_INSTRUCTIONS, registerCtConnectorTools } from "@/lib/ct-connector/tools";
import { isMcpSecretConfigured, verifyMcpBearerToken } from "@/lib/ct-connector/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mcpHandler = createMcpHandler(registerCtConnectorTools, {
  serverInfo: {
    name: "ct-blog-connector",
    version: "1.0.0",
  },
  instructions: CT_CONNECTOR_INSTRUCTIONS,
});

const authenticatedHandler = withMcpAuth(mcpHandler, verifyMcpBearerToken, {
  required: true,
});

async function handler(req: Request) {
  if (!isMcpSecretConfigured()) {
    console.error("[ct-connector] CT_MCP_SECRET is missing or too short (min 32 chars)");
    return Response.json(
      { error: "unavailable", message: "MCP connector is not configured" },
      { status: 503 },
    );
  }

  return authenticatedHandler(req);
}

export { handler as GET, handler as POST, handler as DELETE };
