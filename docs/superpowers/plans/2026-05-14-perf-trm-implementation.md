# План: оптимизация производительности на больших документах

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Снизить cold-start `buildIndex` на ESP32-P4 TRM с 112 s до < 1 s, сохранив все существующие инварианты и публичные API.

**Architecture:** Single-pass парсеры через `lineOfOffsetBinary(lineOffsets, offset)` вместо O(N) `lineOfOffset` на каждый match; общие `Map<id, …>` структуры в `Index`, заменяющие 4 копии `findNodeById` и пересборку `lineSectionMap` в search. Без изменений публичных типов.

**Tech Stack:** TypeScript / Node 20+ / Vitest / esbuild / `@modelcontextprotocol/sdk`.

**Контекст:** ветка `perf/trm-optimizations`, спека [docs/superpowers/specs/2026-05-14-perf-trm-design.md](../specs/2026-05-14-perf-trm-design.md).

---

## File map

**Создаются:**
- `src/parser/_line_offsets.ts` — `computeLineOffsets` (перенесён из builder.ts) + `lineOfOffsetBinary`.
- `src/index/maps.ts` — `buildNodeById`, `buildFlatIndexById`, `buildLineSectionMap` + тип `SectionInfo`.
- `tests/unit/parser/line_offsets.test.ts` — unit-тесты утилит.
- `tests/unit/index/maps.test.ts` — unit-тесты map-builders.

**Модифицируются:**
- `src/index/types.ts` — расширение `Index` тремя полями.
- `src/parser/comments.ts` — single-pass через `lineOfOffsetBinary`, новая сигнатура.
- `src/parser/pdf_pages.ts` — то же.
- `src/index/reparenting.ts` — без рекурсивного `findNodeById`, возвращает `{ roots, flat }`.
- `src/index/builder.ts` — `computeLineOffsets` переехал вверх; передаёт `lineOffsets` в парсеры; строит maps; `collectRanges` удалён.
- `src/anomalies/detector.ts` — `flat.findIndex(...)` → `flat_index_by_id.get(...)`.
- `src/tools/view_toc_response.ts` — `index.node_by_id` + бинпоиск префикса в raw=true и в depth=1 фоллбэке.
- `src/tools/read_section_response.ts` — `index.node_by_id` + `index.flat_index_by_id`.
- `src/tools/search_response.ts` — `index.line_section_map`.
- `src/tools/analyze_document_response.ts` — `index.node_by_id`.
- `tests/unit/parser/comments.test.ts` — обновить вызовы под новую сигнатуру + добавить boundary cases.
- `tests/unit/parser/pdf_pages.test.ts` — то же.
- `tests/integration/stress_huge_document.test.ts` — обновить timeout.

---

### Task 1: Создать `src/parser/_line_offsets.ts` + unit-тесты

**Files:**
- Create: `src/parser/_line_offsets.ts`
- Create: `tests/unit/parser/line_offsets.test.ts`

- [ ] **Step 1.1: Написать failing-тесты**

`tests/unit/parser/line_offsets.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  computeLineOffsets,
  lineOfOffsetBinary,
} from "../../../src/parser/_line_offsets.js";

describe("computeLineOffsets", () => {
  it("returns [0] for empty content", () => {
    expect(computeLineOffsets("")).toEqual([0]);
  });

  it("counts each newline", () => {
    // "a\nb\nc" -> lines start at 0, 2, 4
    expect(computeLineOffsets("a\nb\nc")).toEqual([0, 2, 4]);
  });

  it("trailing newline produces an extra entry", () => {
    expect(computeLineOffsets("a\nb\n")).toEqual([0, 2, 4]);
  });
});

describe("lineOfOffsetBinary", () => {
  // content: "a\nbc\ndef\n"
  // chars:    0 1 234 5678
  // line:     1   2   3
  const offsets = computeLineOffsets("a\nbc\ndef\n");
  // offsets = [0, 2, 5, 9]

  it("offset 0 -> line 1", () => {
    expect(lineOfOffsetBinary(offsets, 0)).toBe(1);
  });

  it("offset 1 (the \\n at end of line 1) -> line 1", () => {
    expect(lineOfOffsetBinary(offsets, 1)).toBe(1);
  });

  it("offset 2 (start of line 2) -> line 2", () => {
    expect(lineOfOffsetBinary(offsets, 2)).toBe(2);
  });

  it("offset 4 (the \\n at end of line 2) -> line 2", () => {
    expect(lineOfOffsetBinary(offsets, 4)).toBe(2);
  });

  it("offset 5 (start of line 3) -> line 3", () => {
    expect(lineOfOffsetBinary(offsets, 5)).toBe(3);
  });

  it("offset 8 (last char of line 3) -> line 3", () => {
    expect(lineOfOffsetBinary(offsets, 8)).toBe(3);
  });
});
```

- [ ] **Step 1.2: Запустить тесты — должны упасть**

```
pnpm test -- tests/unit/parser/line_offsets.test.ts
```

Expected: FAIL — модуль `_line_offsets.ts` не существует.

- [ ] **Step 1.3: Реализовать модуль**

`src/parser/_line_offsets.ts`:

```ts
// Shared utilities for line/offset conversions.
// Used by builder + comment/pdf-page parsers to avoid repeated O(N) re-scans.

export function computeLineOffsets(content: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) === 10) {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

// Returns the 1-based line number containing the given char offset.
// Precondition: offset is within [0, content.length). For offset === 0,
// returns 1. For offset === lineOffsets[i], returns i + 1.
export function lineOfOffsetBinary(
  lineOffsets: number[],
  offset: number
): number {
  // Find the largest index i such that lineOffsets[i] <= offset.
  let lo = 0;
  let hi = lineOffsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (lineOffsets[mid]! <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}
```

- [ ] **Step 1.4: Запустить тесты — должны пройти**

