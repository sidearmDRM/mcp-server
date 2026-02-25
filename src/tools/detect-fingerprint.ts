import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "detect_fingerprint",
    "Detect whether media has been previously registered or seen, using fingerprint matching. " +
      "Compares against your indexed library at varying depth. " +
      "Tiers: exact (hash match), quick (perceptual hash), perceptual (visual similarity), " +
      "compositional (scene structure), full (all tiers). Returns results immediately.",
    {
      media_url: z
        .string()
        .url()
        .optional()
        .describe("Public URL of the media to check"),
      media: z
        .string()
        .optional()
        .describe("Base64-encoded media content to check"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags to scope the detection to"),
      tier: z
        .enum(["exact", "quick", "perceptual", "compositional", "full"])
        .optional()
        .describe("Detection depth — controls thoroughness vs speed. Default: quick"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.media_url) body.media_url = params.media_url;
        if (params.media) body.media = params.media;
        if (params.tags) body.tags = params.tags;
        if (params.tier) body.tier = params.tier;

        const result = await api.post("/api/v1/detect", body);
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
