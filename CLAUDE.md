# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm test` — full Vitest run (unit + integration; the TRM stress suite cold-starts indexing in well under 1 s locally post perf-optimization). All integration fixtures are real public datasheets under `tests/fixtures/public/`.
- `pnpm test -- tests/unit/tools/compact.test.ts` — single test file (Vitest accepts a path arg after `--`).
- `pnpm test:watch` — Vitest in watch mode.
- `pnpm typecheck` — `tsc --noEmit`. Fast feedback while developing.
- `pnpm build` — esbuild bundle to `dist/index.js`. `gray-matter` is intentionally `external` (its `require("fs")` does not survive ESM bundling).
- `pnpm dev` — `tsx src/index.ts` for local stdio MCP without a build step.
- `pnpm release [--dry-run] [--force] <version>` — atomic version sync across the four version sources (see "Release flow" below). `--dry-run` previews; `--force` skips the "must be on master" guard for rehearsal.

## Architecture

Four-tool MCP server (stdio, `@modelcontextprotocol/sdk` 1.29) for navigating large markdown documents. The server is the **primary artefact**; the Claude Code plugin under `.claude-plugin/` is a thin wrapper around `npx markdown-docs-mcp@<version>`. The MCP works in any MCP-compatible client (Cursor, Continue, Claude Desktop) — keep server code free of Claude-specific knowledge.

### Layering (request flow)

```
src/index.ts          — stdio entry, loads config, creates server
  └─ src/server.ts    — McpServer factory, registers 4 tools with _meta annotations
       └─ src/tools/<name>.ts          — thin MCP adapter (makes a handler that calls JSON.stringify on the response)
            └─ src/tools/<name>_response.ts — PURE response builder (no MCP plumbing, unit-tested in isolation)
                 └─ src/index/cache.ts → src/index/builder.ts
                      ├─ src/parser/*  — markdown-it tokens, comments, frontmatter, numbering, PDF page markers
                      ├─ src/index/reparenting.ts — stack-based tree from FlatSeed[]
                      └─ src/anomalies/detector.ts — five anomaly types
```

The pure/adapter split is load-bearing — every `build*Response()` is testable without `InMemoryTransport`, and the MCP adapter does nothing but `JSON.stringify` (compact, no indent — see invariant below).

### Index two-phase construction

`buildIndex` is intentionally two-pass:

