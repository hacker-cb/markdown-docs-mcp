# PR-02: MCP server skeleton — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять stdio MCP-сервер с регистрацией четырёх tools (`view_toc`, `read_section`, `search`, `analyze_document`). Все tools возвращают `not_implemented` error до своей очереди в следующих PR. Полные input-schemas (Zod) и самодостаточные tool descriptions уже на месте — это контракт для клиентов.

**Architecture:** `@modelcontextprotocol/sdk` (TypeScript) поверх stdio transport. Tool descriptions написаны по spec разделу 3.1 (самодостаточные — работают без skill). Input validation через Zod. Integration tests через `InMemoryTransport` из SDK для in-process тестирования без spawn.

**Tech Stack:** @modelcontextprotocol/sdk 1.29, zod 4.4 (новые deps), TS 6.0, vitest 4.1.

**Реализация PR-02 из spec'а** [docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md](../specs/2026-05-14-markdown-docs-mcp-design.md), раздел 15. Tool API определён в разделах 3.2-3.5, принципы descriptions — в 3.1.

**Ветка:** `pr-02-mcp-skeleton` от `dev`.

---

## Файлы

**Создать:**
- `src/server.ts` — server factory, регистрация tools
- `src/schemas/inputs.ts` — Zod schemas для inputs всех 4 tools (полные, по spec 3.2-3.5)
- `src/schemas/descriptions.ts` — длинные текстовые descriptions для tools/list (по spec 3.1)
- `src/tools/view_toc.ts` — stub handler
- `src/tools/read_section.ts` — stub handler
- `src/tools/search.ts` — stub handler
- `src/tools/analyze_document.ts` — stub handler
- `src/lib/errors.ts` — NotImplementedError helper для stubs
- `tests/integration/mcp-handshake.test.ts` — initialize/handshake
- `tests/integration/tools-list.test.ts` — список tools, описания, schemas
- `tests/integration/tools-call-stub.test.ts` — каждый tool возвращает not_implemented

**Модифицировать:**
- `src/index.ts` — заменить placeholder на stdio entry с server.ts
- `package.json` — добавить runtime deps `@modelcontextprotocol/sdk@1.29.0` и `zod@4.4.3`
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` — tick PR-02 checkbox в разделе 15

---

## Важно про MCP SDK API

`@modelcontextprotocol/sdk` 1.29 — современная версия. **Не полагайся на память** относительно конкретных методов (`server.tool()` vs `server.registerTool()` vs `setRequestHandler()`). Перед началом реализации **обязательно проверь актуальный API через `context7` MCP** (если доступен) или через чтение `node_modules/@modelcontextprotocol/sdk/` после установки.

Минимальный контракт, который должен работать:
- Сервер слушает stdio.
- Отвечает на initialize handshake.
- Отвечает на `tools/list` со списком из 4 tools, каждый с `name`, `description`, `inputSchema` (JSON Schema).
- Отвечает на `tools/call` для каждого имени: возвращает MCP error с кодом и сообщением «not implemented» (так чтобы клиент понял что tool существует, но ещё не реализован).

---

## Задачи

### Task 1: Установить runtime зависимости

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1.1: Установить пакеты**

Run:
```bash
pnpm add @modelcontextprotocol/sdk@1.29.0 zod@4.4.3
```

Expected: `dependencies` секция добавится в `package.json`, lockfile обновится.

- [ ] **Step 1.2: Проверить typecheck**

Run: `pnpm typecheck`
Expected: exit 0.

---

### Task 2: Zod input schemas

**Files:**
- Create: `src/schemas/inputs.ts`

- [ ] **Step 2.1: Написать input schemas для всех 4 tools**

Полные определения по spec 3.2-3.5. Все принимают `file_path: z.string()`.

```typescript
// src/schemas/inputs.ts
import { z } from "zod";

const filePath = z
  .string()
  .min(1)
  .describe("Absolute path to the markdown file on the local filesystem.");

export const viewTocInput = z.object({
  file_path: filePath,
  depth: z
    .number()
    .int()
    .min(1)
    .max(6)
    .nullable()
    .optional()
    .describe("Limit TOC tree depth. null (default) returns the full hierarchy."),
  raw: z
    .boolean()
    .optional()
    .describe(
      "If true, disable reparenting and is_likely_artifact flags — return the parser's literal output. Default false."
    ),
});

