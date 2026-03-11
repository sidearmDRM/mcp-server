import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "get_rights",
    "Get rights and provenance information for a registered media asset. " +
      "Returns { rights: { ai_training_allowed, acquire_license_url, ... }, " +
      "protocols: { c2pa, schema_org, iptc, tdm, rsl } }. " +
      "No authentication required — this is the public discovery endpoint.",
    {
      media_id: z.string().describe("UUID of the media asset"),
    },
    async ({ media_id }) => {
      try {
        const result = await api.get(
          `/api/v1/rights/${encodeURIComponent(media_id)}`,
        );
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true as const,
        };
      }
    },
  );
}