1. Parser emits `FlatSeed[]` (id, level, title, numbering, line — what's known from the heading alone).
2. `buildTocTree(seeds, line_count)` reparents into `TocNode[]` and assigns `line_end` / `section_lines` based on the next sibling/parent.
3. Builder walks the tree once more to enrich every seed into a full `FlatHeader` (carrying the real `line_end` / `section_lines`). A missing id throws — silent fallback to `{ line_end: line, section_lines: 1 }` would resurrect the bug PR-09 fixed.

`view_toc(raw=true)` emits this enriched flat list, so an agent that pivots to `read_section` sees real ranges.

### Invariants tested on real fixtures

- **Line-coverage invariant** (`tests/integration/invariants.test.ts` + stress on the TRM): every source line belongs to exactly one node. Any reparenting change that breaks this will be caught immediately.
- **Byte-reconstruction invariant** (`tests/integration/invariants_byte_reconstruction.test.ts`): `read_section` content for `[line..line_end]` byte-equals `raw_content.slice(...)` of the same range. `mode: "raw"` is the canonical reading mode — heuristics live only in `mode: "logical"`.
- **Compact-JSON cap discipline**: cap measurement (in `view_toc_response.ts` / `read_section_response.ts`) and emission (in `view_toc.ts` / `read_section.ts`) both use `JSON.stringify(response)` with **no indent**. Pretty-printing the emission while measuring compact would inflate the real payload ~40 % and break the `truncated` contract — this was a regression in PR-06.3.

### Server-side caps and Claude Code annotation

- Defaults in `src/config.ts`: `MARKDOWN_DOCS_MAX_TOC_BYTES = 51 200`, `MARKDOWN_DOCS_MAX_SECTION_BYTES = 204 800`. Ceiling 500 000 (the documented `_meta["anthropic/maxResultSizeChars"]` cap). Invalid env values warn to stderr and fall back — server never refuses to start.
- All four tools register with `_meta: { "anthropic/maxResultSizeChars": 200_000 }`. Claude Code v2.1.91+ honors it to lift its inline-display truncation cap. Other MCP clients ignore the field.
- `view_toc` iteratively reduces `depth` from `requested` (default 6) down to 1 until the compact JSON fits the cap; emits `truncated: true`, `effective_depth: N`, and a `hint` mentioning `start_id`. Nodes whose children were trimmed carry `has_children: true`.

### Self-contained tool descriptions

`src/schemas/descriptions.ts` exports `viewTocDescription(config)` and `readSectionDescription(config)` as **factories** that interpolate the live cap into the description text, plus `SEARCH_DESCRIPTION` / `ANALYZE_DOCUMENT_DESCRIPTION` constants. These descriptions are the **only** documentation that ships with `tools/list` — an agent using the MCP via Cursor or Continue (no plugin, no skill) must be able to operate correctly from descriptions alone. Workflow narrative, error-recovery hints, and anomaly-type catalogue all live here.

### Anomalies

Detector reports five types: `self_nesting_header`, `level_jump`, `orphan_subheader`, `empty_section`, `consecutive_pair_header`. The last two also feed `is_likely_artifact = true` on the corresponding `TocNode`, which `read_section(mode: "logical")` uses to absorb adjacent artefacts past `raw_line_end`. Logical mode is opt-in; raw is the default. `adjacent_pdf_markers` (e.g. `"L3932 PDF_PAGE_END 38"`) is independent evidence of PDF-conversion origin used by the `analyze_document` report.

### Version sync — five sources

`scripts/release.mjs` keeps these in lockstep (via `applyVersionToFiles`, pure-tested in `tests/unit/release_script.test.ts`):

1. `package.json` → `.version`
2. `.claude-plugin/plugin.json` → `.version`
3. `.claude-plugin/marketplace.json` → `.plugins[0].version` (script asserts `plugins.length === 1`)
4. `.mcp.json` → `.mcpServers["markdown-docs"].args[]` (the `markdown-docs-mcp@<version>` entry)
5. `src/server.ts` reads `package.json.version` at runtime via `import.meta.url`. The `tools-list.test.ts` integration test asserts `client.getServerVersion().version === package.json.version`.

`tests/unit/plugin_manifest.test.ts` cross-checks the four files; `.github/workflows/release.yml` re-verifies tag↔files agreement on `v*` push before `npm publish --provenance --access public` via npm Trusted Publisher (OIDC; no `NPM_TOKEN` secret).

## Branching

- `master` is the single long-lived branch. PRs target `master`; release tags (`v*`) live on `master`; `release.yml` triggers off `master` tag pushes. Trunk-based — there is no `dev`, no `main`. Ignore the "Main branch: main" line that some Claude Code sessions auto-emit.
- After a squash or rebase merge, the feature branch is not reachable from `master`; `git branch -d` will refuse — use `-D` after confirming `gh pr view <N> --json state` is `MERGED`.

## Testing notes

- The TRM stress test (`tests/integration/stress_huge_document.test.ts`) pre-warms a shared `IndexCache` in `beforeAll(..., 60_000)` so all four sub-tests reuse one cold start. The 60 s timeout is generous headroom (~30× over local cold-start of <1 s) for slow CI runners and GC jitter.
- The stress test injects a deliberately small cap (`maxViewTocBytes: 5 * 1024`) via `createServer({ cache, config })` because the production 50 KB default fits the full depth-6 tree on this fixture and would lose coverage of the cap-reduction code path.
- Tests under `tests/unit/anomalies/detector.test.ts` use a `mkFlat()` helper that synthesizes minimal `FlatHeader` fixtures. When adding new detector tests, follow the same pattern instead of inlining literals — `FlatHeader` carries `line_end` / `section_lines` that detector tests don't care about, and the helper hides that boilerplate.