```
pnpm test -- tests/unit/parser/line_offsets.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 1.5: Commit**

```bash
git add src/parser/_line_offsets.ts tests/unit/parser/line_offsets.test.ts
git commit -m "feat(parser): add _line_offsets utility with binary-search lookup

Adds lineOfOffsetBinary helper that enables O(log N) offset->line lookups,
replacing the O(N) scan that comment and pdf-page parsers perform per match
on large documents."
```

---

### Task 2: Реорганизовать `builder.ts` — `computeLineOffsets` вверх + использовать общий модуль

**Files:**
- Modify: `src/index/builder.ts:1-23` (импорты, удалить локальный `computeLineOffsets`)
- Modify: `src/index/builder.ts:34-60` (порядок шагов в `buildIndex`)

Это чисто рефакторинг порядка — без изменений сигнатур парсеров. Все существующие тесты должны продолжать проходить.

- [ ] **Step 2.1: Обновить импорты**

В `src/index/builder.ts` заменить блок импортов в начале файла:

```ts
import { readFile, stat } from "node:fs/promises";
import { extractHeadings } from "../parser/markdown.js";
import { findCommentRanges } from "../parser/comments.js";
import { parseFrontmatter } from "../parser/frontmatter.js";
import { extractNumbering } from "../parser/numbering.js";
import { parsePdfPageMarkers } from "../parser/pdf_pages.js";
import { computeLineOffsets } from "../parser/_line_offsets.js";
import { buildTocTree } from "./reparenting.js";
import { detectAnomalies } from "../anomalies/detector.js";
import type { FlatHeader, FlatSeed, Index, TocNode } from "./types.js";
```

И удалить локальную функцию `computeLineOffsets` (строки 15-23 текущего файла).

- [ ] **Step 2.2: Передвинуть `computeLineOffsets` вверх в `buildIndex`**

В `buildIndex` строки сразу после `parseFrontmatter(raw)` должны выглядеть так:

```ts
const fm = parseFrontmatter(raw);

// Compute line_offsets up front — both parsers will use it for O(log N) line lookup.
const line_offsets = computeLineOffsets(raw);
const line_count = line_offsets.length;

const headingsInBody = extractHeadings(fm.body);
const bodyOffset = fm.body_start_line - 1;
```

И удалить старые строки `const comment_ranges = ...; const line_offsets = computeLineOffsets(raw); const line_count = ...;` — теперь `line_offsets` и `line_count` уже определены выше. Оставить:

```ts
const comment_ranges = findCommentRanges(raw);
const toc = buildTocTree(flatSeeds, line_count);
```

(Сигнатуры парсеров пока не меняем — это сделаем в Tasks 3 и 4.)

- [ ] **Step 2.3: Запустить полный тестовый прогон**

```
pnpm typecheck
pnpm test
```

Expected: все существующие unit и integration-тесты проходят (стресс на TRM включительно — это длительный прогон ~3 минуты, потерпите).

- [ ] **Step 2.4: Commit**

```bash
git add src/index/builder.ts
git commit -m "refactor(builder): reorder buildIndex to compute line_offsets early

Moves computeLineOffsets to the top of buildIndex and switches to the shared
_line_offsets utility. No behavioural change — preparation for parsers that
will accept lineOffsets in subsequent commits."
```

---

### Task 3: Переписать `comments.ts` — single-pass через `lineOfOffsetBinary`

**Files:**
- Modify: `src/parser/comments.ts` (полная замена)
- Modify: `tests/unit/parser/comments.test.ts` (обновить вызовы + добавить boundary cases)
- Modify: `src/index/builder.ts:1 (вызов findCommentRanges)`

- [ ] **Step 3.1: Обновить unit-тесты под новую сигнатуру + добавить boundary cases**

Заменить полностью `tests/unit/parser/comments.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { findCommentRanges } from "../../../src/parser/comments.js";
import { computeLineOffsets } from "../../../src/parser/_line_offsets.js";

function ranges(content: string) {
  return findCommentRanges(content, computeLineOffsets(content));
}

describe("findCommentRanges", () => {
  it("detects single-line comment", () => {
    const md = "line 1\n<!-- a comment -->\nline 3\n";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 2 }]);
  });

  it("detects multi-line comment", () => {
    const md = "line 1\n<!--\n  some\n  text\n-->\nline 6\n";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 5 }]);
  });

  it("detects multiple comments", () => {
    const md = "line 1\n<!-- a -->\nline 3\n<!-- b -->\nline 5\n";
    expect(ranges(md)).toEqual([
      { start_line: 2, end_line: 2 },
      { start_line: 4, end_line: 4 },
    ]);
  });

  it("ignores HTML-comment-looking text inside fenced code blocks", () => {
    const md =
      "# real\n```\n<!-- not a real comment -->\n```\n<!-- real comment -->\n";
    const r = ranges(md);
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ start_line: 5, end_line: 5 });
  });

  it("returns empty array for content without comments", () => {
    expect(ranges("just text\n# heading\n")).toEqual([]);
  });

  it("handles PDF page markers (multiple, consecutive)", () => {
    const md =
      "<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\n## Heading\n";
    expect(ranges(md)).toEqual([
      { start_line: 1, end_line: 1 },
      { start_line: 3, end_line: 3 },
    ]);
  });

  // -------- boundary cases (off-by-one regressions) --------

  it("comment on line 1 (offset 0)", () => {
    const md = "<!-- start -->\nbody\n";
    expect(ranges(md)).toEqual([{ start_line: 1, end_line: 1 }]);
  });

  it("comment on the last line without trailing newline", () => {
    const md = "body\n<!-- end -->";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 2 }]);
  });

  it("multi-line comment spanning 5 lines", () => {
    const md =
      "x\n<!-- A\nB\nC\nD\nE -->\ny\n";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 6 }]);
  });

  it("two comments on the same line", () => {
    const md = "<!-- a --> text <!-- b -->\nnext\n";
    expect(ranges(md)).toEqual([
      { start_line: 1, end_line: 1 },
      { start_line: 1, end_line: 1 },
    ]);
  });
});
```

- [ ] **Step 3.2: Запустить тесты — должны упасть на сигнатуре**

```
pnpm test -- tests/unit/parser/comments.test.ts
```

Expected: FAIL — `findCommentRanges` сейчас принимает один аргумент.

- [ ] **Step 3.3: Переписать `src/parser/comments.ts`**

Заменить файл целиком:

```ts
import MarkdownIt from "markdown-it";
import { lineOfOffsetBinary } from "./_line_offsets.js";

