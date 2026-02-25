import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "register_media",
    "Register and protect media on the Sidearm platform. " +
      "Modes: register (provenance signing only), search_ready (register + vector indexing), " +
      "standard (search_ready + watermarks + AI-training poison), " +
      "maximum (standard + style cloaking + adversarial hardening). Returns the created media object.",
    {
      media_url: z
        .string()
        .url()
        .optional()
        .describe("Public URL of the media to register"),
      media: z
        .string()
        .optional()
        .describe("Base64-encoded media content to register"),
      mode: z
        .enum(["register", "search_ready", "standard", "maximum"])
        .optional()
        .describe("Protection level. Default: standard"),
      expires_at: z
        .string()
        .optional()
        .describe("ISO 8601 datetime when this registration expires"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags for organizing and filtering"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.media_url) body.media_url = params.media_url;
        if (params.media) body.media = params.media;
        if (params.mode) body.mode = params.mode;
        if (params.expires_at) body.expires_at = params.expires_at;
        if (params.tags) body.tags = params.tags;

        const result = await api.post("/api/v1/media", body);
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
