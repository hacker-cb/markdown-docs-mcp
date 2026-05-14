# PR-04: view_toc + anomalies — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Реализовать первый рабочий tool — `view_toc`. Это включает: detector аномалий (4 типа), парсинг PDF page markers, обогащение TocNode (`is_likely_artifact`, `pdf_pages`), реальный handler `view_toc` (с поддержкой `depth` и `raw`), end-to-end integration test'ы на реальных fixtures, и инвариант line-coverage для no-content-loss.

**Architecture:**
- `src/anomalies/` — детектор как чистая функция над `Index`. PR-04 заполняет `is_likely_artifact` через self_nesting эвристику; остальные типы (level_jump, orphan_subheader, empty_section) тоже детектятся для analyze_document, но в этом PR они не влияют на флаги/чтение.
- `src/parser/pdf_pages.ts` — отдельный парсер PDF markers, потому что они нужны и для TocNode.pdf_pages, и для analyze_document.context.adjacent_pdf_markers (PR-06).
- `src/tools/view_toc.ts` — реальная имплементация поверх `IndexCache`. SDK callback сериализует результат в `content: [{ type: "text", text: JSON.stringify(...) }]`.
- `src/server.ts` принимает `IndexCache` через DI (default-fabric для production, инжектируется в тестах).
- `raw=true` skip'ает reparenting (flat list as roots) и обогащение (флаги выключены).
- Tools read_section / search / analyze_document остаются stub'ами.

**Tech Stack:** уже всё подключено в PR-01..PR-03. Новых runtime deps нет.

**Реализация PR-04 из spec'а** [docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md](../specs/2026-05-14-markdown-docs-mcp-design.md), разделы 3.2 (view_toc API), 5 (anomalies + reparenting + no-content-loss), 6 (HTML-комментарии), 15 (roadmap).

**Ветка:** `pr-04-view-toc-anomalies` от `dev`.

---

## Файлы

**Создать:**
- `src/anomalies/types.ts` — типы `Anomaly`, `AnomalyType`
- `src/anomalies/detector.ts` — `detectAnomalies(index)` → `Anomaly[]`
- `src/parser/pdf_pages.ts` — `parsePdfPageMarkers(content)` → `PdfMarker[]`
- `tests/unit/parser/pdf_pages.test.ts`
- `tests/unit/anomalies/detector.test.ts`
- `tests/integration/view_toc.test.ts` — на public fixtures
- `tests/integration/invariants.test.ts` — line-coverage invariant

**Модифицировать:**
- `src/index/types.ts` — `TocNode.is_likely_artifact: boolean` (было `false` literal), `artifact_reason?: string`, `pdf_pages?: number[]`; `Index` получает `anomalies: Anomaly[]` и `pdf_markers: PdfMarker[]`
- `src/index/builder.ts` — после построения TOC: вызвать parser/pdf_pages + detector, обогатить узлы
- `src/tools/view_toc.ts` — реальная имплементация; принимает cache через closure factory
- `src/server.ts` — `createServer(deps?: { cache?: IndexCache })`; передать cache в handler
- `src/index.ts` — создать default cache, передать в server
- `tests/integration/tools-call-stub.test.ts` — убрать `view_toc` из stub list, оставить read_section/search/analyze_document
- `tests/unit/index/builder.test.ts` — обновить (Index теперь имеет anomalies + pdf_markers поля; добавить тест на pdf_pages в TocNode)
- `tests/unit/index/reparenting.test.ts` — обновить тест «is_likely_artifact=false» (теперь default boolean false, та же семантика, может быть нужен мелкий fix типизации)
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` — tick PR-04 checkbox

**НЕ модифицировать:**
- `src/tools/{read_section,search,analyze_document}.ts` — остаются stub.

---

## Контракты модулей

### `src/parser/pdf_pages.ts`

```typescript
export type PdfMarker = {
  line: number;        // 1-based
  page: number;        // page number from marker
  kind: "begin" | "end";
};

export function parsePdfPageMarkers(content: string): PdfMarker[];
```

Regex: `/<!--\s*PDF_PAGE_(BEGIN|END)\s+(\d+)\s*-->/g`. Возвращаем sorted by line (естественный порядок regex iteration в исходном тексте уже sorted).

### `src/anomalies/types.ts`

```typescript
export type AnomalyType =
  | "self_nesting_header"
  | "level_jump"
  | "orphan_subheader"
  | "empty_section";

export type Anomaly = {
  id: string;                         // "a1", "a2", ... — порядковый
  type: AnomalyType;
  line: number;
  raw_text: string;                   // оригинальный заголовок с #
  node_id: string;                    // TocNode.id который вызвал аномалию
  context: {
    preceding_real_header?: { line: number; title: string; level: number };
    following_real_header?: { line: number; title: string; level: number };
    duplicates_open_ancestor?: { line: number; title: string; level: number };  // self_nesting
    adjacent_pdf_markers?: string[];   // ["L3932 PDF_PAGE_END 38", ...]
  };
  description: string;                // человекочитаемое
};
```

### `src/anomalies/detector.ts`

```typescript
import type { Index } from "../index/types.js";
import type { Anomaly } from "./types.js";