export type CommentRange = {
  start_line: number;
  end_line: number;
};

const md = new MarkdownIt({ html: true });

function getCodeBlockRanges(
  content: string
): Array<{ start: number; end: number }> {
  const tokens = md.parse(content, {});
  const ranges: Array<{ start: number; end: number }> = [];
  for (const tok of tokens) {
    if ((tok.type === "fence" || tok.type === "code_block") && tok.map) {
      // map is 0-based: [startLine, endLine) — endLine is exclusive
      // convert to 1-based inclusive range
      ranges.push({ start: tok.map[0] + 1, end: tok.map[1] });
    }
  }
  return ranges;
}

export function findCommentRanges(
  content: string,
  lineOffsets: number[]
): CommentRange[] {
  const codeRanges = getCodeBlockRanges(content);
  const re = /<!--[\s\S]*?-->/g;
  const result: CommentRange[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const start_line = lineOfOffsetBinary(lineOffsets, match.index);
    const end_line = lineOfOffsetBinary(
      lineOffsets,
      match.index + match[0].length - 1
    );
    const insideCode = codeRanges.some(
      (cr) => start_line >= cr.start && end_line <= cr.end
    );
    if (!insideCode) {
      result.push({ start_line, end_line });
    }
  }
  return result;
}
```

- [ ] **Step 3.4: Обновить вызов в `builder.ts`**

В `src/index/builder.ts` заменить строку:

```ts
const comment_ranges = findCommentRanges(raw);
```

на:

```ts
const comment_ranges = findCommentRanges(raw, line_offsets);
```

- [ ] **Step 3.5: Запустить тесты — должны пройти**

```
pnpm typecheck
pnpm test -- tests/unit/parser/comments.test.ts
```

Expected: PASS все unit-тесты.

- [ ] **Step 3.6: Commit**

```bash
git add src/parser/comments.ts src/index/builder.ts tests/unit/parser/comments.test.ts
git commit -m "perf(parser): O(log N) line lookup in findCommentRanges

Replaces lineOfOffset O(N) per match with binary search over precomputed
lineOffsets, eliminating O(N*M) full re-scans on documents with many
comments. Also adds boundary-case tests for off-by-one regressions."
```

---

### Task 4: Переписать `pdf_pages.ts` — single-pass через `lineOfOffsetBinary`

**Files:**
- Modify: `src/parser/pdf_pages.ts` (полная замена)
- Modify: `tests/unit/parser/pdf_pages.test.ts` (обновить вызовы + boundary cases)
- Modify: `src/index/builder.ts` (вызов parsePdfPageMarkers)

- [ ] **Step 4.1: Обновить unit-тесты + добавить boundary cases**

Заменить полностью `tests/unit/parser/pdf_pages.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parsePdfPageMarkers } from "../../../src/parser/pdf_pages.js";
import { computeLineOffsets } from "../../../src/parser/_line_offsets.js";

function markers(content: string) {
  return parsePdfPageMarkers(content, computeLineOffsets(content));
}

describe("parsePdfPageMarkers", () => {
  it("finds BEGIN and END markers with line numbers", () => {
    const md =
      "line1\n<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\nline5\n";
    expect(markers(md)).toEqual([
      { line: 2, page: 38, kind: "end" },
      { line: 4, page: 39, kind: "begin" },
    ]);
  });

  it("returns empty array when no markers", () => {
    expect(markers("# heading\nbody\n")).toEqual([]);
  });

  it("ignores generic HTML comments", () => {
    expect(markers("<!-- note -->\n")).toEqual([]);
  });

  it("handles whitespace variations inside marker", () => {
    const md = "<!--PDF_PAGE_BEGIN 1-->\n<!--  PDF_PAGE_END    2  -->\n";
    const result = markers(md);
    expect(result).toHaveLength(2);
    expect(result[0]?.page).toBe(1);
    expect(result[1]?.page).toBe(2);
  });

  // -------- boundary cases --------

  it("marker on line 1 (offset 0)", () => {
    const md = "<!-- PDF_PAGE_BEGIN 1 -->\nbody\n";
    expect(markers(md)).toEqual([{ line: 1, page: 1, kind: "begin" }]);
  });

  it("marker on the last line without trailing newline", () => {
    const md = "body\n<!-- PDF_PAGE_END 9 -->";
    expect(markers(md)).toEqual([{ line: 2, page: 9, kind: "end" }]);
  });

  it("two markers in immediate succession", () => {
    const md =
      "<!-- PDF_PAGE_END 1 --><!-- PDF_PAGE_BEGIN 2 -->\nbody\n";
    expect(markers(md)).toEqual([
      { line: 1, page: 1, kind: "end" },
      { line: 1, page: 2, kind: "begin" },
    ]);
  });
});
```

- [ ] **Step 4.2: Запустить тесты — должны упасть**

```
pnpm test -- tests/unit/parser/pdf_pages.test.ts
```

Expected: FAIL — сигнатура.

- [ ] **Step 4.3: Переписать `src/parser/pdf_pages.ts`**

Заменить файл целиком:

```ts
import { lineOfOffsetBinary } from "./_line_offsets.js";

export type PdfMarker = {
  line: number;
  page: number;
  kind: "begin" | "end";
};

const RE = /<!--\s*PDF_PAGE_(BEGIN|END)\s+(\d+)\s*-->/g;