export const readSectionInput = z.object({
  file_path: filePath,
  section_id: z
    .string()
    .min(1)
    .describe(
      "Opaque section id obtained from view_toc (format: s<line>). Do not construct from numbering — section ids are addressing tokens, not paths."
    ),
  include_subsections: z
    .boolean()
    .optional()
    .describe(
      "If true, include the entire subtree of the section. If false (default), content stops at the first child heading and children are returned as a mini-TOC."
    ),
  mode: z
    .enum(["raw", "logical"])
    .optional()
    .describe(
      "raw (default): literal parser boundaries — every line belongs to exactly one node. logical: extend the section past adjacent is_likely_artifact nodes; the response lists what was absorbed."
    ),
  include_comments: z
    .boolean()
    .optional()
    .describe(
      "If true, keep HTML comments in the returned content. Default false — comments are stripped from text (line numbers stay absolute)."
    ),
  from_line: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Continuation parameter after a truncated response. Pass the line after the previous truncated_at_line to continue reading."
    ),
});

export const searchInput = z.object({
  file_path: filePath,
  query: z
    .string()
    .min(1)
    .describe(
      "Search string. Treated as literal substring by default, or as a regex if regex=true."
    ),
  regex: z
    .boolean()
    .optional()
    .describe("If true, query is a JavaScript regular expression. Default false."),
  case_sensitive: z
    .boolean()
    .optional()
    .describe(
      "Case sensitivity. Defaults: false for literal substring, true for regex (override explicitly to change either)."
    ),
  scope: z
    .enum(["all", "titles", "content"])
    .optional()
    .describe(
      "Where to search. all (default) covers headings + body. titles restricts to heading text. content excludes headings."
    ),
  max_results: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Maximum hits returned. Default 50. If exceeded, response sets truncated=true."),
  context_lines: z
    .number()
    .int()
    .min(0)
    .max(20)
    .optional()
    .describe("Lines of context on each side of a hit. Default 2."),
  include_comments: z
    .boolean()
    .optional()
    .describe(
      "If true, search inside HTML comments too. Default false — comments are skipped."
    ),
});

export const analyzeDocumentInput = z.object({
  file_path: filePath,
});

export type ViewTocInput = z.infer<typeof viewTocInput>;
export type ReadSectionInput = z.infer<typeof readSectionInput>;
export type SearchInput = z.infer<typeof searchInput>;
export type AnalyzeDocumentInput = z.infer<typeof analyzeDocumentInput>;
```

- [ ] **Step 2.2: Typecheck**

Run: `pnpm typecheck` → exit 0.

---

### Task 3: Tool descriptions

**Files:**
- Create: `src/schemas/descriptions.ts`

- [ ] **Step 3.1: Написать самодостаточные descriptions для tools/list**

Каждое описание объясняет: когда использовать, что возвращается, edge cases, связь с другими tools. Принципы — spec раздел 3.1.

```typescript
// src/schemas/descriptions.ts
// Self-contained tool descriptions. Per spec section 3.1, these must let an
// agent use the server correctly even without the bundled skill (e.g. when
// the MCP is connected directly without the Claude Code plugin, or from
// Cursor/Continue/any other MCP client).

export const VIEW_TOC_DESCRIPTION = `Returns the table of contents of a large markdown file as a tree of headings.

Each node has: opaque id (format: s<line>), level (1-6), title, optional numbering ("4.1.2"), line/line_end range, section size in lines, is_likely_artifact flag, optional pdf_pages, and children. The response also includes file metadata, optional YAML frontmatter, and anomalies_summary.

Use this as the entry point when reading any markdown document larger than ~500 lines. The response is ~1-3 KB JSON regardless of file size, and lets you address sections by opaque id without reading the whole file.

If anomalies_summary.total > 0, the document has structural anomalies (most often PDF-conversion artifacts). Call analyze_document for details before relying on raw section boundaries.

Section ids are opaque (format s<line>); do not construct them from numbering. Use read_section({ section_id }) to read content for a specific id. The default reading mode is "raw" — every line of the document belongs to exactly one node, no content is silently merged or dropped by heuristics.

Pass raw=true to skip reparenting and is_likely_artifact flags entirely (debug/transparency).`;

