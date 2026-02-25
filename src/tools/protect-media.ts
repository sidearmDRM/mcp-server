import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "protect_media",
    "Protect media using a curated preset level. Automatically selects the best " +
      "combination of algorithms for the given media type. Simpler than run_algorithm — " +
      "just specify standard or maximum protection. Provide either a public media_url, " +
      "base64 media, or text content. Returns a job_id — use check_job to poll for results.",
    {
      media_url: z
        .string()
        .url()
        .optional()
        .describe("Public URL of the media file to protect"),
      media: z
        .string()
        .optional()
        .describe("Base64-encoded media content (alternative to media_url)"),
      text: z
        .string()
        .optional()
        .describe("Plain text content to protect"),
      mime: z
        .string()
        .optional()
        .describe("MIME type (e.g. image/png, audio/wav, text/plain)"),
      level: z
        .enum(["standard", "maximum"])
        .optional()
        .describe(
          "Protection level: standard (fast, good protection) or maximum (slower, strongest protection). Default: standard",
        ),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags for organizing and filtering"),
      webhook_url: z
        .string()
        .url()
        .optional()
        .describe("URL to receive a POST when the job completes"),
      filename: z
        .string()
        .optional()
        .describe("Original filename for human-readable output naming"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.media_url) body.media_url = params.media_url;
        if (params.media) body.media = params.media;
        if (params.text) body.text = params.text;
        if (params.mime) body.mime = params.mime;
        if (params.level) body.level = params.level;
        if (params.tags) body.tags = params.tags;
        if (params.webhook_url) body.webhook_url = params.webhook_url;
        if (params.filename) body.filename = params.filename;

        const result = await api.post("/api/v1/protect", body);
        const res = result as { job_id: string; status_url: string };

        return {
          content: [
            {
              type: "text" as const,
              text:
                `Protection job created.\n\n` +
                `Job ID: ${res.job_id}\n` +
                `Status URL: ${res.status_url}\n\n` +
                `Use check_job with this job_id to poll for results.`,
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