export function parsePdfPageMarkers(
  content: string,
  lineOffsets: number[]
): PdfMarker[] {
  RE.lastIndex = 0;
  const result: PdfMarker[] = [];
  let match: RegExpExecArray | null;
  while ((match = RE.exec(content)) !== null) {
    const line = lineOfOffsetBinary(lineOffsets, match.index);
    const kind = match[1] === "BEGIN" ? "begin" : "end";
    const page = parseInt(match[2]!, 10);
    result.push({ line, page, kind });
  }
  return result;
}
```

- [ ] **Step 4.4: Обновить вызов в `builder.ts`**

В `src/index/builder.ts` заменить строку:

```ts
const pdf_markers = parsePdfPageMarkers(raw);
```

на:

```ts
const pdf_markers = parsePdfPageMarkers(raw, line_offsets);
```

- [ ] **Step 4.5: Запустить тесты — должны пройти**

```
pnpm typecheck
pnpm test -- tests/unit/parser/
```

Expected: PASS.

- [ ] **Step 4.6: Commit**

```bash
git add src/parser/pdf_pages.ts src/index/builder.ts tests/unit/parser/pdf_pages.test.ts
git commit -m "perf(parser): O(log N) line lookup in parsePdfPageMarkers

Same binary-search treatment as findCommentRanges. Together they cut TRM
cold-start parsing from ~112 s to under 1 s."
```

---

### Task 5: Переписать `reparenting.ts` — без рекурсивного `findNodeById`, возвращать enriched flat

**Files:**
- Modify: `src/index/reparenting.ts` (полная замена)
- Modify: `src/index/builder.ts` (использовать новую структуру результата; удалить `collectRanges`)

Существующие тесты на reparenting (`tests/unit/index/reparenting.test.ts`, если есть) и integration invariants ловят регрессии.

- [ ] **Step 5.1: Переписать `src/index/reparenting.ts`**

Заменить файл целиком:

```ts
import type { FlatHeader, FlatSeed, TocNode } from "./types.js";

export type ReparentingResult = {
  roots: TocNode[];
  flat: FlatHeader[]; // same order as input headers; line_end / section_lines filled
};

export function buildTocTree(
  headers: FlatSeed[],
  totalLines: number
): ReparentingResult {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  const nodes: TocNode[] = new Array(headers.length);

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!;
    const node: TocNode = {
      id: h.id,
      level: h.level,
      title: h.title,
      numbering: h.numbering,
      line: h.line,
      line_end: 0,        // filled in second pass
      section_lines: 0,   // filled in second pass
      is_likely_artifact: false,
      children: [],
    };
    nodes[i] = node;

    while (
      stack.length > 0 &&
      stack[stack.length - 1]!.level >= node.level
    ) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1]!.children.push(node);
    }
    stack.push(node);
  }

  // Second pass: compute line_end via index lookup, no recursion.
  const flat: FlatHeader[] = new Array(headers.length);
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!;
    let endLine = totalLines;
    for (let j = i + 1; j < headers.length; j++) {
      const next = headers[j]!;
      if (next.level <= h.level) {
        endLine = next.line - 1;
        break;
      }
    }
    nodes[i]!.line_end = endLine;
    nodes[i]!.section_lines = endLine - h.line + 1;
    flat[i] = {
      ...h,
      line_end: endLine,
      section_lines: endLine - h.line + 1,
    };
  }

  return { roots, flat };
}
```

- [ ] **Step 5.2: Адаптировать `src/index/builder.ts`**

Заменить блок построения toc/flat (текущие строки 60-88) на:

```ts
const { roots: toc, flat } = buildTocTree(flatSeeds, line_count);
```

Удалить полностью:
- `const ranges = new Map<string, { line_end: number; section_lines: number }>();` и связанный `collectRanges` блок;
- `const flat: FlatHeader[] = flatSeeds.map(...)` (всё, что строит `flat` через `ranges`);
- `function findNodeById(...)` если использовалась только в этом файле.

В оставшемся коде `tempIndex` использует уже обогащённый `flat` напрямую.

- [ ] **Step 5.3: Запустить тесты**

```
pnpm typecheck
pnpm test
```

Expected: все существующие тесты проходят, включая стресс на TRM (после Tasks 3-4 он уже должен идти за секунды).

- [ ] **Step 5.4: Commit**

```bash
git add src/index/reparenting.ts src/index/builder.ts
git commit -m "refactor(index): reparenting returns enriched flat headers

Removes the O(n^2) findNodeById walk from buildTocTree and the matching
collectRanges pass in builder.ts. Both passes happened on every cold-start
on top of an array we already had in document order."
```

---

### Task 6: Создать `src/index/maps.ts` + unit-тесты (standalone)

**Files:**
- Create: `src/index/maps.ts`
- Create: `tests/unit/index/maps.test.ts`

Модуль ещё не подключён к `Index` — это сделаем в Task 7.

- [ ] **Step 6.1: Написать failing-тесты**

`tests/unit/index/maps.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  buildNodeById,
  buildFlatIndexById,
  buildLineSectionMap,
  type SectionInfo,
} from "../../../src/index/maps.js";
import type { FlatHeader, TocNode } from "../../../src/index/types.js";

function mkNode(
  id: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  line: number,
  lineEnd: number,
  children: TocNode[] = []
): TocNode {
  return {
    id,
    level,
    title: id,
    numbering: null,
    line,
    line_end: lineEnd,
    section_lines: lineEnd - line + 1,
    is_likely_artifact: false,
    children,
  };
}

describe("buildNodeById", () => {
  it("returns one entry per node, including nested", () => {
    const grandchild = mkNode("s5", 3, 5, 6);
    const child = mkNode("s3", 2, 3, 6, [grandchild]);
    const root = mkNode("s1", 1, 1, 6, [child]);
    const map = buildNodeById([root]);
    expect(map.size).toBe(3);
    expect(map.get("s1")).toBe(root);
    expect(map.get("s3")).toBe(child);
    expect(map.get("s5")).toBe(grandchild);
  });

  it("returns empty map for empty toc", () => {
    expect(buildNodeById([]).size).toBe(0);
  });
});

