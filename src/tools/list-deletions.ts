import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "list_deletions",
    "List deletion records for your account. Each record documents a media asset that was permanently deleted.",
    {
      cursor: z.string().optional().describe("Pagination cursor"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Max results (1–100)"),
    },
    async (params) => {
      try {
        const result = await api.get("/api/v1/media/deletions", {
          cursor: params.cursor,
          limit: params.limit?.toString(),
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
