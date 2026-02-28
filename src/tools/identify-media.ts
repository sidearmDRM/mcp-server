import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "identify_media",
    "Identify a media asset by its embedded Sidearm fingerprint and extract its C2PA provenance " +
      "chain. Returns the Sidearm media_id if the asset is registered in your account (null otherwise) " +
      "and the full ordered C2PA chain (e.g. Nikon Z7II → Adobe Photoshop → sidearm) embedded in the " +
      "file. Use this to answer 'have I seen this before?' and 'where did this come from?' in one call.",
    {
      media_url: z
        .string()
        .url()
        .describe("Publicly accessible URL of the media to identify"),
    },
    async (params) => {
      try {
        const result = await api.post("/api/v1/media/identify", {
          media_url: params.media_url,
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