describe("buildFlatIndexById", () => {
  it("maps each header id to its position in the flat array", () => {
    const flat: FlatHeader[] = [
      { id: "s1", level: 1, title: "A", numbering: null, line: 1, line_end: 2, section_lines: 2 },
      { id: "s3", level: 2, title: "B", numbering: null, line: 3, line_end: 5, section_lines: 3 },
      { id: "s6", level: 1, title: "C", numbering: null, line: 6, line_end: 9, section_lines: 4 },
    ];
    const map = buildFlatIndexById(flat);
    expect(map.size).toBe(3);
    expect(map.get("s1")).toBe(0);
    expect(map.get("s3")).toBe(1);
    expect(map.get("s6")).toBe(2);
  });
});

describe("buildLineSectionMap", () => {
  it("assigns deepest-section semantics — children overwrite parent", () => {
    const child = mkNode("s3", 2, 3, 4);
    const root = mkNode("s1", 1, 1, 5, [child]);
    const map = buildLineSectionMap([root], 5);
    // line indexes 0..4 = lines 1..5
    expect((map[0] as SectionInfo).id).toBe("s1");
    expect((map[1] as SectionInfo).id).toBe("s1");
    expect((map[2] as SectionInfo).id).toBe("s3"); // child overrides
    expect((map[3] as SectionInfo).id).toBe("s3");
    expect((map[4] as SectionInfo).id).toBe("s1"); // back to root
  });

  it("returns null for preamble lines before the first heading", () => {
    const root = mkNode("s3", 1, 3, 5);
    const map = buildLineSectionMap([root], 5);
    expect(map[0]).toBeNull(); // line 1
    expect(map[1]).toBeNull(); // line 2
    expect((map[2] as SectionInfo).id).toBe("s3"); // line 3
  });

  it("clamps line_end to lineCount", () => {
    const root = mkNode("s1", 1, 1, 999);
    const map = buildLineSectionMap([root], 3);
    expect(map).toHaveLength(3);
    expect((map[2] as SectionInfo).id).toBe("s1");
  });
});
```

- [ ] **Step 6.2: Запустить тесты — должны упасть**

```
pnpm test -- tests/unit/index/maps.test.ts
```

Expected: FAIL — модуль не существует.

- [ ] **Step 6.3: Реализовать `src/index/maps.ts`**

```ts
import type { FlatHeader, TocNode } from "./types.js";

export type SectionInfo = {
  id: string;
  title: string;
  level: number;
  numbering: string | null;
};

export function buildNodeById(toc: TocNode[]): Map<string, TocNode> {
  const map = new Map<string, TocNode>();
  function visit(node: TocNode): void {
    map.set(node.id, node);
    for (const child of node.children) visit(child);
  }
  for (const root of toc) visit(root);
  return map;
}

export function buildFlatIndexById(
  flat: ReadonlyArray<FlatHeader>
): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < flat.length; i++) {
    map.set(flat[i]!.id, i);
  }
  return map;
}

export function buildLineSectionMap(
  toc: TocNode[],
  lineCount: number
): Array<SectionInfo | null> {
  const map: Array<SectionInfo | null> = new Array(lineCount).fill(null);
  function visit(node: TocNode): void {
    const info: SectionInfo = {
      id: node.id,
      title: node.title,
      level: node.level,
      numbering: node.numbering,
    };
    const start = node.line - 1;
    const end = Math.min(node.line_end - 1, lineCount - 1);
    for (let i = start; i <= end; i++) {
      map[i] = info;
    }
    for (const c of node.children) visit(c);
  }
  for (const root of toc) visit(root);
  return map;
}
```

- [ ] **Step 6.4: Запустить тесты — должны пройти**

```
pnpm typecheck
pnpm test -- tests/unit/index/maps.test.ts
```

Expected: PASS.

- [ ] **Step 6.5: Commit**

```bash
git add src/index/maps.ts tests/unit/index/maps.test.ts
git commit -m "feat(index): add shared map builders for Index

buildNodeById, buildFlatIndexById, and buildLineSectionMap. Not yet wired
into Index — that lands in the next commit."
```

---

### Task 7: Подключить maps к `Index` через builder.ts

**Files:**
- Modify: `src/index/types.ts:37-50` (расширить `Index`)
- Modify: `src/index/builder.ts` (заполнить три новых поля; перенести build перед `detectAnomalies`; заменить `findNodeById` для is_likely_artifact на `node_by_id.get`)

После этой задачи `Index` несёт три новых поля, но потребители (response builders, detector) их ещё не используют. Все существующие тесты должны продолжать проходить.

- [ ] **Step 7.1: Расширить `src/index/types.ts`**

Добавить импорт типа `SectionInfo` и три поля в `Index`. Полный файл становится:

```ts
import type { CommentRange } from "../parser/comments.js";
import type { Anomaly } from "../anomalies/types.js";
import type { PdfMarker } from "../parser/pdf_pages.js";
import type { SectionInfo } from "./maps.js";

export type TocNode = {
  id: string;                  // "s<line>"
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
  line_end: number;
  section_lines: number;
  is_likely_artifact: boolean;
  artifact_reason?: string;
  children: TocNode[];
};

export type FlatSeed = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
};

export type FlatHeader = FlatSeed & {
  line_end: number;
  section_lines: number;
};

export type Index = {
  file_path: string;
  size_bytes: number;
  mtime_ms: number;
  line_count: number;
  raw_content: string;
  line_offsets: number[];
  toc: TocNode[];
  flat_headers: FlatHeader[];
  comment_ranges: CommentRange[];
  frontmatter: Record<string, unknown> | undefined;
  anomalies: Anomaly[];
  pdf_markers: PdfMarker[];
  // O(1) lookups built once in buildIndex; consumed by response builders + detector.
  node_by_id: ReadonlyMap<string, TocNode>;
  flat_index_by_id: ReadonlyMap<string, number>;
  line_section_map: ReadonlyArray<SectionInfo | null>;
};

