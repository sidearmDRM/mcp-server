import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "search_media",
    "Search for similar or matching media across the indexed library. " +
      "Provide a media_url or base64 media to find matches. " +
      "Tiers: exact (hash match), quick (perceptual hash), perceptual (visual similarity), " +
      "compositional (scene structure), full (all tiers). Returns results immediately.",
    {
      media_url: z
        .string()
        .url()
        .optional()
        .describe("Public URL of the media to search for"),
      media: z
        .string()
        .optional()
        .describe("Base64-encoded media content to search for"),
      type: z
        .enum(["exact", "quick", "perceptual", "compositional", "full"])
        .optional()
        .describe("Search tier — controls depth vs speed tradeoff. Default: perceptual"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Restrict search to media with these tags"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum results to return (1-100, default: 20)"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.media_url) body.media_url = params.media_url;
        if (params.media) body.media = params.media;
        if (params.type) body.type = params.type;
        if (params.tags) body.scope = { tags: params.tags };

        const queryParams: Record<string, string | undefined> = {};
        if (params.limit) queryParams.limit = String(params.limit);

        const path =
          "/api/v1/search" +
          (Object.keys(queryParams).length
            ? "?" +
              new URLSearchParams(
                Object.fromEntries(
                  Object.entries(queryParams).filter(
                    (e): e is [string, string] => e[1] !== undefined,
                  ),
                ),
              ).toString()
            : "");

        const result = await api.post(path, body);
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
