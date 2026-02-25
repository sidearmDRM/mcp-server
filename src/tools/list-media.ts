import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "list_media",
    "List media assets registered to your account. Returns a paginated list " +
      "with media IDs, types, status, tags, and protection details. " +
      "Use cursor-based pagination for large libraries.",
    {
      cursor: z
        .string()
        .optional()
        .describe("Pagination cursor from a previous response"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Results per page (1-100, default: 20)"),
    },
    async (params) => {
      try {
        const result = await api.get("/api/v1/media", {
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