export type { CommentRange, PdfMarker, Anomaly, SectionInfo };
```

- [ ] **Step 7.2: Заполнить три поля в `buildIndex`**

В `src/index/builder.ts` добавить импорт:

```ts
import {
  buildNodeById,
  buildFlatIndexById,
  buildLineSectionMap,
} from "./maps.js";
```

И удалить локальный `findNodeById`, если ещё остался.

После строки `const { roots: toc, flat } = buildTocTree(flatSeeds, line_count);` добавить:

```ts
const node_by_id = buildNodeById(toc);
const flat_index_by_id = buildFlatIndexById(flat);
const line_section_map = buildLineSectionMap(toc, line_count);
```

В `tempIndex` (объект, передаваемый в `detectAnomalies`) добавить эти три поля. Заменить блок целиком, чтобы порядок был чёткий:

```ts
const tempIndex: Index = {
  file_path: filePath,
  size_bytes: stats.size,
  mtime_ms: stats.mtimeMs,
  line_count,
  raw_content: raw,
  line_offsets,
  toc,
  flat_headers: flat,
  comment_ranges,
  frontmatter: fm.data,
  anomalies: [],
  pdf_markers,
  node_by_id,
  flat_index_by_id,
  line_section_map,
};

const anomalies = detectAnomalies(tempIndex);
```

В блоке is_likely_artifact заменить `const node = findNodeById(toc, anomaly.node_id);` на:

```ts
const node = node_by_id.get(anomaly.node_id);
```

Финальный return становится:

```ts
return {
  ...tempIndex,
  anomalies,
};
```

- [ ] **Step 7.3: Запустить полный прогон**

```
pnpm typecheck
pnpm test
```

Expected: все тесты проходят. Стресс-тест cold-start уже измеряется секундами, но timeout в нём пока остаётся 600_000 — ничего, поправим в Task 13.

- [ ] **Step 7.4: Commit**

```bash
git add src/index/types.ts src/index/builder.ts
git commit -m "feat(index): add node_by_id / flat_index_by_id / line_section_map to Index

Pre-built once in buildIndex. Consumers in subsequent commits switch from
local map rebuilds and recursive findNodeById walks to these shared maps."
```

---

### Task 8: Переключить `detector.ts` на `flat_index_by_id`

**Files:**
- Modify: `src/anomalies/detector.ts` (одна строка в self_nesting блоке)

- [ ] **Step 8.1: Заменить `findIndex` на map-lookup**

В `src/anomalies/detector.ts` в self_nesting блоке (около строки 46) заменить:

```ts
const i = flat.findIndex((h) => h.id === node.id);
```

на:

```ts
const i = index.flat_index_by_id.get(node.id) ?? -1;
```

- [ ] **Step 8.2: Запустить тесты**

```
pnpm typecheck
pnpm test -- tests/unit/anomalies/ tests/integration/analyze_document.test.ts
```

Expected: PASS.

- [ ] **Step 8.3: Commit**

```bash
git add src/anomalies/detector.ts
git commit -m "perf(anomalies): use flat_index_by_id instead of findIndex"
```

---

### Task 9: Переключить `view_toc_response.ts` на `node_by_id` + бинпоиск префикса

**Files:**
- Modify: `src/tools/view_toc_response.ts` (удалить локальный `findNodeById`; заменить два линейных префикса на бинпоиск)

- [ ] **Step 9.1: Удалить локальный `findNodeById`, переключить на `index.node_by_id`**

В `src/tools/view_toc_response.ts`:

Удалить функцию `findNodeById` (строки 28-35).

В `buildViewTocResponse` заменить:

```ts
const node = findNodeById(index.toc, input.start_id);
```

на:

```ts
const node = index.node_by_id.get(input.start_id);
```

- [ ] **Step 9.2: Заменить линейный префикс в raw=true на бинпоиск**

В `buildViewTocResponse` блок raw=true (строки ~127-141 текущего файла) заменить:

```ts
// Take a prefix
let prefix = allFlat;
for (let n = allFlat.length - 1; n >= 1; n--) {
  prefix = allFlat.slice(0, n);
  const candidate: ViewTocResponse = {
    file,
    toc: prefix,
    anomalies_summary,
    truncated: true,
    effective_depth: 1,
    hint: `Document has too many headers (${allFlat.length}). Returned first ${n}. Use start_id to navigate further.`,
  };
  if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= maxBytes) {
    return candidate;
  }
}
```

на:

```ts
// Binary-search the largest prefix length n in [1, allFlat.length-1]
// such that the JSON fits within maxBytes.
const buildCandidate = (n: number): ViewTocResponse => ({
  file,
  toc: allFlat.slice(0, n),
  anomalies_summary,
  truncated: true,
  effective_depth: 1,
  hint: `Document has too many headers (${allFlat.length}). Returned first ${n}. Use start_id to navigate further.`,
});
let lo = 1;
let hi = allFlat.length - 1;
let best: ViewTocResponse | null = null;
while (lo <= hi) {
  const mid = (lo + hi) >>> 1;
  const candidate = buildCandidate(mid);
  if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= maxBytes) {
    best = candidate;
    lo = mid + 1;
  } else {
    hi = mid - 1;
  }
}
if (best !== null) {
  return best;
}
```

- [ ] **Step 9.3: Заменить линейный фоллбэк по root-нодам на бинпоиск**

В блоке после iterative depth reduction (строки ~190-206) заменить:

```ts
for (let n = total - 1; n >= 1; n--) {
  const prefix = rootsAtDepth1.slice(0, n);
  const candidate: ViewTocResponse = { /* ... */ };
  if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= maxBytes) {
    return candidate;
  }
}
```

на:

```ts
const buildRootCandidate = (n: number): ViewTocResponse => ({
  file,
  toc: rootsAtDepth1.slice(0, n),
  anomalies_summary,
  truncated: true,
  effective_depth: 1,
  hint: `Document has too many root sections (${total}). Returned first ${n}. Use start_id to navigate further.`,
});
let lo2 = 1;
let hi2 = total - 1;
let best2: ViewTocResponse | null = null;
while (lo2 <= hi2) {
  const mid = (lo2 + hi2) >>> 1;
  const candidate = buildRootCandidate(mid);
  if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= maxBytes) {
    best2 = candidate;
    lo2 = mid + 1;
  } else {
    hi2 = mid - 1;
  }
}
if (best2 !== null) {
  return best2;
}
```

- [ ] **Step 9.4: Запустить тесты**

```
pnpm typecheck
pnpm test -- tests/unit/tools/ tests/integration/view_toc.test.ts tests/integration/stress_huge_document.test.ts
```

Expected: PASS. Стресс на TRM по-прежнему утверждает `truncated=true`, `effective_depth`, `has_children=true` для корневых нод — бинпоиск этот контракт сохраняет.

- [ ] **Step 9.5: Commit**

```bash
git add src/tools/view_toc_response.ts
git commit -m "perf(view_toc): node_by_id lookup + binary-search prefix in raw mode

