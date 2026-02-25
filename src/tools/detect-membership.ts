import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "detect_membership",
    "Run membership inference to determine whether your protected content was used to train " +
      "a suspect AI model. Provide content IDs (from your registered media) and the model to test. " +
      "Methods: pattern (watermark detection), statistical (distribution analysis), " +
      "combined (both). Returns a job_id — use check_job to poll for results.",
    {
      content_ids: z
        .array(z.string())
        .min(1)
        .describe("UUIDs of your registered media to test against the suspect model"),
      suspect_model: z
        .string()
        .describe("Identifier or name of the AI model suspected of training on your content"),
      method: z
        .enum(["pattern", "statistical", "combined"])
        .optional()
        .describe("Inference method. Default: combined"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags for organizing and filtering"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          content_ids: params.content_ids,
          suspect_model: params.suspect_model,
        };
        if (params.method) body.method = params.method;
        if (params.tags) body.tags = params.tags;

        const result = await api.post("/api/v1/detect/membership", body);
        const res = result as { job_id: string };

        return {
          content: [
            {
              type: "text" as const,
              text:
                `Membership inference job created.\n\n` +
                `Job ID: ${res.job_id}\n\n` +
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