export function detectAnomalies(index: Index): Anomaly[];
```

Алгоритм:
1. Walk TOC tree с stack of ancestors. Для каждого node проверить:
   - **self_nesting_header**: если `node.title` нормализованным whitespace совпадает с одним из `ancestor.title` → anomaly + сохранить `duplicates_open_ancestor` (ближайший такой ancestor).
2. Для всех `flat_headers` проверить level_jump (через reparenting может быть устранено — но в реальности reparenting не делает прыжки > 1 невозможными, поэтому проверка через смежные headers по плоскому списку: `current.level - previous.level > 1`).
3. Если `flat_headers[0].level > 1` → один `orphan_subheader`.
4. Для каждого node: если `line_end === node.line` (только строка заголовка, ничего больше) → `empty_section`.
5. Для каждой аномалии заполнить:
   - `preceding_real_header`: ближайший предыдущий header (не сам).
   - `following_real_header`: ближайший следующий header.
   - `adjacent_pdf_markers`: markers с `|line - anomaly.line| <= 3` → форматируем `"L<line> PDF_PAGE_<KIND> <page>"`.
   - `description`: понятное предложение (например для self_nesting: `"Header on L3935 duplicates open ancestor at L3839 ('4 Functional Description'). Surrounded by PDF page markers, strongly suggesting a PDF-conversion artifact."`).
   - `id`: `"a" + (index + 1)`.

### Обновления `src/index/types.ts`

```typescript
import type { CommentRange } from "../parser/comments.js";
import type { Anomaly } from "../anomalies/types.js";
import type { PdfMarker } from "../parser/pdf_pages.js";

export type TocNode = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
  line_end: number;
  section_lines: number;
  is_likely_artifact: boolean;        // было `false` literal; теперь boolean
  artifact_reason?: string;
  pdf_pages?: number[];
  children: TocNode[];
};

export type FlatHeader = { /* без изменений */ };

export type Index = {
  // ... все прежние поля ...
  anomalies: Anomaly[];
  pdf_markers: PdfMarker[];
};

export type { CommentRange, PdfMarker, Anomaly };
```

### Обновления `src/index/builder.ts`

После построения дерева:
1. `parsePdfPageMarkers(raw_content)` → `pdf_markers`.
2. Для каждого TocNode (recursive walk): извлечь уникальные `page` номера из markers, попадающих в `[node.line .. node.line_end]`. Если набор не пуст → set `node.pdf_pages`.
3. `detectAnomalies({ ...index без anomalies, anomalies: [] })` → temp anomalies array.
4. Для аномалий типа `self_nesting_header`: найти соответствующий TocNode по `node_id` и установить `is_likely_artifact=true` + `artifact_reason` (краткое: `"self_nesting: title duplicates open ancestor at L<line>"`).
5. Сохранить `anomalies` и `pdf_markers` в Index.

### `src/tools/view_toc.ts`

```typescript
import type { IndexCache } from "../index/cache.js";
import type { ViewTocInput } from "../schemas/inputs.js";
import type { Index, TocNode } from "../index/types.js";

