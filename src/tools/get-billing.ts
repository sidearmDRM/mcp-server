import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "get_billing",
    "Get billing, usage summary, storage stats, and algorithm breakdown for your account. " +
      "Returns credit balance, protection/storage cost breakdown, per-algorithm usage, " +
      "billing events, and a link to the Stripe customer portal. " +
      "Filter by date range, event type, tags, or API token.",
    {
      account_id: z.string().describe("Your account UUID"),
      start_date: z
        .string()
        .optional()
        .describe("Filter events from this ISO 8601 date (inclusive)"),
      end_date: z
        .string()
        .optional()
        .describe("Filter events until this ISO 8601 date (inclusive)"),
      type: z
        .string()
        .optional()
        .describe("Filter by event type"),
      tags: z
        .string()
        .optional()
        .describe("Comma-separated tags to filter by"),
      token_id: z
        .string()
        .optional()
        .describe("Filter events to a specific API token UUID"),
    },
    async (params) => {
      try {
        const result = await api.get(
          `/api/v1/billing/${encodeURIComponent(params.account_id)}`,
          {
            start_date: params.start_date,
            end_date: params.end_date,
            type: params.type,
            tags: params.tags,
            token_id: params.token_id,
          },
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