export const READ_SECTION_DESCRIPTION = `Reads a section of a markdown document by its opaque id from view_toc.

Default mode="raw": returns literal parser boundaries — the text from the heading line to line_end. No heuristic-driven expansion. If include_subsections=false (default), content stops at the first child heading and a mini-TOC of children is returned in the response so you can drill down stepwise.

Mode="logical" is opt-in: extends the section past adjacent is_likely_artifact nodes (most often PDF page headers misparsed as ## headings). The response lists exactly what was absorbed (expansion.artifacts_absorbed) — the agent must inform the user when using this mode, since it changes content attribution.

HTML comments (<!-- ... -->) are stripped from content by default; pass include_comments=true to keep them. Line numbers in the response stay absolute regardless.

Response is hard-capped at ~200 KB. Larger sections return truncated=true with truncated_at_line=N — use from_line=N+1 to continue reading.

Errors: invalid section_id returns a list of close-by ids to help recovery.`;

export const SEARCH_DESCRIPTION = `Searches a markdown document for literal substrings or regex.

Default scope="all": matches in headings and body. Pass scope="titles" or "content" to narrow.

Default regex=false (case-insensitive literal); pass regex=true to treat query as a JavaScript regex (case-sensitive by default; override with case_sensitive).

Each hit includes: line number, surrounding snippet (default 2 lines of context), the matched text, the nearest parent section { id, title, level, numbering }, and where the match was ("title" | "content"). The section.id can be passed to read_section to fetch the full section.

HTML comments are excluded by default; pass include_comments=true to search inside them too (e.g. searching for PDF_PAGE markers).

Results are capped (default max 50). If exceeded, truncated=true is set — narrow the query or raise max_results (max 500).

This is grep-like (substring/regex), not semantic search.`;

export const ANALYZE_DOCUMENT_DESCRIPTION = `Returns a diagnostic report on structural anomalies in a markdown document.

Reports types: self_nesting_header (a heading that duplicates one of its open ancestors — almost always a PDF page header artifact), level_jump (unexpected hierarchy gap remaining after reparenting), orphan_subheader (first heading has level > 1), empty_section.

Each anomaly carries context: preceding/following real heading, the duplicated ancestor for self-nesting cases, and adjacent_pdf_markers (e.g. ["L3932 PDF_PAGE_END 38"]) — independent evidence of PDF-conversion origin. For self-nesting findings, logical_effect describes what would happen if that node were treated as an artifact (which section would absorb its lines, by how much).

This tool only DESCRIBES anomalies. It does NOT modify the document and does NOT suggest specific edits — the agent decides, in dialogue with the user, whether to apply file fixes, use read_section with mode="logical", or leave the document as-is.

Call this whenever view_toc.anomalies_summary.total > 0, and before any extended read_section work on a chapter that contains anomalies.`;
```

- [ ] **Step 3.2: Typecheck**

Run: `pnpm typecheck` → exit 0.

---

### Task 4: not_implemented error helper

**Files:**
- Create: `src/lib/errors.ts`

- [ ] **Step 4.1: Написать helper**

```typescript
// src/lib/errors.ts
// Error helper for tool stubs in PR-02. Real handlers in PR-04 onward replace
// these returns with actual results.

export class NotImplementedError extends Error {
  readonly toolName: string;

  constructor(toolName: string) {
    super(
      `Tool "${toolName}" is registered but not yet implemented in this build. ` +
        `It will be available in a later release.`
    );
    this.name = "NotImplementedError";
    this.toolName = toolName;
  }
}
```

- [ ] **Step 4.2: Typecheck**

Run: `pnpm typecheck` → exit 0.

---

### Task 5: Tool handler stubs

**Files:**
- Create: `src/tools/view_toc.ts`
- Create: `src/tools/read_section.ts`
- Create: `src/tools/search.ts`
- Create: `src/tools/analyze_document.ts`

- [ ] **Step 5.1: Написать 4 stub handlers**

Каждый — функция, которая принимает валидированный input (тип из inputs.ts) и бросает NotImplementedError.

```typescript
// src/tools/view_toc.ts
import { NotImplementedError } from "../lib/errors.js";
import type { ViewTocInput } from "../schemas/inputs.js";