export function makeViewTocHandler(cache: IndexCache) {
  return async function viewToc(input: ViewTocInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const result = buildResponse(index, input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  };
}
```

Где `buildResponse`:
- `file`: `{ path, size_bytes, line_count, mtime: new Date(index.mtime_ms).toISOString(), frontmatter? }`
- `toc`: вернуть дерево, опционально обрезанное по `depth`. Если `raw=true` — `flat_headers.map(h => toRawNode(h))` без reparenting (каждый header — root, children пустые), без флагов (is_likely_artifact=false везде).
- `anomalies_summary`: считаем все anomalies в index (по типам). Если `raw=true` — total=0 (флаги отключены). Включаем `hint` если total > 0.

Depth-clamping: рекурсивно обрезать `children` на уровнях глубже `depth` (level === depth → children=[]).

### Обновления `src/server.ts`

```typescript
import { IndexCache } from "./index/cache.js";
import { makeViewTocHandler } from "./tools/view_toc.js";

export type ServerDeps = { cache?: IndexCache };

export function createServer(deps: ServerDeps = {}): McpServer {
  const cache = deps.cache ?? new IndexCache();
  const server = new McpServer({ name: "markdown-docs", version: "0.1.0" });

  const viewTocHandler = makeViewTocHandler(cache);

  server.registerTool(
    "view_toc",
    { description: VIEW_TOC_DESCRIPTION, inputSchema: viewTocInput },
    async (args) => viewTocHandler(args)
  );

  // read_section / search / analyze_document — остаются на старых stub callbacks.
  // ...
  return server;
}
```

### Обновления `src/index.ts`

```typescript
import { createServer } from "./server.js";
import { IndexCache } from "./index/cache.js";

async function main() {
  const cache = new IndexCache();
  const server = createServer({ cache });
  // ... transport setup as before ...
}
```

---

## Задачи

### Task 1: PDF page markers parser

**Files:**
- Create: `src/parser/pdf_pages.ts`
- Create: `tests/unit/parser/pdf_pages.test.ts`

- [ ] **Step 1.1: TDD test cases**

```typescript
// tests/unit/parser/pdf_pages.test.ts
import { describe, it, expect } from "vitest";
import { parsePdfPageMarkers } from "../../../src/parser/pdf_pages.js";

describe("parsePdfPageMarkers", () => {
  it("finds BEGIN and END markers with line numbers", () => {
    const md =
      "line1\n<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\nline5\n";
    expect(parsePdfPageMarkers(md)).toEqual([
      { line: 2, page: 38, kind: "end" },
      { line: 4, page: 39, kind: "begin" },
    ]);
  });

  it("returns empty array when no markers", () => {
    expect(parsePdfPageMarkers("# heading\nbody\n")).toEqual([]);
  });

  it("ignores generic HTML comments", () => {
    expect(parsePdfPageMarkers("<!-- note -->\n")).toEqual([]);
  });

  it("handles whitespace variations inside marker", () => {
    const md = "<!--PDF_PAGE_BEGIN 1-->\n<!--  PDF_PAGE_END    2  -->\n";
    const result = parsePdfPageMarkers(md);
    expect(result).toHaveLength(2);
    expect(result[0]?.page).toBe(1);
    expect(result[1]?.page).toBe(2);
  });
});
```

- [ ] **Step 1.2: Run failing test** → FAIL.

- [ ] **Step 1.3: Implement**

```typescript
// src/parser/pdf_pages.ts
export type PdfMarker = {
  line: number;
  page: number;
  kind: "begin" | "end";
};

const RE = /<!--\s*PDF_PAGE_(BEGIN|END)\s+(\d+)\s*-->/g;

export function parsePdfPageMarkers(content: string): PdfMarker[] {
  const result: PdfMarker[] = [];
  let match: RegExpExecArray | null;
  while ((match = RE.exec(content)) !== null) {
    const offset = match.index;
    // count newlines up to offset to get 1-based line
    let line = 1;
    for (let i = 0; i < offset; i++) {
      if (content.charCodeAt(i) === 10) line++;
    }
    const kind = match[1] === "BEGIN" ? "begin" : "end";
    const page = parseInt(match[2]!, 10);
    result.push({ line, page, kind });
  }
  return result;
}
```

- [ ] **Step 1.4: Run tests** → PASS.

---

### Task 2: anomalies types

**Files:**
- Create: `src/anomalies/types.ts`

- [ ] **Step 2.1: Создать файл типов**

Точно по разделу «Контракты модулей» выше (`AnomalyType`, `Anomaly`).

- [ ] **Step 2.2: Typecheck** → exit 0.

---

### Task 3: Обновить index/types.ts

**Files:**
- Modify: `src/index/types.ts`

- [ ] **Step 3.1: Обновить типы**

Изменения:
- `is_likely_artifact: false` → `is_likely_artifact: boolean`
- Добавить `artifact_reason?: string` и `pdf_pages?: number[]` в TocNode
- Добавить `anomalies: Anomaly[]` и `pdf_markers: PdfMarker[]` в Index
- Импортировать и re-export'ить `Anomaly`, `PdfMarker`

- [ ] **Step 3.2: Обновить reparenting.ts**

`buildTocTree` теперь устанавливает `is_likely_artifact: false` (значение `boolean false`, не literal). Изменение типа не должно сломать поведение.

- [ ] **Step 3.3: Typecheck** → exit 0 (могут появиться ошибки в существующих тестах из-за смены `false` literal на `boolean` — поправить если нужно).

---

### Task 4: anomalies detector

**Files:**
- Create: `src/anomalies/detector.ts`
- Create: `tests/unit/anomalies/detector.test.ts`

- [ ] **Step 4.1: TDD test cases**

```typescript
// tests/unit/anomalies/detector.test.ts
import { describe, it, expect } from "vitest";
import { detectAnomalies } from "../../../src/anomalies/detector.js";
import type { Index } from "../../../src/index/types.js";
import type { TocNode, FlatHeader } from "../../../src/index/types.js";

// Helper: build a minimal Index manually (avoiding the real builder for unit isolation).
function mkIndex(opts: {
  toc: TocNode[];
  flat: FlatHeader[];
  line_count: number;
  raw_content?: string;
  pdf_markers?: Array<{ line: number; page: number; kind: "begin" | "end" }>;
}): Index {
  return {
    file_path: "/tmp/x.md",
    size_bytes: 0,
    mtime_ms: 0,
    line_count: opts.line_count,
    raw_content: opts.raw_content ?? "",
    line_offsets: [0],
    toc: opts.toc,
    flat_headers: opts.flat,
    comment_ranges: [],
    frontmatter: undefined,
    anomalies: [],
    pdf_markers: opts.pdf_markers ?? [],
  };
}

const mkNode = (
  id: string,
  level: TocNode["level"],
  title: string,
  line: number,
  line_end: number,
  children: TocNode[] = []
): TocNode => ({
  id,
  level,
  title,
  numbering: null,
  line,
  line_end,
  section_lines: line_end - line + 1,
  is_likely_artifact: false,
  children,
});

describe("detectAnomalies", () => {
  it("detects self_nesting_header when title duplicates open ancestor", () => {
    // root "Foo" -> child h2 -> grandchild "Foo" again (same title as root)
    const grandchild = mkNode("s5", 3, "Foo", 5, 7);
    const child = mkNode("s3", 2, "Bar", 3, 7, [grandchild]);
    const root = mkNode("s1", 1, "Foo", 1, 7, [child]);
    const flat: FlatHeader[] = [
      { id: "s1", level: 1, title: "Foo", numbering: null, line: 1 },
      { id: "s3", level: 2, title: "Bar", numbering: null, line: 3 },
      { id: "s5", level: 3, title: "Foo", numbering: null, line: 5 },
    ];
    const result = detectAnomalies(mkIndex({ toc: [root], flat, line_count: 10 }));
    const selfNesting = result.filter((a) => a.type === "self_nesting_header");
    expect(selfNesting).toHaveLength(1);
    expect(selfNesting[0]?.node_id).toBe("s5");
    expect(selfNesting[0]?.context.duplicates_open_ancestor).toMatchObject({
      line: 1,
      title: "Foo",
      level: 1,
    });
  });

  it("does not flag titles repeating in different branches", () => {
    const a1 = mkNode("s5", 2, "Examples", 5, 6);
    const a = mkNode("s3", 1, "Annex A", 3, 6, [a1]);
    const b1 = mkNode("s9", 2, "Examples", 9, 10);
    const b = mkNode("s7", 1, "Annex B", 7, 10, [b1]);
    const flat: FlatHeader[] = [
      { id: "s3", level: 1, title: "Annex A", numbering: null, line: 3 },
      { id: "s5", level: 2, title: "Examples", numbering: null, line: 5 },
      { id: "s7", level: 1, title: "Annex B", numbering: null, line: 7 },
      { id: "s9", level: 2, title: "Examples", numbering: null, line: 9 },
    ];
    const result = detectAnomalies(mkIndex({ toc: [a, b], flat, line_count: 10 }));
    expect(result.filter((a) => a.type === "self_nesting_header")).toHaveLength(0);
  });

  it("detects orphan_subheader when first heading level > 1", () => {
    const node = mkNode("s1", 2, "H2", 1, 5);
    const flat: FlatHeader[] = [
      { id: "s1", level: 2, title: "H2", numbering: null, line: 1 },
    ];
    const result = detectAnomalies(mkIndex({ toc: [node], flat, line_count: 5 }));
    expect(result.filter((a) => a.type === "orphan_subheader")).toHaveLength(1);
  });

  it("detects level_jump in flat headers (gap > 1)", () => {
    const flat: FlatHeader[] = [
      { id: "s1", level: 1, title: "A", numbering: null, line: 1 },
      { id: "s3", level: 3, title: "B", numbering: null, line: 3 },
    ];
    const a = mkNode("s1", 1, "A", 1, 4, [mkNode("s3", 3, "B", 3, 4)]);
    const result = detectAnomalies(mkIndex({ toc: [a], flat, line_count: 4 }));
    const jumps = result.filter((x) => x.type === "level_jump");
    expect(jumps).toHaveLength(1);
    expect(jumps[0]?.line).toBe(3);
  });

  it("detects empty_section when line_end equals line", () => {
    const node = mkNode("s1", 1, "Empty", 1, 1);
    const flat: FlatHeader[] = [
      { id: "s1", level: 1, title: "Empty", numbering: null, line: 1 },
    ];
    const result = detectAnomalies(mkIndex({ toc: [node], flat, line_count: 5 }));
    expect(result.filter((a) => a.type === "empty_section")).toHaveLength(1);
  });

  it("attaches adjacent_pdf_markers when markers within +/-3 lines", () => {
    const grandchild = mkNode("s5", 3, "Foo", 5, 7);
    const child = mkNode("s3", 2, "Bar", 3, 7, [grandchild]);
    const root = mkNode("s1", 1, "Foo", 1, 7, [child]);
    const flat: FlatHeader[] = [
      { id: "s1", level: 1, title: "Foo", numbering: null, line: 1 },
      { id: "s3", level: 2, title: "Bar", numbering: null, line: 3 },
      { id: "s5", level: 3, title: "Foo", numbering: null, line: 5 },
    ];
    const result = detectAnomalies(
      mkIndex({
        toc: [root],
        flat,
        line_count: 10,
        pdf_markers: [
          { line: 4, page: 38, kind: "end" },
          { line: 6, page: 39, kind: "begin" },
        ],
      })
    );
    const self = result.find((a) => a.type === "self_nesting_header");
    expect(self?.context.adjacent_pdf_markers).toEqual([
      "L4 PDF_PAGE_END 38",
      "L6 PDF_PAGE_BEGIN 39",
    ]);
  });
});
```

- [ ] **Step 4.2: Run failing tests** → FAIL.

- [ ] **Step 4.3: Implement**

```typescript
// src/anomalies/detector.ts
import type { Index, TocNode } from "../index/types.js";
import type { Anomaly, AnomalyType } from "./types.js";

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function walkWithAncestors(
  nodes: TocNode[],
  ancestors: TocNode[],
  visit: (node: TocNode, ancestors: TocNode[]) => void
): void {
  for (const node of nodes) {
    visit(node, ancestors);
    walkWithAncestors(node.children, [...ancestors, node], visit);
  }
}

function adjacentMarkers(
  anomalyLine: number,
  pdfMarkers: Index["pdf_markers"]
): string[] {
  return pdfMarkers
    .filter((m) => Math.abs(m.line - anomalyLine) <= 3)
    .map(
      (m) =>
        `L${m.line} PDF_PAGE_${m.kind === "begin" ? "BEGIN" : "END"} ${m.page}`
    );
}

export function detectAnomalies(index: Index): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const flat = index.flat_headers;

  const push = (a: Omit<Anomaly, "id">) => {
    anomalies.push({ ...a, id: `a${anomalies.length + 1}` });
  };

  // 1. self_nesting via tree walk
  walkWithAncestors(index.toc, [], (node, ancestors) => {
    const normalizedTitle = normalizeWhitespace(node.title);
    const dup = [...ancestors]
      .reverse()
      .find((a) => normalizeWhitespace(a.title) === normalizedTitle);
    if (dup) {
      const i = flat.findIndex((h) => h.id === node.id);
      const preceding = i > 0 ? flat[i - 1] : undefined;
      const following = i + 1 < flat.length ? flat[i + 1] : undefined;
      push({
        type: "self_nesting_header",
        line: node.line,
        raw_text: `${"#".repeat(node.level)} ${node.title}`,
        node_id: node.id,
        context: {
          duplicates_open_ancestor: {
            line: dup.line,
            title: dup.title,
            level: dup.level,
          },
          ...(preceding && {
            preceding_real_header: {
              line: preceding.line,
              title: preceding.title,
              level: preceding.level,
            },
          }),
          ...(following && {
            following_real_header: {
              line: following.line,
              title: following.title,
              level: following.level,
            },
          }),
          adjacent_pdf_markers: adjacentMarkers(node.line, index.pdf_markers),
        },
        description: `Header on L${node.line} duplicates open ancestor at L${dup.line} ('${dup.title}'). Likely a PDF-conversion artifact (page header captured as a markdown heading).`,
      });
    }
  });

  // 2. level_jump on flat list (gap > 1 between consecutive headers)
  for (let i = 1; i < flat.length; i++) {
    const prev = flat[i - 1]!;
    const cur = flat[i]!;
    if (cur.level - prev.level > 1) {
      push({
        type: "level_jump",
        line: cur.line,
        raw_text: `${"#".repeat(cur.level)} ${cur.title}`,
        node_id: cur.id,
        context: {
          preceding_real_header: {
            line: prev.line,
            title: prev.title,
            level: prev.level,
          },
          adjacent_pdf_markers: adjacentMarkers(cur.line, index.pdf_markers),
        },
        description: `Heading level jumped from h${prev.level} to h${cur.level} between L${prev.line} and L${cur.line}.`,
      });
    }
  }

  // 3. orphan_subheader (first header level > 1)
  if (flat.length > 0 && flat[0]!.level > 1) {
    const first = flat[0]!;
    push({
      type: "orphan_subheader",
      line: first.line,
      raw_text: `${"#".repeat(first.level)} ${first.title}`,
      node_id: first.id,
      context: {
        adjacent_pdf_markers: adjacentMarkers(first.line, index.pdf_markers),
      },
      description: `First heading in the document is h${first.level} (expected h1). Often legitimate (e.g. document title comes from filename), informational only.`,
    });
  }

  // 4. empty_section (line_end === line)
  walkWithAncestors(index.toc, [], (node) => {
    if (node.line_end === node.line) {
      push({
        type: "empty_section",
        line: node.line,
        raw_text: `${"#".repeat(node.level)} ${node.title}`,
        node_id: node.id,
        context: {
          adjacent_pdf_markers: adjacentMarkers(node.line, index.pdf_markers),
        },
        description: `Heading on L${node.line} has no content (next heading immediately follows).`,
      });
    }
  });

  return anomalies;
}