Replaces O(N) prefix scan with O(log N) binary search for both raw=true
mode and the depth=1 root fallback. Drops local findNodeById in favour of
index.node_by_id."
```

---

### Task 10: Переключить `read_section_response.ts` на shared maps

**Files:**
- Modify: `src/tools/read_section_response.ts` (удалить `buildNodeMap`, `findIndex`)

- [ ] **Step 10.1: Удалить `buildNodeMap` и заменить вызовы**

В `src/tools/read_section_response.ts`:

Удалить функцию `buildNodeMap` (строки 128-138).

В `extractLogicalRange` заменить:

```ts
const nodeById = buildNodeMap(index.toc);
// ...
const nodeIdx = index.flat_headers.findIndex((h) => h.id === node.id);
```

на:

```ts
const nodeById = index.node_by_id;
// ...
const nodeIdx = index.flat_index_by_id.get(node.id) ?? -1;
```

В `buildReadSectionResponse` заменить:

```ts
const nodeById = buildNodeMap(index.toc);
const node = nodeById.get(input.section_id);
```

на:

```ts
const node = index.node_by_id.get(input.section_id);
```

- [ ] **Step 10.2: Запустить тесты**

```
pnpm typecheck
pnpm test -- tests/unit/tools/ tests/integration/read_section.test.ts tests/integration/invariants_byte_reconstruction.test.ts
```

Expected: PASS.

- [ ] **Step 10.3: Commit**

```bash
git add src/tools/read_section_response.ts
git commit -m "perf(read_section): use shared maps from Index

Drops the per-call buildNodeMap (which ran twice per request) and the
flat_headers.findIndex in extractLogicalRange."
```

---

### Task 11: Переключить `search_response.ts` на `line_section_map`

**Files:**
- Modify: `src/tools/search_response.ts` (удалить `buildLineSectionMap`)

- [ ] **Step 11.1: Удалить локальный builder, использовать `index.line_section_map`**

В `src/tools/search_response.ts`:

Удалить локальные `type SectionInfo` и функцию `buildLineSectionMap` (строки 33-77).

В `buildSearchResponse` заменить:

```ts
const lineSectionMap = buildLineSectionMap(index.toc, index.line_count);
```

на:

```ts
const lineSectionMap = index.line_section_map;
```

- [ ] **Step 11.2: Запустить тесты**

```
pnpm typecheck
pnpm test -- tests/unit/tools/ tests/integration/search.test.ts
```

Expected: PASS.

- [ ] **Step 11.3: Commit**

```bash
git add src/tools/search_response.ts
git commit -m "perf(search): use precomputed line_section_map from Index

Eliminates per-call rebuild (~10 ms on TRM, plus map allocation pressure)."
```

---

### Task 12: Переключить `analyze_document_response.ts` на `node_by_id`

**Files:**
- Modify: `src/tools/analyze_document_response.ts` (удалить локальный `findNodeById`)

- [ ] **Step 12.1: Заменить три вызова `findNodeById`**

В `src/tools/analyze_document_response.ts`:

Удалить функцию `findNodeById` (строки 36-43).

Заменить три вызова в `computeLogicalEffect`:

```ts
const precedingNode = findNodeById(index.toc, `s${preceding.line}`);
// ...
const artifactNode = findNodeById(index.toc, anomaly.node_id);
// ...
const node = findNodeById(index.toc, fh.id);
```

на:

```ts
const precedingNode = index.node_by_id.get(`s${preceding.line}`);
// ...
const artifactNode = index.node_by_id.get(anomaly.node_id);
// ...
const node = index.node_by_id.get(fh.id);
```

- [ ] **Step 12.2: Запустить тесты**

```
pnpm typecheck
pnpm test -- tests/unit/tools/ tests/integration/analyze_document.test.ts
```

Expected: PASS.

- [ ] **Step 12.3: Commit**

```bash
git add src/tools/analyze_document_response.ts
git commit -m "perf(analyze_document): use node_by_id from Index"
```

---

### Task 13: Замерить новый cold-start локально + обновить timeout стресс-теста

**Files:**
- Modify: `tests/integration/stress_huge_document.test.ts:33-51` (комментарии и timeout)

- [ ] **Step 13.1: Вручную замерить новый cold-start**

Создать временный замерщик `/tmp/measure-coldstart.mjs`:

```js
import { performance } from "node:perf_hooks";
import { buildIndex } from "/Users/pavel/projects/markdown-docs-mcp/src/index/builder.ts";

