import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "get_provenance",
    "Get the full provenance chain for a media asset. Returns every protection algorithm applied " +
      "(with versions, timings, and metadata), the C2PA manifest, any AI training membership inference " +
      "results, and every search where this media appeared as a match. Use this to audit the complete " +
      "history of what has been done to any media item.",
    {
      media_id: z.string().describe("UUID of the media asset"),
    },
    async ({ media_id }) => {
      try {
        const result = await api.get(
          `/api/v1/media/${encodeURIComponent(media_id)}/provenance`,
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