export type { Anomaly, AnomalyType };
```

- [ ] **Step 4.4: Run tests** → PASS.

---

### Task 5: Integrate anomalies + pdf_pages into builder

**Files:**
- Modify: `src/index/builder.ts`
- Modify: `tests/unit/index/builder.test.ts`

- [ ] **Step 5.1: Обновить builder**

После построения TOC:
1. `pdf_markers = parsePdfPageMarkers(raw_content)`.
2. recursive walk дерева: для каждого node — собрать уникальные page из markers с `line ∈ [node.line, node.line_end]`, set `node.pdf_pages` (если не пусто).
3. Создать temp index (с пустым `anomalies`), вызвать `detectAnomalies(tempIndex)`.
4. Для аномалий типа `self_nesting_header`: find node by id, set `is_likely_artifact=true` и `artifact_reason="self_nesting: title duplicates open ancestor at L<line>"`.
5. Return Index с заполненными `anomalies` и `pdf_markers`.

- [ ] **Step 5.2: Расширить builder.test.ts**

Добавить тесты:
- pdf_pages: создать tmp файл с PDF markers и заголовком — verify TocNode.pdf_pages содержит ожидаемые номера.
- self_nesting flag: создать tmp файл с самовложенным заголовком — verify is_likely_artifact=true.
- Index.anomalies array заполнен.

```typescript
// дописать в tests/unit/index/builder.test.ts

