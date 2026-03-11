#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ApiClient } from "./api.js";
import { register as listAlgorithms } from "./tools/list-algorithms.js";
import { register as runAlgorithm } from "./tools/run-algorithm.js";
import { register as extractEmbeddings } from "./tools/extract-embeddings.js";
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
import { register as identifyMedia } from "./tools/identify-media.js";
import { register as createShare } from "./tools/create-share.js";
import { register as getShare } from "./tools/get-share.js";
import { register as publishShare } from "./tools/publish-share.js";
import { register as listDeletions } from "./tools/list-deletions.js";
import { register as getDeletion } from "./tools/get-deletion.js";
import { register as getAccount } from "./tools/get-account.js";
import { register as searchDocs } from "./tools/search-docs.js";
import { register as navigateUi } from "./tools/navigate-ui.js";

const api = new ApiClient(process.env.SDRM_API_KEY, process.env.SDRM_BASE_URL);

if (!api.hasApiKey()) {
  process.stderr.write(
    "Warning: SDRM_API_KEY is not set. Documentation and discovery tools are available, " +
      "but API operations require an API key.\n" +
      "Get your API key at https://sdrm.io/api-keys\n",
  );
}

const server = new McpServer({
  name: "sdrm",
  version: "0.9.2",
});

// Discovery
listAlgorithms(server, api);

// Protection & extraction
runAlgorithm(server, api);
extractEmbeddings(server, api);
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

// Account, rights & billing
getAccount(server, api);
getRights(server, api);
getBilling(server, api);

// Provenance & identification
getProvenance(server, api);
identifyMedia(server, api);

// Shares
createShare(server, api);
getShare(server, api);
publishShare(server, api);

// Deletion records
listDeletions(server, api);
getDeletion(server, api);

// Docs
searchDocs(server, api);
navigateUi(server, api);

const transport = new StdioServerTransport();
await server.connect(transport);
