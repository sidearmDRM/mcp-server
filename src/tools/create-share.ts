import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "create_share",
    "Create a shareable link for a detection, search, or provenance result. " +
      "The share starts private (is_public: false). Use publish_share to make it public.",
    {
      type: z
        .enum(["detection", "search", "provenance"])
        .describe("Type of result to share"),
      result_id: z
        .string()
        .describe("ID of the result (job ID for detection, search ID for search, media ID for provenance)"),
    },
    async (params) => {
      try {
        const result = await api.post("/api/v1/shares", {
          type: params.type,
          result_id: params.result_id,
        });
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