it("populates pdf_pages on TocNode from adjacent PDF markers", async () => {
  await withTmpFile(
    "<!-- PDF_PAGE_BEGIN 12 -->\n# Heading\nbody\n<!-- PDF_PAGE_END 12 -->\n# Other\n",
    async (path) => {
      const idx = await buildIndex(path);
      expect(idx.toc[0]?.pdf_pages).toEqual([12]);
    }
  );
});

it("flags self-nesting heading and exposes it in anomalies", async () => {
  await withTmpFile(
    "# Foo\n\n## Bar\n\n### Foo\nbody\n",
    async (path) => {
      const idx = await buildIndex(path);
      const found = (function walk(nodes: typeof idx.toc): boolean {
        return nodes.some(
          (n) =>
            (n.is_likely_artifact && /self_nesting/.test(n.artifact_reason ?? "")) ||
            walk(n.children)
        );
      })(idx.toc);
      expect(found).toBe(true);
      expect(idx.anomalies.some((a) => a.type === "self_nesting_header")).toBe(true);
    }
  );
});

it("Index has anomalies and pdf_markers arrays", async () => {
  await withTmpFile("# H\nbody\n", async (path) => {
    const idx = await buildIndex(path);
    expect(Array.isArray(idx.anomalies)).toBe(true);
    expect(Array.isArray(idx.pdf_markers)).toBe(true);
  });
});
```

- [ ] **Step 5.3: Run tests** → PASS.

---

### Task 6: view_toc tool implementation

**Files:**
- Modify: `src/tools/view_toc.ts`
- Create: `src/tools/view_toc_response.ts` (helper, чтобы не раздувать handler)

- [ ] **Step 6.1: Создать helper**

```typescript
// src/tools/view_toc_response.ts
import type { Index, TocNode, FlatHeader } from "../index/types.js";
import type { ViewTocInput } from "../schemas/inputs.js";