export async function viewToc(_input: ViewTocInput): Promise<never> {
  throw new NotImplementedError("view_toc");
}
```

Аналогично для `read_section.ts`, `search.ts`, `analyze_document.ts` — каждый со своим именем tool'а и типом input'а.

- [ ] **Step 5.2: Typecheck**

Run: `pnpm typecheck` → exit 0.

---

### Task 6: Server factory + tool registration

**Files:**
- Create: `src/server.ts`

- [ ] **Step 6.1: ОБЯЗАТЕЛЬНО проверить актуальный API MCP SDK 1.29**

Перед написанием server.ts, **прочитай актуальный API**:
- Если доступен `context7` MCP — используй его для получения current docs по `@modelcontextprotocol/sdk`.
- Иначе — посмотри установленный SDK: `ls node_modules/@modelcontextprotocol/sdk/dist/esm/server/`, `cat node_modules/@modelcontextprotocol/sdk/README.md`.

Цель: понять что использовать — `McpServer.tool()` (high-level) или `Server.setRequestHandler()` (low-level).

- [ ] **Step 6.2: Написать server factory**

Скелет (адаптируй под актуальный API):

```typescript
// src/server.ts
// MCP server factory. Registers four tools with self-contained descriptions
// and Zod-validated inputs. All handlers currently throw NotImplementedError
// — real implementations land in PR-04 onward.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // adjust import after API check
import {
  viewTocInput,
  readSectionInput,
  searchInput,
  analyzeDocumentInput,
} from "./schemas/inputs.js";
import {
  VIEW_TOC_DESCRIPTION,
  READ_SECTION_DESCRIPTION,
  SEARCH_DESCRIPTION,
  ANALYZE_DOCUMENT_DESCRIPTION,
} from "./schemas/descriptions.js";
import { viewToc } from "./tools/view_toc.js";
import { readSection } from "./tools/read_section.js";
import { search } from "./tools/search.js";
import { analyzeDocument } from "./tools/analyze_document.js";

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "markdown-docs",
      version: "0.1.0",
    },
    {
      capabilities: { tools: {} },
    }
  );

  // Register each tool with description + Zod input schema + handler.
  // The exact registration call depends on SDK 1.29 API (verified above).
  // Example shape (adjust to actual method names):

  server.tool("view_toc", VIEW_TOC_DESCRIPTION, viewTocInput.shape, async (args) => {
    await viewToc(args);
    // unreachable — viewToc throws
    throw new Error("unreachable");
  });

  // ... repeat for read_section, search, analyze_document

  return server;
}
```

Если SDK предоставляет встроенный механизм возвращать MCP error на throw — используй его. Если нужно явно конвертировать `NotImplementedError` в MCP-протоколную ошибку — сделай это в обёртке. Ключевое: ответ клиенту должен быть структурированной ошибкой с понятным message, не падением transport'а.

- [ ] **Step 6.3: Typecheck**

Run: `pnpm typecheck` → exit 0.

---

### Task 7: stdio entry point

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 7.1: Заменить placeholder на stdio entry**

```typescript
// src/index.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server runs until stdin closes.
}

main().catch((err) => {
  console.error("markdown-docs-mcp fatal error:", err);
  process.exit(1);
});
```

- [ ] **Step 7.2: Сборка и smoke-проверка**

Run: `pnpm build`
Expected: build complete без ошибок.

Run: `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.0"}}}' | node dist/index.js`
Expected: на stdout приходит JSON-RPC response с серверной capabilities (включая tools).

(Точный формат initialize handshake может варьироваться; если ручная проверка не выходит — переходим к integration-тестам, они авторитетнее.)

---

### Task 8: Integration tests

**Files:**
- Create: `tests/integration/mcp-handshake.test.ts`
- Create: `tests/integration/tools-list.test.ts`
- Create: `tests/integration/tools-call-stub.test.ts`

- [ ] **Step 8.1: Handshake test**

Использовать `InMemoryTransport.createLinkedPair()` из SDK для in-process пары transport'ов (если SDK предоставляет, иначе spawn child process с stdio).

