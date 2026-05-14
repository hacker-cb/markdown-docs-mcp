# markdown-docs-mcp

MCP server for efficient navigation of large markdown documents — datasheets, IEC/ISO standards, reference manuals.

Lets agents read what they need from a 100 000+ line markdown file without dumping the whole thing into context.

See [docs/superpowers/specs/](docs/superpowers/specs/) for the design.

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

## Releasing

Versions live in four places that must stay in lockstep: `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (`plugins[0].version`), and `.mcp.json` (`args[1]`). `scripts/release.mjs` bumps them atomically and creates a `release: vX.Y.Z` commit plus a `vX.Y.Z` tag. From `master`:

```bash
pnpm release --dry-run 0.2.0    # preview diff
pnpm release 0.2.0              # apply + commit + tag
git push --follow-tags origin master
```

> **Flag forwarding note:** pnpm 10 (this repo's pinned version) forwards
> unknown flags like `--dry-run` to the script. If you use a different
> package manager that intercepts the flag, insert `--` to disambiguate
> (`pnpm release -- --dry-run 0.2.0`) or invoke the script directly
> (`node scripts/release.mjs --dry-run 0.2.0`).

The `release.yml` workflow runs on `v*` tags: full test matrix → build → `npm publish --provenance --access public` via npm Trusted Publisher (OIDC, no `NPM_TOKEN` needed) → GitHub Release with auto-generated notes. Trusted Publisher must be configured once on npmjs.com under the maintainer account.

## License

MIT — see [LICENSE](LICENSE).