type ResponseTocNode = Omit<TocNode, "children"> & { children: ResponseTocNode[] };

export type ViewTocResponse = {
  file: {
    path: string;
    size_bytes: number;
    line_count: number;
    mtime: string;
    frontmatter?: Record<string, unknown>;
  };
  toc: ResponseTocNode[];
  anomalies_summary: {
    total: number;
    by_type: Record<string, number>;
    hint?: string;
  };
};

function trimToDepth(node: TocNode, currentDepth: number, maxDepth: number | null): ResponseTocNode {
  const children =
    maxDepth !== null && currentDepth >= maxDepth
      ? []
      : node.children.map((c) => trimToDepth(c, currentDepth + 1, maxDepth));
  return { ...node, children };
}

function rawFlatToc(flat: FlatHeader[]): ResponseTocNode[] {
  return flat.map((h) => ({
    id: h.id,
    level: h.level,
    title: h.title,
    numbering: h.numbering,
    line: h.line,
    line_end: h.line,           // в raw неизвестно — ставим = line (агент видит «не вычислено»)
    section_lines: 1,
    is_likely_artifact: false,
    children: [],
  }));
}

export function buildViewTocResponse(
  index: Index,
  input: ViewTocInput
): ViewTocResponse {
  const raw = input.raw === true;
  const depth = input.depth ?? null;
  const tocOut: ResponseTocNode[] = raw
    ? rawFlatToc(index.flat_headers)
    : index.toc.map((n) => trimToDepth(n, 1, depth));

  const byType: Record<string, number> = {};
  if (!raw) {
    for (const a of index.anomalies) {
      byType[a.type] = (byType[a.type] ?? 0) + 1;
    }
  }
  const total = raw ? 0 : index.anomalies.length;

  return {
    file: {
      path: index.file_path,
      size_bytes: index.size_bytes,
      line_count: index.line_count,
      mtime: new Date(index.mtime_ms).toISOString(),
      ...(index.frontmatter && { frontmatter: index.frontmatter }),
    },
    toc: tocOut,
    anomalies_summary: {
      total,
      by_type: byType,
      ...(total > 0 && {
        hint: "Call analyze_document for details and to discuss handling with the user.",
      }),
    },
  };
}
```

- [ ] **Step 6.2: Заменить stub в view_toc.ts**

```typescript
// src/tools/view_toc.ts
import type { IndexCache } from "../index/cache.js";
import type { ViewTocInput } from "../schemas/inputs.js";
import { buildViewTocResponse } from "./view_toc_response.js";

