import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "update_media",
    "Update a registered media asset. Currently supports updating the original " +
      "media URL (e.g., after re-hosting the original file).",
    {
      media_id: z.string().describe("UUID of the media asset to update"),
      original_media_url: z
        .string()
        .url()
        .describe("New URL for the original (unprotected) media file"),
    },
    async ({ media_id, original_media_url }) => {
      try {
        const result = await api.patch(
          `/api/v1/media/${encodeURIComponent(media_id)}`,
          { original_media_url },
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
