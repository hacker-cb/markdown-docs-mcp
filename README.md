# markdown-docs-mcp

MCP server for efficient navigation of large markdown documents — datasheets, IEC/ISO standards, reference manuals.

Lets agents read what they need from a 100 000+ line markdown file without dumping the whole thing into context.

> Status: under active development before first release. See [docs/superpowers/specs/](docs/superpowers/specs/) for the design.

## Tools

- `view_toc` — get document structure (TOC with line ranges, sizes, anomaly hints; auto-trims to fit a configurable byte cap).
- `read_section` — fetch a single section by opaque id; raw and logical reading modes; comment stripping; continuation via `from_line`.
- `search` — literal or regex search across titles and content with section context.
- `analyze_document` — diagnostic report on structural anomalies (self-nesting, level jumps, PDF-conversion artifacts, etc.).

## Installation

### Claude Code plugin

```
/plugin marketplace add hacker-cb/markdown-docs-mcp
/plugin install markdown-docs@hacker-cb
```

### Direct MCP config (any MCP-compatible client)

Add to `~/.claude/settings.json`, project `.mcp.json`, Cursor settings, Continue config, etc.:

```json
{
  "mcpServers": {
    "markdown-docs": {
      "command": "npx",
      "args": ["-y", "markdown-docs-mcp@latest"]
    }
  }
}
```

### Configuration

Two optional env vars override response caps (see `src/config.ts`):

| Variable                            | Default  | Ceiling | Purpose                                  |
| ----------------------------------- | -------- | ------- | ---------------------------------------- |
| `MARKDOWN_DOCS_MAX_TOC_BYTES`       | 51 200   | 500 000 | Cap on `view_toc` response payload       |
| `MARKDOWN_DOCS_MAX_SECTION_BYTES`   | 204 800  | 500 000 | Cap on `read_section.content`            |

Invalid values warn to stderr and fall back to default; the server does not refuse to start.

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT — see [LICENSE](LICENSE).