export function makeViewTocHandler(cache: IndexCache) {
  return async function viewToc(input: ViewTocInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildViewTocResponse(index, input);
    return {
      content: [
        { type: "text", text: JSON.stringify(response, null, 2) },
      ],
    };
  };
}
```

- [ ] **Step 6.3: typecheck**

Run: `pnpm typecheck` → exit 0.

---

### Task 7: Server DI + index.ts cache wiring

**Files:**
- Modify: `src/server.ts`
- Modify: `src/index.ts`

- [ ] **Step 7.1: Изменить server.ts**

Подключить `IndexCache` через DI и заменить view_toc-callback на handler из `makeViewTocHandler(cache)`. Остальные tools (read_section/search/analyze_document) — оставить на старых stub'ах.

- [ ] **Step 7.2: Изменить index.ts**

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { IndexCache } from "./index/cache.js";

async function main() {
  const cache = new IndexCache();
  const server = createServer({ cache });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

main().catch((err) => {
  console.error("markdown-docs-mcp fatal error:", err);
  process.exit(1);
});
```

- [ ] **Step 7.3: Обновить tools-call-stub.test.ts**

Убрать `view_toc` из списка проверяемых stub'ов. Оставить 3 (read_section, search, analyze_document).

- [ ] **Step 7.4: Запустить тесты**

Run: `pnpm test` → все существующие плюс новые passing.

---

### Task 8: Integration tests on public fixtures

**Files:**
- Create: `tests/integration/view_toc.test.ts`

- [ ] **Step 8.1: Написать тесты**

Использовать InMemoryTransport + createServer({ cache: new IndexCache() }) + клиент.

```typescript
// tests/integration/view_toc.test.ts
import { describe, it, expect, afterAll } from "vitest";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { IndexCache } from "../../src/index/cache.js";

const ESP32 = resolve(__dirname, "../fixtures/public/esp32-p4-datasheet.md");
const STM32 = resolve(__dirname, "../fixtures/public/stm32h750ib.md");

async function makeClient() {
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const server = createServer({ cache: new IndexCache() });
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  return { client, close: () => client.close() };
}

function parseToc(result: unknown): { file: any; toc: any[]; anomalies_summary: any } {
  const r = result as { content: Array<{ type: string; text: string }> };
  return JSON.parse(r.content[0]!.text);
}

describe("view_toc integration", () => {
  let openClients: Array<{ close: () => Promise<void> }> = [];
  afterAll(async () => {
    for (const c of openClients) await c.close();
  });

  it("ESP32-P4 datasheet: many self-nesting anomalies (>= 20)", async () => {
    const { client, close } = await makeClient();
    openClients.push({ close });
    const result = await client.callTool({
      name: "view_toc",
      arguments: { file_path: ESP32 },
    });
    const parsed = parseToc(result);
    expect(parsed.anomalies_summary.by_type.self_nesting_header).toBeGreaterThanOrEqual(20);
    expect(parsed.anomalies_summary.hint).toContain("analyze_document");
    expect(parsed.toc.length).toBeGreaterThan(0);
  });

  it("STM32H750IB datasheet: clean hierarchy, 0 self_nesting anomalies", async () => {
    const { client, close } = await makeClient();
    openClients.push({ close });
    const result = await client.callTool({
      name: "view_toc",
      arguments: { file_path: STM32 },
    });
    const parsed = parseToc(result);
    expect(parsed.anomalies_summary.by_type.self_nesting_header ?? 0).toBe(0);
  });

  it("respects depth=1 (only roots, children empty)", async () => {
    const { client, close } = await makeClient();
    openClients.push({ close });
    const result = await client.callTool({
      name: "view_toc",
      arguments: { file_path: STM32, depth: 1 },
    });
    const parsed = parseToc(result);
    for (const node of parsed.toc) {
      expect(node.children).toEqual([]);
    }
  });

  it("raw=true returns flat list and 0 anomalies", async () => {
    const { client, close } = await makeClient();
    openClients.push({ close });
    const result = await client.callTool({
      name: "view_toc",
      arguments: { file_path: ESP32, raw: true },
    });
    const parsed = parseToc(result);
    expect(parsed.anomalies_summary.total).toBe(0);
    for (const node of parsed.toc) {
      expect(node.children).toEqual([]);
    }
  });

  it("invalid file_path causes tool error", async () => {
    const { client, close } = await makeClient();
    openClients.push({ close });
    const result = await client.callTool({
      name: "view_toc",
      arguments: { file_path: "/no/such/file.md" },
    });
    expect((result as { isError?: boolean }).isError).toBe(true);
  });
});
```

- [ ] **Step 8.2: Run tests** → PASS. ESP32 anomaly count >= 20 — это critical acceptance, проверяет sanity всего pipeline.

---

### Task 9: Line-coverage invariant

**Files:**
- Create: `tests/integration/invariants.test.ts`

- [ ] **Step 9.1: Написать тест**

