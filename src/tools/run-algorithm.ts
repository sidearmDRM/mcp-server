import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "run_algorithm",
    "Run one or more named algorithms on media. Provide algorithm IDs (from list_algorithms) " +
      "and either a public media_url or base64-encoded media content. For text, use the text param. " +
      "Returns a job_id for async processing — use check_job to poll for results. Requires credits.",
    {
      algorithms: z
        .array(z.string())
        .min(1)
        .describe(
          "Algorithm IDs to run (e.g. ['nightshade', 'glaze']). Use list_algorithms to discover IDs.",
        ),
      media_url: z
        .string()
        .url()
        .optional()
        .describe("Public URL of the media file to process"),
      media: z
        .string()
        .optional()
        .describe("Base64-encoded media content (alternative to media_url)"),
      text: z
        .string()
        .optional()
        .describe("Plain text content (for text algorithms like spectra, textmark)"),
      mime: z
        .string()
        .optional()
        .describe("MIME type of the media (e.g. image/png, audio/wav)"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags for organizing and filtering"),
      webhook_url: z
        .string()
        .url()
        .optional()
        .describe("URL to receive a POST when the job completes"),
      c2pa_wrap: z
        .boolean()
        .optional()
        .describe("Wrap output in C2PA provenance signing (default: true)"),
      filename: z
        .string()
        .optional()
        .describe("Original filename for human-readable output naming"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          algorithms: params.algorithms,
        };
        if (params.media_url) body.media_url = params.media_url;
        if (params.media) body.media = params.media;
        if (params.text) body.text = params.text;
        if (params.mime) body.mime = params.mime;
        if (params.tags) body.tags = params.tags;
        if (params.webhook_url) body.webhook_url = params.webhook_url;
        if (params.c2pa_wrap !== undefined) body.c2pa_wrap = params.c2pa_wrap;
        if (params.filename) body.filename = params.filename;

        const result = await api.post("/api/v1/run", body);
        const res = result as { job_id: string; status_url: string };

        return {
          content: [
            {
              type: "text" as const,
              text:
                `Job created successfully.\n\n` +
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
