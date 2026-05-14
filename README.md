# markdown-docs-mcp

MCP server for efficient navigation of large markdown documents — datasheets, IEC/ISO standards, reference manuals.

Lets agents read what they need from a 100 000+ line markdown file without dumping the whole thing into context.

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

## Known limitations

Issues identified during the pre-release code review but deliberately deferred — they have not surfaced on real workloads so far, and fixing them prematurely would add complexity for no current benefit. Revisit when observed in practice:

- **Regex DoS surface in `search`.** A user-supplied regex (`regex: true`) is evaluated against every body line of the indexed document (up to 143k lines / 5 MB on the largest fixture). A pathological pattern with nested quantifiers (`(a+)+$` and similar) can hang the server thread with no way for the MCP client to cancel it. Mitigation when needed: depend on `re2` (linear-time engine) or wrap `.exec` in a `setImmediate`-paced loop with a wall-clock budget.
- **Concurrent `getOrBuild` race in the LRU cache.** Two near-simultaneous tool calls on a freshly-evicted (or fresh) file both miss, both run `buildIndex` end-to-end (90–120 s on the largest fixture), and the second result overwrites the first. Stdio MCP transports are typically single-flight per session so this is mostly theoretical today, but parallel-aware clients (`Promise.all([...])`) can hit it. Fix: store the in-flight `Promise<Index>` in a `Map<string, Promise<Index>>` keyed by the resolved path.
- **`stripComments` is `O(lines × ranges)`.** For each comment range the function builds a per-line `Set` and probes it line-by-line. On a section containing thousands of `<!-- PDF_PAGE_BEGIN n -->` markers this becomes the dominant cost of `read_section`. Today it stays cheap because the section byte cap keeps the inner loop small; if `MARKDOWN_DOCS_MAX_SECTION_BYTES` is raised toward the 500 KB ceiling it will degrade. Fix: sort ranges once at index-build time and use a two-pointer walk, or precompute a boolean line-flag array.

## Not in scope (MVP)

Deliberate omissions — out of scope for the current MCP, not bugs:

- Semantic search (embeddings). `search` is grep-like by design.
- Table parsing into JSON / structured form.
- Image parsing / OCR.
- On-disk index cache (in-memory LRU is enough for the realistic working set).
- A `numbering_filter` parameter on `view_toc` — add it if a real workflow needs it.
- Performance benchmarks as a CI gate (smoke tests only).
- Wrappers for other platforms (Cursor extension, Copilot CLI plugin, Gemini CLI extension, etc.). The MCP server already works with any MCP-compatible client over stdio; a platform-specific wrapper is separate work, done on demand.

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
