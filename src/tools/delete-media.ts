import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "delete_media",
    "Permanently delete a registered media asset. Removes storage files, " +
      "vector embeddings, and all associated metadata. This action cannot be undone.",
    {
      media_id: z.string().describe("UUID of the media asset to delete"),
    },
    async ({ media_id }) => {
      try {
        await api.delete(
          `/api/v1/media/${encodeURIComponent(media_id)}`,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: `Media ${media_id} deleted successfully.`,
            },
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
