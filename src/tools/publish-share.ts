import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "publish_share",
    "Make a shared result publicly accessible. Sets is_public to true.",
    {
      share_id: z.string().describe("The share ID to publish"),
    },
    async (params) => {
      try {
        const result = await api.patch(`/api/v1/shares/${params.share_id}`, {
          is_public: true,
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
