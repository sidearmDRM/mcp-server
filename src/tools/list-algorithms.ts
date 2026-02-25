import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "list_algorithms",
    "List available algorithms for media protection, watermarking, and AI content disruption. " +
      "Returns algorithm IDs, names, supported media types, and descriptions. " +
      "Use this to discover valid algorithm IDs before calling run_algorithm. " +
      "Filter by category (open = research algorithms, proprietary = Sidearm bundles) " +
      "or media_type (image, video, audio, text, pdf, gif).",
    {
      category: z
        .enum(["open", "proprietary"])
        .optional()
        .describe("Filter by algorithm category"),
      media_type: z
        .enum(["image", "video", "audio", "text", "pdf", "gif"])
        .optional()
        .describe("Filter by supported media type"),
    },
    async ({ category, media_type }) => {
      try {
        const result = await api.get("/api/v1/algorithms", {
          category,
          media_type,
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
