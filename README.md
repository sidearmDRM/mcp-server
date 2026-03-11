# @sidearmdrm/mcp

MCP server for the [Sidearm API](https://sdrm.io) — protect media from AI training, detect AI-generated content, and search for stolen work.

This package exposes the Sidearm REST API as [Model Context Protocol](https://modelcontextprotocol.io) (MCP) tools that AI agents (Cursor, Claude Desktop, Windsurf, etc.) can call directly.

## Quick Start

### 1. Get an API key

Sign up at [sdrm.io](https://sdrm.io) and create an API key at [sdrm.io/api-keys](https://sdrm.io/api-keys).

### 2. Configure your agent

Add to your MCP configuration file:

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "sdrm": {
      "command": "npx",
      "args": ["-y", "@sidearmdrm/mcp"],
      "env": {
        "SDRM_API_KEY": "sk_live_..."
      }
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sdrm": {
      "command": "npx",
      "args": ["-y", "@sidearmdrm/mcp"],
      "env": {
        "SDRM_API_KEY": "sk_live_..."
      }
    }
  }
}
```

**Windsurf** (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "sdrm": {
      "command": "npx",
      "args": ["-y", "@sidearmdrm/mcp"],
      "env": {
        "SDRM_API_KEY": "sk_live_..."
      }
    }
  }
}
```

That's it. Your agent can now call Sidearm tools.

## Tools (27)

### Discovery

| Tool | Description |
|------|-------------|
| `list_algorithms` | Browse available protection algorithms. Filter by category or media type. |

### Protection & Extraction

| Tool | Description |
|------|-------------|
| `run_algorithm` | Run specific algorithms on media by ID. Returns a job for async processing. |
| `protect_media` | Protect media with a preset level (standard/maximum). Auto-selects algorithms. |
| `extract_embeddings` | Extract raw embedding vectors from media for downstream similarity search or ML pipelines. |

### Jobs

| Tool | Description |
|------|-------------|
| `check_job` | Poll async job status. Returns progress and results when complete. |

### Detection

| Tool | Description |
|------|-------------|
| `detect_ai` | Detect whether media was AI-generated. Supports image, video, audio, text. |
| `detect_fingerprint` | Check if media has been previously registered using fingerprint matching. |
| `detect_membership` | Test whether your content was used to train a suspect AI model. |

### Search

| Tool | Description |
|------|-------------|
| `search_media` | Search for similar media across your indexed library. |
| `list_searches` | List previous searches on your account. |

### Media Management

| Tool | Description |
|------|-------------|
| `register_media` | Register and index media with optional protection mode (register, search_ready, standard, maximum). |
| `list_media` | List media assets in your library (paginated, filterable). |
| `get_media` | Get details of a specific media asset including protection status and algorithms applied. |
| `update_media` | Update media metadata (e.g., original URL). |
| `delete_media` | Permanently delete a media asset and all associated data. |

### Account, Rights & Billing

| Tool | Description |
|------|-------------|
| `get_account` | Get your account details — ID, name, email, credit balance, and plan info. |
| `get_rights` | Get C2PA, IPTC, and rights information for a media asset. |
| `get_billing` | View credit balance, usage breakdown, per-algorithm costs, and billing portal link. |

### Provenance & Identification

| Tool | Description |
|------|-------------|
| `get_provenance` | Get the full provenance chain for an asset — algorithms, C2PA manifest, membership results. |
| `identify_media` | Identify media by its embedded Sidearm fingerprint and extract its C2PA provenance chain. |

### Shares

| Tool | Description |
|------|-------------|
| `create_share` | Create a shareable link for a detection, search, or provenance result (starts private). |
| `get_share` | Get a shared result by its share ID. |
| `publish_share` | Make a shared result publicly accessible. |

### Deletion Records

| Tool | Description |
|------|-------------|
| `list_deletions` | List deletion records documenting permanently deleted assets. |
| `get_deletion` | Get details of a specific deletion record including purged algorithms and storage status. |

### Documentation

| Tool | Description |
|------|-------------|
| `search_docs` | Search the Sidearm API documentation. Returns relevant sections from the full developer reference. |
| `navigate_ui` | Look up how to perform actions in the Sidearm dashboard. Returns step-by-step instructions. |

## Example Agent Conversations

> "Protect this image from AI training"
>
> Agent calls `protect_media` with the image URL, then `check_job` to get the protected file.

> "What algorithms are available for audio?"
>
> Agent calls `list_algorithms` with `media_type: "audio"`.

> "Run Nightshade and Glaze on my artwork"
>
> Agent calls `run_algorithm` with `algorithms: ["nightshade", "glaze"]`.

> "Is this photo AI-generated?"
>
> Agent calls `detect_ai` with the image, then `check_job` for results.

> "Was my artwork used to train Stable Diffusion?"
>
> Agent calls `detect_membership` with your media IDs and the model name.

> "How do I upload files in the dashboard?"
>
> Agent calls `navigate_ui` with `query: "upload files"` for step-by-step instructions.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SDRM_API_KEY` | Yes | Your Sidearm API key (`sk_live_...` or `sk_test_...`) |
| `SDRM_BASE_URL` | No | Override the API base URL (default: `https://api.sdrm.io`) |

## Development

```bash
git clone https://github.com/sidearmDRM/mcp-server.git
cd mcp-server
npm install
npm run build
```

Test locally with the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
SDRM_API_KEY=sk_test_... npx @modelcontextprotocol/inspector node dist/index.js
```

## License

MIT
