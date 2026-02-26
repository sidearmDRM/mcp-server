#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ApiClient } from "./api.js";
import { register as listAlgorithms } from "./tools/list-algorithms.js";
import { register as runAlgorithm } from "./tools/run-algorithm.js";
import { register as protectMedia } from "./tools/protect-media.js";
import { register as checkJob } from "./tools/check-job.js";
import { register as searchMedia } from "./tools/search-media.js";
import { register as listSearches } from "./tools/list-searches.js";
import { register as detectAi } from "./tools/detect-ai.js";
import { register as detectFingerprint } from "./tools/detect-fingerprint.js";
import { register as detectMembership } from "./tools/detect-membership.js";
import { register as registerMedia } from "./tools/register-media.js";
import { register as listMedia } from "./tools/list-media.js";
import { register as getMedia } from "./tools/get-media.js";
import { register as updateMedia } from "./tools/update-media.js";
import { register as deleteMedia } from "./tools/delete-media.js";
import { register as getRights } from "./tools/get-rights.js";
import { register as getBilling } from "./tools/get-billing.js";
import { register as getProvenance } from "./tools/get-provenance.js";

const apiKey = process.env.SDRM_API_KEY;
if (!apiKey) {
  process.stderr.write(
    "Error: SDRM_API_KEY environment variable is required.\n" +
      "Get your API key at https://sdrm.io/api-keys\n",
  );
  process.exit(1);
}

const api = new ApiClient(apiKey, process.env.SDRM_BASE_URL);

const server = new McpServer({
  name: "sdrm",
  version: "0.2.0",
});

// Discovery
listAlgorithms(server, api);

// Protection
runAlgorithm(server, api);
protectMedia(server, api);

// Jobs
checkJob(server, api);

// Search
searchMedia(server, api);
listSearches(server, api);

// Detection
detectAi(server, api);
detectFingerprint(server, api);
detectMembership(server, api);

// Media management
registerMedia(server, api);
listMedia(server, api);
getMedia(server, api);
updateMedia(server, api);
deleteMedia(server, api);

// Rights & billing
getRights(server, api);
getBilling(server, api);

// Provenance
getProvenance(server, api);

const transport = new StdioServerTransport();
await server.connect(transport);
