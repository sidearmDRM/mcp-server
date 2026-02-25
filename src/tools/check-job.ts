import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

interface JobResponse {
  id: string;
  status: string;
  progress?: number;
  result?: unknown;
  error?: string;
  created_at?: string;
  completed_at?: string;
}

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "check_job",
    "Check the status of an asynchronous job (from run_algorithm, protect_media, or detect_ai). " +
      "Returns status (queued, processing, completed, failed), progress percentage, " +
      "and result data including download URLs when complete.",
    {
      job_id: z.string().describe("The job ID returned by a previous tool call"),
    },
    async ({ job_id }) => {
      try {
        const result = (await api.get(
          `/api/v1/jobs/${encodeURIComponent(job_id)}`,
        )) as JobResponse;

        const lines: string[] = [
          `Status: ${result.status}`,
        ];

        if (result.progress !== undefined) {
          lines.push(`Progress: ${result.progress}%`);
        }
        if (result.created_at) {
          lines.push(`Created: ${result.created_at}`);
        }
        if (result.completed_at) {
          lines.push(`Completed: ${result.completed_at}`);
        }
        if (result.error) {
          lines.push(`\nError: ${result.error}`);
        }
        if (result.result) {
          lines.push(`\nResult:\n${JSON.stringify(result.result, null, 2)}`);
        }

        if (result.status === "queued" || result.status === "processing") {
          lines.push(`\nJob is still running. Call check_job again in a few seconds.`);
        }

        return {
          content: [{ type: "text" as const, text: lines.join("\n") }],
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
