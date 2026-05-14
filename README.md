# markdown-docs-mcp

MCP server for efficient navigation of large markdown documents — datasheets, IEC/ISO standards, reference manuals.

Lets agents read what they need from a 36 000-line markdown file without dumping the whole thing into context.

> Status: under active development. See [docs/superpowers/specs/](docs/superpowers/specs/) for the design.

## Tools (planned)

- `view_toc` — get document structure (TOC with line ranges, sizes, anomaly hints).
- `read_section` — fetch a single section by opaque id; raw and logical reading modes.
- `search` — literal or regex search across titles and content with section context.
- `analyze_document` — diagnostic report on structural anomalies (PDF-conversion artifacts and similar).

## Installation

Will be available via:

- Claude Code plugin (with bundled skill)
- Direct MCP config (any MCP-compatible client: Claude Code, Cursor, Continue, ...)
- Local development

Detailed instructions ship with the first release.

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT — see [LICENSE](LICENSE).