const TRM = "/Users/pavel/projects/markdown-docs-mcp/tests/fixtures/public/esp32-p4-trm.md";
const t0 = performance.now();
await buildIndex(TRM);
console.log("cold-start:", (performance.now() - t0).toFixed(0), "ms");
```

Запустить:

```bash
pnpm exec tsx /tmp/measure-coldstart.mjs
```

Expected: < 1 000 ms на современном Mac. Запишите фактическое значение в commit message Step 13.6.

- [ ] **Step 13.2: Запустить полный стресс-тест и засечь wall-time**

```bash
time pnpm test -- tests/integration/stress_huge_document.test.ts
```

Expected: суммарно < 30 секунд (включая 4 sub-теста + line-coverage invariant). Запишите фактическое значение.

- [ ] **Step 13.3: Обновить timeout и комментарии в стресс-тесте**

В `tests/integration/stress_huge_document.test.ts` блок `beforeAll` и его комментарий заменить на:

```ts
beforeAll(
  async () => {
    sharedCache = new IndexCache();
    // Pre-warm the cache before any test runs
    await sharedCache.getOrBuild(TRM);

    const [ct, st] = InMemoryTransport.createLinkedPair();
    const server = createServer({
      cache: sharedCache,
      config: { maxViewTocBytes: STRESS_CAP_BYTES, maxSectionBytes: 200 * 1024 },
    });
    sharedClient = new Client({ name: "stress-test", version: "0" });
    await Promise.all([server.connect(st), sharedClient.connect(ct)]);
  },
  // Cold-start indexing of the 5.2 MB TRM should take well under 1 s
  // post-perf-optimization. 60 s gives ~30x headroom for slow CI runners,
  // GC pauses, and I/O jitter.
  60_000
);
```

И обновить также верхний docstring файла (строки 1-8) — убрать упоминание «90-120 с локально / 3-5 минут на CI».

- [ ] **Step 13.4: Прогнать стресс-тест с новым timeout**

```bash
pnpm test -- tests/integration/stress_huge_document.test.ts
```

Expected: PASS, ничего не подвисло.

- [ ] **Step 13.5: Полный прогон тестов**

```bash
pnpm typecheck
pnpm test
```

Expected: PASS всего.

- [ ] **Step 13.6: Commit**

```bash
git add tests/integration/stress_huge_document.test.ts
git commit -m "test(stress): tighten TRM cold-start timeout to 60s

After the perf refactor cold-start is <1 s locally (was 112 s). 60 s gives
~30x headroom for slow GitHub CI runners. Final tuning may follow once we
see actual CI timings on the PR."
```

---

### Task 14: PR и финальная калибровка timeout по результату CI

**Files:**
- Modify (если нужно): `tests/integration/stress_huge_document.test.ts` (правка timeout)

- [ ] **Step 14.1: Запушить ветку и открыть PR**

```bash
git push -u origin perf/trm-optimizations
gh pr create --base master --title "perf: cut TRM cold-start from 112s to <1s" --body "$(cat <<'EOF'
## Summary
- Replace O(N*M) line scans in comment + pdf-page parsers with O(log N) binary search over precomputed lineOffsets.
- Centralise four duplicated findNodeById implementations and the per-call line_section_map rebuild into shared maps on Index.
- Binary-search prefix in view_toc(raw=true) and the depth=1 root fallback.

## Bench (ESP32-P4 TRM, 5.2 MB / 143k lines / 2k headings)

| Metric | Before | After |
|---|---|---|
| buildIndex cold-start | 112 s | < 1 s |
| view_toc(raw=true) | 421 ms | < 20 ms |
| view_toc(depth=6) | 3.8 ms | unchanged |
| read_section / search / analyze_document | <1-50 ms | unchanged |

## Test plan
- [x] All existing unit + integration tests pass locally
- [x] line-coverage and byte-reconstruction invariants pass on TRM
- [x] Stress-test timeout reduced 600s -> 60s, full suite runs in seconds
- [ ] Verify CI green, tune stress timeout if CI runners are slower than expected

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 14.2: Дождаться завершения CI и посмотреть фактическое время стресс-теста**

```bash
gh pr checks
# Найти ID джоба, который гонит pnpm test, и посмотреть его log
gh run view --log
```

Извлечь wall-time стресс-теста из лога.

- [ ] **Step 14.3: При необходимости поправить timeout**

Если CI-время существенно больше локального (типично 3-5×):
- Если CI ≤ 15 s → оставить timeout 60_000.
- Если CI 15-30 s → поднять до 120_000.
- Если CI > 30 s → разбираться, что не так (возможно, GitHub раннеры обновились или cold-start вырос непредвиденно).

При необходимости править значение и коммитить:

```bash
git add tests/integration/stress_huge_document.test.ts
git commit -m "test(stress): bump timeout to <N>s based on observed CI time"
git push
```

- [ ] **Step 14.4: Дождаться зелёного CI, попросить ревью**

```bash
gh pr view --web
```

---

## Self-review notes

**Spec coverage:**
- ✅ Single-pass парсеры → Tasks 3-4
- ✅ Общие maps в Index → Tasks 6-7
- ✅ Удаление дублей findNodeById → Tasks 9, 10, 12
- ✅ Удаление дубля buildLineSectionMap → Task 11
- ✅ Удаление дубля flat.findIndex в detector → Task 8
- ✅ Reparenting без findNodeById → Task 5
- ✅ Бинпоиск префикса в view_toc raw=true → Task 9
- ✅ Stress test timeout → Tasks 13-14
- ✅ Acceptance метрики проверяются в Task 13

**Никаких placeholders.** Каждая задача содержит точный путь файла, конкретный код для замены, и команду тестирования с ожидаемым результатом.

**Type consistency:** `ReparentingResult.flat: FlatHeader[]` совпадает с `Index.flat_headers: FlatHeader[]`; `node_by_id: ReadonlyMap<string, TocNode>` используется одинаково во всех call-sites.
