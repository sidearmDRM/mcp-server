import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "extract_embeddings",
    "Extract raw embedding vectors from media using named embedding algorithms. " +
      "Returns vectors suitable for downstream similarity search, clustering, or ML pipelines. " +
      "Provide algorithm IDs (from list_algorithms, e.g. dinov2, clip, phash, chromaprint, clap) " +
      "and either a public media_url or base64-encoded media. " +
      "Returns a job_id — use check_job to retrieve the vectors once complete.",
    {
      algorithms: z
        .array(z.string())
        .min(1)
        .describe(
          "Embedding algorithm IDs to run (e.g. ['dinov2', 'clip'] for images, " +
            "['chromaprint', 'clap'] for audio, ['sentence-transformers'] for text). " +
            "Use list_algorithms to discover IDs with extractable=true.",
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
        .describe("Plain text content (for sentence-transformers)"),
      mime: z
        .string()
        .optional()
        .describe("MIME type of the media (e.g. image/png, audio/wav)"),
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

        const result = await api.post("/api/v1/embed", body);
        const res = result as { job_id: string; status_url: string; algorithms: string[] };

        return {
          content: [
            {
              type: "text" as const,
              text:
                `Embedding extraction job created.\n\n` +
                `Job ID: ${res.job_id}\n` +
                `Algorithms: ${(res.algorithms ?? params.algorithms).join(", ")}\n` +
                `Status URL: ${res.status_url}\n\n` +
                `Use check_job with this job_id to retrieve the vectors once complete. ` +
                `The result will contain an embeddings array with { algorithm, vector, dimension, metric } entries.`,
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