```typescript
// tests/integration/mcp-handshake.test.ts
import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

describe("MCP handshake", () => {
  it("connects and exposes tools capability", async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    const client = new Client({ name: "test-client", version: "0.0.0" });

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const caps = client.getServerCapabilities();
    expect(caps?.tools).toBeDefined();

    await client.close();
    await server.close();
  });
});
```

Если конкретные API имена client/transport отличаются от SDK 1.29 — адаптируй после проверки API.

- [ ] **Step 8.2: tools/list test**

```typescript
// tests/integration/tools-list.test.ts
import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

describe("tools/list", () => {
  it("returns exactly 4 tools with non-trivial descriptions and inputSchema", async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    const client = new Client({ name: "test-client", version: "0.0.0" });

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const response = await client.listTools();
    const names = response.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "analyze_document",
      "read_section",
      "search",
      "view_toc",
    ]);

    for (const tool of response.tools) {
      expect(tool.description?.length ?? 0).toBeGreaterThan(200);
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
      const properties = (tool.inputSchema as { properties?: Record<string, unknown> })
        .properties;
      expect(properties?.file_path).toBeDefined();
    }

    await client.close();
    await server.close();
  });
});
```

- [ ] **Step 8.3: tools/call stub test**

```typescript
// tests/integration/tools-call-stub.test.ts
import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

describe("tools/call stubs", () => {
  const validArgs = {
    view_toc: { file_path: "/tmp/dummy.md" },
    read_section: { file_path: "/tmp/dummy.md", section_id: "s1" },
    search: { file_path: "/tmp/dummy.md", query: "x" },
    analyze_document: { file_path: "/tmp/dummy.md" },
  };

  for (const [name, args] of Object.entries(validArgs)) {
    it(`${name} returns not_implemented error`, async () => {
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
      const server = createServer();
      const client = new Client({ name: "test-client", version: "0.0.0" });

      await Promise.all([
        server.connect(serverTransport),
        client.connect(clientTransport),
      ]);

      const result = await client.callTool({ name, arguments: args });
      // Acceptance: result.isError === true OR result.content contains a
      // textual indication of "not implemented". Exact shape depends on
      // SDK error mapping — verify after API check.
      const errored =
        result.isError === true ||
        JSON.stringify(result).toLowerCase().includes("not implemented");
      expect(errored).toBe(true);

      await client.close();
      await server.close();
    });
  }
});
```

- [ ] **Step 8.4: Запустить тесты**

Run: `pnpm test`
Expected: все integration tests passing (плюс существующий smoke test).

---

### Task 9: Финализация

**Files:**
- Modify: `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md`

- [ ] **Step 9.1: Tick PR-02 checkbox**

Edit раздел 15: найти `- [ ] **PR-02: MCP server skeleton**` → заменить на `- [x] **PR-02: MCP server skeleton**`.

- [ ] **Step 9.2: Final pipeline check**

Run от `/Users/pavel/projects/markdown-docs-mcp/`:
```
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
node dist/index.js < /dev/null  # должен корректно завершиться при закрытии stdin
```

- [ ] **Step 9.3: Commit + push**

Стейджит файлы (полный список) и коммит на ветке `pr-02-mcp-skeleton`. Push.

---

## Acceptance criteria

После merge PR-02 в `dev`:

1. `pnpm typecheck && pnpm test && pnpm build` зелёные.
2. `node dist/index.js` запускает MCP server на stdio; корректно отвечает на initialize и tools/list.
3. `tools/list` возвращает ровно 4 tools: view_toc, read_section, search, analyze_document — каждое с descriptions длиной > 200 символов и валидным JSON Schema input'а.
4. Любой `tools/call` к одному из 4 имён возвращает структурированную MCP-ошибку «not implemented» (не падение transport'а, не silent success).
5. Чекбокс PR-02 отмечен в spec разделе 15.

## Anti-patterns (что НЕ делать в этом PR)

- Не имплементировать реальную логику tools — все возвращают not_implemented.
- Не добавлять кэш, парсер markdown, индексацию — это PR-03+.
- Не трогать fixtures, README, LICENSE.
- Не публиковать в npm.
- Не создавать `.claude-plugin/`, skill — это PR-07.