Инвариант (spec раздел 5.4): объединение `[line..line_end]` всех узлов TOC покрывает `[1..line_count]` без пропусков и без перекрытий.

```typescript
// tests/integration/invariants.test.ts
import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { IndexCache } from "../../src/index/cache.js";
import type { TocNode } from "../../src/index/types.js";

const PUBLIC = ["esp32-p4-datasheet.md", "stm32h750ib.md"];

function flatten(nodes: TocNode[]): TocNode[] {
  const result: TocNode[] = [];
  const stack: TocNode[] = [...nodes];
  while (stack.length > 0) {
    const n = stack.pop()!;
    result.push(n);
    for (const c of n.children) stack.push(c);
  }
  return result;
}

describe("line coverage invariant (no content loss)", () => {
  for (const fixture of PUBLIC) {
    it(`${fixture}: TOC covers every line of the file exactly once`, async () => {
      const path = resolve(__dirname, "../fixtures/public", fixture);
      const cache = new IndexCache();
      const idx = await cache.getOrBuild(path);

      // Lines before the first heading belong to "preamble" (no node owns them).
      // Per spec, every line of the document is reachable through one of:
      //   - the preamble (lines 1..firstHeader.line-1), OR
      //   - exactly one TOC node by section ownership.
      // Build an array `owner[line] = nodeId | "preamble"` and confirm coverage.

      const all = flatten(idx.toc);
      const owner: Array<string | undefined> = new Array(idx.line_count + 1);

      const firstHeading = idx.flat_headers[0];
      const preambleEnd = firstHeading ? firstHeading.line - 1 : idx.line_count;
      for (let l = 1; l <= preambleEnd; l++) owner[l] = "preamble";

      // Each leaf node owns lines [node.line .. (next sibling/parent end)] —
      // but because TocNode.line_end already covers descendants, only LEAVES
      // are the unique owners of every line in their range, while inner nodes
      // share lines with their children. Therefore: walk leaves only.
      function leaves(nodes: TocNode[]): TocNode[] {
        const out: TocNode[] = [];
        const visit = (n: TocNode) => {
          if (n.children.length === 0) out.push(n);
          else n.children.forEach(visit);
        };
        nodes.forEach(visit);
        return out;
      }

      // Inner-node head line (the heading itself) is also "owned" by that inner
      // node from the first child's perspective: when there are children, the
      // heading line is the inner node's, lines after the heading until first
      // child belong to the inner node's "intro" — we collapse this into
      // ownership by labelling lines [node.line, firstChild.line - 1] for inner
      // nodes, and [node.line, node.line_end] for leaves.

      const allNodes = flatten(idx.toc);
      for (const n of allNodes) {
        const firstChild = n.children[0];
        const ownEnd = firstChild ? firstChild.line - 1 : n.line_end;
        for (let l = n.line; l <= ownEnd; l++) {
          expect(owner[l], `line ${l} would be owned by ${n.id} but is already owned by ${owner[l]}`).toBeUndefined();
          owner[l] = n.id;
        }
      }

      for (let l = 1; l <= idx.line_count; l++) {
        expect(owner[l], `line ${l} has no owner`).toBeDefined();
      }
    });
  }
});
```

- [ ] **Step 9.2: Run test** → PASS на обоих fixtures.

Если тест падает — это сигнал что reparenting/line_end computation в builder.ts имеет баг. Не закрывать тест мутацией — найти причину в коде.

---

### Task 10: Финализация

- [ ] **Step 10.1: Полный pipeline**

Run от `/Users/pavel/projects/markdown-docs-mcp/`:
```
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
node dist/index.js < /dev/null
```

Все exit 0. Test count: должно быть ≥ 13 файлов / ≥ 65 тестов.

- [ ] **Step 10.2: Tick PR-04 checkbox**

В spec разделе 15: `[ ] **PR-04: view_toc + anomalies**` → `[x]`.

- [ ] **Step 10.3: Commit + push**

---

## Acceptance criteria

После merge PR-04:

1. `pnpm typecheck && pnpm test && pnpm build` зелёные.
2. `view_toc` для `tests/fixtures/public/esp32-p4-datasheet.md` возвращает >= 20 `self_nesting_header` аномалий с `hint`.
3. `view_toc` для `tests/fixtures/public/stm32h750ib.md` возвращает 0 self_nesting.
4. `view_toc({raw: true})` возвращает плоский список + 0 anomalies.
5. `view_toc({depth: 1})` обрезает children всех узлов до пустых массивов.
6. Line-coverage invariant зелёный для обоих fixtures.
7. Tools read_section / search / analyze_document остаются stub'ами.
8. Чекбокс PR-04 отмечен.

## Anti-patterns

- Не реализовывать read_section / search / analyze_document (PR-05+).
- Не «лечить» документ — никаких mutation Index или TOC сверх установки флага is_likely_artifact.
- Не строить TOC с `line_end = 0` для inner nodes — leaves + inner intros должны покрывать все строки.
- Не объединять anomalies summary с полным `Anomaly[]` в response view_toc — полный отчёт через analyze_document (PR-06).
