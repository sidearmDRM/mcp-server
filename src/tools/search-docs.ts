import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ApiClient } from "../api.js";

function splitSections(text: string): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = [];
  // Split on top-level --- dividers
  const chunks = text.split(/\n---\n/);
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const headingMatch = trimmed.match(/^#{1,2} (.+)/m);
    const title = headingMatch ? headingMatch[1].trim() : "Overview";
    sections.push({ title, body: trimmed });
  }
  return sections;
}

function score(section: { title: string; body: string }, terms: string[]): number {
  const haystack = (section.title + "\n" + section.body).toLowerCase();
  return terms.reduce((acc, term) => {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return acc + (haystack.match(re)?.length ?? 0);
  }, 0);
}

export function register(server: McpServer, api: ApiClient): void {
  server.tool(
    "search_docs",
    "Search the Sidearm API documentation. " +
      "Returns relevant sections from the full developer reference covering endpoints, " +
      "request/response formats, authentication, SDKs, algorithms, and usage examples. " +
      "Use this to look up how to call an endpoint, understand a concept, or find example code. " +
      "Omit the query to get the overview and index of available topics.",
    {
      query: z
        .string()
        .optional()
        .describe(
          "What to look for — e.g. 'authenticate', 'protect media', 'detect AI', 'Node SDK', 'watermark'",
        ),
    },
    async ({ query }) => {
      try {
        const url = `${api.getBaseUrl()}/llms-full.txt`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching docs`);
        const text = await res.text();

        if (!query || query.trim() === "") {
          // Return the first section (overview + index) plus section headings
          const sections = splitSections(text);
          const index = sections
            .map((s, i) => `${i + 1}. ${s.title}`)
            .join("\n");
          const overview = sections[0]?.body ?? text.slice(0, 1500);
          return {
            content: [
              {
                type: "text" as const,
                text: `${overview}\n\n---\n\n## Available Sections\n${index}`,
              },
            ],
          };
        }

        const terms = query
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 1);

        const sections = splitSections(text);
        const ranked = sections
          .map((s) => ({ ...s, score: score(s, terms) }))
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        if (ranked.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text:
                  `No documentation sections matched "${query}".\n\n` +
                  `Try broader terms, or omit the query to see all available topics.\n\n` +
                  `Full reference: ${api.getBaseUrl()}/llms-full.txt`,
              },
            ],
          };
        }

        const result = ranked
          .map((s) => s.body)
          .join("\n\n---\n\n");

        return {
          content: [{ type: "text" as const, text: result }],
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
