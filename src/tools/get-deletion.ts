import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "get_deletion",
    "Get details of a specific deletion record, including which algorithms were purged and storage status.",
    {
      deletion_id: z.string().describe("The deletion record ID"),
    },
    async (params) => {
      try {
        const result = await api.get(
          `/api/v1/media/deletions/${params.deletion_id}`,
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
