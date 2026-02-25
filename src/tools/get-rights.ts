import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "get_rights",
    "Get rights and licensing information for a registered media asset. " +
      "Returns C2PA content credentials, Schema.org structured data, IPTC rights metadata, " +
      "and TDM-AI protocol declarations. Useful for verifying provenance and license terms.",
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
