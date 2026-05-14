# PR-03: Parser + indexing core — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать инфраструктуру парсинга markdown и построения индекса: parser-модули для headings/comments/frontmatter/numbering и indexing-модули для построения TOC-дерева через reparenting и LRU-кэширования с инвалидацией по mtime+size. Tools всё ещё возвращают `not_implemented` — реальная имплементация tool'ов в PR-04+.

**Architecture:**
- `src/parser/` — чистые функции преобразования `string -> structured data`. Каждый модуль независим.
- `src/index/` — стейт-зависимая часть: построение `Index` из файла, кэш с инвалидацией.
- Unit-тесты на inline-фикстурах для каждого модуля. Никаких изменений в `src/server.ts`, `src/tools/*`, `src/index.ts`.

**Tech Stack:** markdown-it 14.1, @types/markdown-it 14.1, gray-matter 4.0, lru-cache 11.3 (новые deps).

**Реализация PR-03 из spec'а** [docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md](../specs/2026-05-14-markdown-docs-mcp-design.md), раздел 15. Структура индекса — spec раздел 7.2.

**Ветка:** `pr-03-parser-indexing` от `dev`.

---

## Файлы

**Создать (8 source + 7 unit-тестов):**
- `src/parser/markdown.ts` — `extractHeadings(content)` через markdown-it токены
- `src/parser/comments.ts` — `findCommentRanges(content)` — HTML-комментарии (включая многострочные)
- `src/parser/frontmatter.ts` — `parseFrontmatter(content)` через gray-matter
- `src/parser/numbering.ts` — `extractNumbering(title)` regex'ом
- `src/index/types.ts` — типы `TocNode`, `FlatHeader`, `Index`, `CommentRange`
- `src/index/reparenting.ts` — `buildTocTree(headers, totalLines)` с reparenting'ом и вычислением line_end
- `src/index/builder.ts` — `buildIndex(filePath)` — async факт-фабрика `Index`
- `src/index/cache.ts` — `IndexCache` класс на lru-cache@11
- `tests/unit/parser/markdown.test.ts`
- `tests/unit/parser/comments.test.ts`
- `tests/unit/parser/frontmatter.test.ts`
- `tests/unit/parser/numbering.test.ts`
- `tests/unit/index/reparenting.test.ts`
- `tests/unit/index/builder.test.ts`
- `tests/unit/index/cache.test.ts`

**Модифицировать:**
- `package.json` — добавить `markdown-it@14.1.1`, `gray-matter@4.0.3`, `lru-cache@11.3.6` (runtime), `@types/markdown-it@14.1.2` (dev)
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` — tick PR-03 checkbox

**НЕ модифицировать в этом PR:**
- `src/server.ts`, `src/tools/*`, `src/index.ts` — tools остаются stub'ами.
- `src/schemas/` — schemas не меняются.

---

## Контракты модулей

### `src/parser/markdown.ts`

```typescript
export type ParsedHeading = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;     // plain text, без # и без inline markdown (** _ ` [])
  line: number;      // 1-based
};

export function extractHeadings(content: string): ParsedHeading[];
```

Через markdown-it токены `heading_open` / `inline` / `heading_close`. Из inline берём plain text (content/children с типом `text` склеиваем). Headings внутри code-block'ов markdown-it уже не парсит — это бесплатное преимущество.

### `src/parser/comments.ts`

```typescript
export type CommentRange = {
  start_line: number;  // 1-based, inclusive — строка с `<!--`
  end_line: number;    // 1-based, inclusive — строка с `-->`
};

export function findCommentRanges(content: string): CommentRange[];
```

Используем глобальный regex `/<!--[\s\S]*?-->/g` (нежадный). Внутри code-block'ов (fenced ``` или indented 4-space) — пропускаем. Простейший подход для MVP: использовать markdown-it токены и игнорировать содержимое code-блоков; либо предварительно вырезать code-блоки маркерами и потом мапить обратно. Конкретное решение — на усмотрение разработчика, главное чтобы тест на «комментарий внутри code-block НЕ распознавался» проходил.

### `src/parser/frontmatter.ts`

```typescript
export type FrontmatterResult = {
  data: Record<string, unknown> | undefined;
  body: string;
  body_start_line: number;   // 1-based строка где начинается тело (после `---` блока)
};

export function parseFrontmatter(content: string): FrontmatterResult;
```

Через gray-matter. Если `---` блок не в начале файла или невалидный YAML — возвращаем `{ data: undefined, body: content, body_start_line: 1 }` (не падаем). На malformed YAML — тоже graceful (gray-matter может бросать, нужно ловить).

### `src/parser/numbering.ts`

```typescript
export function extractNumbering(title: string): string | null;
```

Порядок проверки (первое совпадение):
1. `/^Annex\s+([A-Z](\.\d+)*)\s+/` → группа 1 (e.g. `"A.1"`)
2. `/^(\d+(\.\d+)*)\s+/` → группа 1 (e.g. `"4.1.1.2"`, `"1"`)
3. `/^([A-Z]+(\.\d+)*)\s+/` → группа 1 (e.g. `"A.1"`, `"AB"`)
4. иначе → `null`

### `src/index/types.ts`

```typescript
import type { CommentRange } from "../parser/comments.js";

export type TocNode = {
  id: string;                  // "s<line>"
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
  line_end: number;
  section_lines: number;
  is_likely_artifact: false;   // в PR-03 всегда false; реальный флаг — в PR-04
  children: TocNode[];
};

export type FlatHeader = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
};

export type Index = {
  file_path: string;
  size_bytes: number;
  mtime_ms: number;
  line_count: number;
  raw_content: string;
  line_offsets: number[];     // line (1-based) -> char offset; lineOffsets[i-1] = старт строки i
  toc: TocNode[];             // root nodes
  flat_headers: FlatHeader[];
  comment_ranges: CommentRange[];
  frontmatter: Record<string, unknown> | undefined;
};

export type { CommentRange };
```

### `src/index/reparenting.ts`

```typescript
import type { FlatHeader, TocNode } from "./types.js";

export function buildTocTree(headers: FlatHeader[], totalLines: number): TocNode[];
```

Алгоритм:
- Стек открытых предков (всегда отсортирован по level возрастающе).
- Для каждого header'а: pop со стека всех с `level >= current.level`.
- Если стек пуст — current root; иначе — child от top.
- Push current на стек.
- После прохода: вычислить `line_end` каждого node — это `(next.line - 1)` следующего header'а с `level <= current.level` (sibling или предок), или `totalLines` если такого нет.
- Корректно вычислить `section_lines = line_end - line + 1`.
- `is_likely_artifact: false`, `numbering` — копируем из FlatHeader.

### `src/index/builder.ts`

```typescript
import type { Index } from "./types.js";

export async function buildIndex(filePath: string): Promise<Index>;
```

Шаги:
1. `stat(filePath)` → size + mtimeMs.
2. `readFile(filePath, "utf8")` → strip BOM (`﻿` в начале если есть).
3. `parseFrontmatter(content)` → `{ data, body, body_start_line }`.
4. `extractHeadings(body)` → `ParsedHeading[]` (с line относительно body).
5. Сдвинуть line на `(body_start_line - 1)` чтобы получить absolute lines в исходном файле.
6. Для каждого heading'а: `extractNumbering(title)`.
7. Сформировать `FlatHeader[]` (с `id = "s" + line`).
8. `findCommentRanges(content)` (на полном content, не body — комментарии могут быть и во frontmatter блоке, хотя редко).
9. `buildTocTree(flat, lineCount)`.
10. Compute `line_offsets`: `lineOffsets[0] = 0`, далее ищем позиции `\n` в content.
11. Compute `line_count` — `lineOffsets.length`.
12. Возвращаем Index.

Errors:
- `ENOENT` / другие fs-ошибки бросаются дальше — caller (cache) их ловит.

### `src/index/cache.ts`

```typescript
import type { Index } from "./types.js";

export class IndexCache {
  constructor(maxSize?: number);    // default 10
  async getOrBuild(filePath: string): Promise<Index>;
  invalidate(filePath: string): void;
  clear(): void;
}
```

Использует `lru-cache@11`. Ключ кэша — canonical absolute path (`path.resolve` + `fs.realpath` опционально). Инвалидация:
- Перед возвратом cached: `stat(filePath)`; если `(size, mtime)` не совпадают с cached entry → rebuild.
- Если файла нет — throw, не возвращать stale.

---

## Задачи

### Task 1: Установить зависимости

- [ ] **Step 1.1: pnpm add**

Run:
```bash
pnpm add markdown-it@14.1.1 gray-matter@4.0.3 lru-cache@11.3.6
pnpm add -D @types/markdown-it@14.1.2
```

- [ ] **Step 1.2: Typecheck baseline**

Run: `pnpm typecheck` → exit 0 (на текущем коде).

---

### Task 2: parser/numbering.ts

**Files:**
- Create: `src/parser/numbering.ts`
- Create: `tests/unit/parser/numbering.test.ts`

- [ ] **Step 2.1: TDD test cases**

```typescript
// tests/unit/parser/numbering.test.ts
import { describe, it, expect } from "vitest";
import { extractNumbering } from "../../../src/parser/numbering.js";

describe("extractNumbering", () => {
  it("returns numeric prefix", () => {
    expect(extractNumbering("1 Scope")).toBe("1");
    expect(extractNumbering("4.1 System")).toBe("4.1");
    expect(extractNumbering("4.1.1.2 RISC-V Trace Encoder (TRACE)")).toBe(
      "4.1.1.2"
    );
  });

  it("returns alphabetical prefix", () => {
    expect(extractNumbering("A Foo")).toBe("A");
    expect(extractNumbering("AB Notes")).toBe("AB");
  });

  it("returns Annex prefix as letter.digits", () => {
    expect(extractNumbering("Annex A Examples")).toBe("A");
    expect(extractNumbering("Annex A.1 Examples")).toBe("A.1");
    expect(extractNumbering("Annex B.2.3 Detail")).toBe("B.2.3");
  });

  it("returns null when no recognizable numbering", () => {
    expect(extractNumbering("FOREWORD")).toBeNull();
    expect(extractNumbering("Introduction")).toBeNull();
    expect(extractNumbering("Note")).toBeNull();
    expect(extractNumbering("Getting Started")).toBeNull();
  });

  it("ignores trailing context inside title", () => {
    expect(extractNumbering("3.1.4 примечание (см. 2.1)")).toBe("3.1.4");
  });

  it("requires whitespace after numbering", () => {
    expect(extractNumbering("1Scope")).toBeNull();
    expect(extractNumbering("4.1System")).toBeNull();
  });
});
```

- [ ] **Step 2.2: Run failing test**

Run: `pnpm test tests/unit/parser/numbering.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 2.3: Implement**

```typescript
// src/parser/numbering.ts
const ANNEX_RE = /^Annex\s+([A-Z](?:\.\d+)*)\s+/;
const NUMERIC_RE = /^(\d+(?:\.\d+)*)\s+/;
const ALPHA_RE = /^([A-Z]+(?:\.\d+)*)\s+/;

export function extractNumbering(title: string): string | null {
  const annexMatch = ANNEX_RE.exec(title);
  if (annexMatch) {
    return annexMatch[1] ?? null;
  }
  const numericMatch = NUMERIC_RE.exec(title);
  if (numericMatch) {
    return numericMatch[1] ?? null;
  }
  const alphaMatch = ALPHA_RE.exec(title);
  if (alphaMatch) {
    return alphaMatch[1] ?? null;
  }
  return null;
}
```

- [ ] **Step 2.4: Run passing test**

Run: `pnpm test tests/unit/parser/numbering.test.ts`
Expected: PASS.

---

### Task 3: parser/markdown.ts

**Files:**
- Create: `src/parser/markdown.ts`
- Create: `tests/unit/parser/markdown.test.ts`

- [ ] **Step 3.1: TDD test cases**

```typescript
// tests/unit/parser/markdown.test.ts
import { describe, it, expect } from "vitest";
import { extractHeadings } from "../../../src/parser/markdown.js";

describe("extractHeadings", () => {
  it("extracts simple ATX headings with levels and lines", () => {
    const md = "# H1\n\n## H2\n\n### H3\n";
    const result = extractHeadings(md);
    expect(result).toEqual([
      { level: 1, title: "H1", line: 1 },
      { level: 2, title: "H2", line: 3 },
      { level: 3, title: "H3", line: 5 },
    ]);
  });

  it("supports levels 1-6", () => {
    const md = "# 1\n## 2\n### 3\n#### 4\n##### 5\n###### 6\n";
    expect(extractHeadings(md).map((h) => h.level)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("strips inline markdown from titles", () => {
    const md = "# **Important**: Setup\n\n## Code: `x`\n\n### Link: [text](url)\n";
    expect(extractHeadings(md).map((h) => h.title)).toEqual([
      "Important: Setup",
      "Code: x",
      "Link: text",
    ]);
  });

  it("preserves unicode titles literally", () => {
    const md = "## 4.1 RISC-V Trace Encoder (TRACE)\n\n## Введение\n";
    const result = extractHeadings(md);
    expect(result[0]?.title).toBe("4.1 RISC-V Trace Encoder (TRACE)");
    expect(result[1]?.title).toBe("Введение");
  });

  it("ignores hash-like lines inside fenced code blocks", () => {
    const md = "# real\n\n```\n# not a heading\n```\n\n## real2\n";
    const result = extractHeadings(md);
    expect(result.map((h) => h.title)).toEqual(["real", "real2"]);
  });

  it("returns empty array for content with no headings", () => {
    expect(extractHeadings("just text\nmore text\n")).toEqual([]);
  });
});
```

- [ ] **Step 3.2: Run failing test**

Run: `pnpm test tests/unit/parser/markdown.test.ts` → FAIL.

- [ ] **Step 3.3: Implement**

```typescript
// src/parser/markdown.ts
import MarkdownIt from "markdown-it";

export type ParsedHeading = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  line: number;
};

const md = new MarkdownIt({ html: true });

function extractPlainText(inline: { children?: { type: string; content: string; children?: unknown }[] }): string {
  if (!inline.children) return "";
  let result = "";
  for (const child of inline.children) {
    if (child.type === "text") {
      result += child.content;
    } else if (child.type === "code_inline") {
      result += child.content;
    } else if (Array.isArray((child as { children?: unknown[] }).children)) {
      // Recurse into link_open/em_open/strong_open style wrappers
      result += extractPlainText(child as Parameters<typeof extractPlainText>[0]);
    }
  }
  return result;
}

export function extractHeadings(content: string): ParsedHeading[] {
  const tokens = md.parse(content, {});
  const result: ParsedHeading[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok || tok.type !== "heading_open") continue;
    const levelDigit = Number(tok.tag.slice(1)); // h1 -> 1
    if (!Number.isInteger(levelDigit) || levelDigit < 1 || levelDigit > 6) continue;
    const line = (tok.map?.[0] ?? 0) + 1;
    const inline = tokens[i + 1];
    const title = inline && inline.type === "inline" ? extractPlainText(inline as never) : "";
    result.push({
      level: levelDigit as 1 | 2 | 3 | 4 | 5 | 6,
      title: title.trim(),
      line,
    });
  }
  return result;
}
```

- [ ] **Step 3.4: Run tests**

Run: `pnpm test tests/unit/parser/markdown.test.ts` → PASS.

---

### Task 4: parser/comments.ts

**Files:**
- Create: `src/parser/comments.ts`
- Create: `tests/unit/parser/comments.test.ts`

- [ ] **Step 4.1: TDD test cases**

```typescript
// tests/unit/parser/comments.test.ts
import { describe, it, expect } from "vitest";
import { findCommentRanges } from "../../../src/parser/comments.js";

describe("findCommentRanges", () => {
  it("detects single-line comment", () => {
    const md = "line 1\n<!-- a comment -->\nline 3\n";
    expect(findCommentRanges(md)).toEqual([{ start_line: 2, end_line: 2 }]);
  });

  it("detects multi-line comment", () => {
    const md = "line 1\n<!--\n  some\n  text\n-->\nline 6\n";
    expect(findCommentRanges(md)).toEqual([{ start_line: 2, end_line: 5 }]);
  });

  it("detects multiple comments", () => {
    const md = "line 1\n<!-- a -->\nline 3\n<!-- b -->\nline 5\n";
    expect(findCommentRanges(md)).toEqual([
      { start_line: 2, end_line: 2 },
      { start_line: 4, end_line: 4 },
    ]);
  });

  it("ignores HTML-comment-looking text inside fenced code blocks", () => {
    const md = "# real\n```\n<!-- not a real comment -->\n```\n<!-- real comment -->\n";
    const ranges = findCommentRanges(md);
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toEqual({ start_line: 5, end_line: 5 });
  });

  it("returns empty array for content without comments", () => {
    expect(findCommentRanges("just text\n# heading\n")).toEqual([]);
  });

  it("handles PDF page markers (multiple, consecutive)", () => {
    const md =
      "<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\n## Heading\n";
    expect(findCommentRanges(md)).toEqual([
      { start_line: 1, end_line: 1 },
      { start_line: 3, end_line: 3 },
    ]);
  });
});
```

- [ ] **Step 4.2: Run failing test** → FAIL.

- [ ] **Step 4.3: Implement**

Подсказка для имплементации: использовать markdown-it токены для выявления code-блоков (тип `fence` / `code_block`), их диапазоны — `map`. Затем регекс `/<!--[\s\S]*?-->/g` на полном content, для каждого матча вычисляем `start_line` и `end_line` через подсчёт `\n` до match.index; отфильтровываем те матчи, чьи строки целиком внутри code-блока.

```typescript
// src/parser/comments.ts
import MarkdownIt from "markdown-it";

export type CommentRange = {
  start_line: number;
  end_line: number;
};

const md = new MarkdownIt({ html: true });

function lineOfOffset(content: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset; i++) {
    if (content.charCodeAt(i) === 10 /* \n */) line++;
  }
  return line;
}

function getCodeBlockRanges(content: string): Array<{ start: number; end: number }> {
  const tokens = md.parse(content, {});
  const ranges: Array<{ start: number; end: number }> = [];
  for (const tok of tokens) {
    if ((tok.type === "fence" || tok.type === "code_block") && tok.map) {
      ranges.push({ start: tok.map[0] + 1, end: tok.map[1] }); // map[1] is exclusive end → it's last line + 1
    }
  }
  return ranges;
}

export function findCommentRanges(content: string): CommentRange[] {
  const codeRanges = getCodeBlockRanges(content);
  const re = /<!--[\s\S]*?-->/g;
  const result: CommentRange[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const start_line = lineOfOffset(content, match.index);
    const end_line = lineOfOffset(content, match.index + match[0].length - 1);
    const insideCode = codeRanges.some(
      (cr) => start_line >= cr.start && end_line < cr.end + 1
    );
    if (!insideCode) {
      result.push({ start_line, end_line });
    }
  }
  return result;
}
```

- [ ] **Step 4.4: Run tests** → PASS.

---

### Task 5: parser/frontmatter.ts

**Files:**
- Create: `src/parser/frontmatter.ts`
- Create: `tests/unit/parser/frontmatter.test.ts`

- [ ] **Step 5.1: TDD test cases**

```typescript
// tests/unit/parser/frontmatter.test.ts
import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "../../../src/parser/frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses YAML frontmatter", () => {
    const md = "---\ntitle: Foo\nversion: 1\n---\n\n# Body\n";
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({ title: "Foo", version: 1 });
    expect(result.body).toBe("\n# Body\n");
    expect(result.body_start_line).toBe(5);
  });

  it("returns undefined data and full content when no frontmatter", () => {
    const md = "# Heading\nbody\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });

  it("does not interpret mid-document `---` as frontmatter", () => {
    const md = "# Heading\n\n---\n\nNext section\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });

  it("returns gracefully on malformed YAML", () => {
    const md = "---\nthis: is: malformed: : :\n---\n# Body\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });
});
```

- [ ] **Step 5.2: Run failing test** → FAIL.

- [ ] **Step 5.3: Implement**

```typescript
// src/parser/frontmatter.ts
import matter from "gray-matter";

export type FrontmatterResult = {
  data: Record<string, unknown> | undefined;
  body: string;
  body_start_line: number;
};

export function parseFrontmatter(content: string): FrontmatterResult {
  if (!content.startsWith("---")) {
    return { data: undefined, body: content, body_start_line: 1 };
  }
  try {
    const parsed = matter(content);
    const dataKeys = Object.keys(parsed.data ?? {});
    if (dataKeys.length === 0) {
      // gray-matter может вернуть пустой data — считаем что frontmatter нет
      return { data: undefined, body: content, body_start_line: 1 };
    }
    const consumed = content.length - parsed.content.length;
    const linesConsumed = content.slice(0, consumed).split("\n").length - 1;
    return {
      data: parsed.data as Record<string, unknown>,
      body: parsed.content,
      body_start_line: linesConsumed + 1,
    };
  } catch {
    return { data: undefined, body: content, body_start_line: 1 };
  }
}
```

- [ ] **Step 5.4: Run tests** → PASS.

---

### Task 6: index/types.ts

**Files:**
- Create: `src/index/types.ts`

- [ ] **Step 6.1: Создать файл типов**

Содержимое — точно как в разделе «Контракты модулей» выше. Файл только определяет типы, нет тестов отдельно (типы покрываются тестами builder и reparenting).

- [ ] **Step 6.2: Typecheck**

Run: `pnpm typecheck` → exit 0.

---

### Task 7: index/reparenting.ts

**Files:**
- Create: `src/index/reparenting.ts`
- Create: `tests/unit/index/reparenting.test.ts`

- [ ] **Step 7.1: TDD test cases**

```typescript
// tests/unit/index/reparenting.test.ts
import { describe, it, expect } from "vitest";
import { buildTocTree } from "../../../src/index/reparenting.js";
import type { FlatHeader } from "../../../src/index/types.js";

const mkFlat = (line: number, level: number, title: string): FlatHeader => ({
  id: `s${line}`,
  level: level as FlatHeader["level"],
  title,
  numbering: null,
  line,
});

describe("buildTocTree", () => {
  it("builds linear hierarchy h1 -> h2 -> h3", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(3, 2, "B"), mkFlat(5, 3, "C")];
    const tree = buildTocTree(flat, 10);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.title).toBe("A");
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.title).toBe("B");
    expect(tree[0]?.children[0]?.children[0]?.title).toBe("C");
  });

  it("reparents on level jump h1 -> h3 (h3 becomes child of h1, no gap)", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(3, 3, "C")];
    const tree = buildTocTree(flat, 10);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.title).toBe("C");
    expect(tree[0]?.children[0]?.level).toBe(3);
  });

  it("supports multiple root-level headers", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(5, 1, "B")];
    const tree = buildTocTree(flat, 10);
    expect(tree.map((n) => n.title)).toEqual(["A", "B"]);
    expect(tree[0]?.line_end).toBe(4);
    expect(tree[1]?.line_end).toBe(10);
  });

  it("closes deeper sections when level rises again", () => {
    const flat = [
      mkFlat(1, 1, "A"),
      mkFlat(3, 2, "B"),
      mkFlat(5, 3, "C"),
      mkFlat(7, 2, "D"),
    ];
    const tree = buildTocTree(flat, 10);
    expect(tree[0]?.children.map((n) => n.title)).toEqual(["B", "D"]);
    expect(tree[0]?.children[0]?.children[0]?.title).toBe("C");
  });

  it("computes line_end correctly for all nodes", () => {
    const flat = [
      mkFlat(1, 1, "A"),
      mkFlat(3, 2, "B"),
      mkFlat(10, 2, "C"),
      mkFlat(20, 1, "D"),
    ];
    const tree = buildTocTree(flat, 30);
    expect(tree[0]?.line_end).toBe(19); // A ends right before D
    expect(tree[0]?.children[0]?.line_end).toBe(9); // B ends right before C
    expect(tree[0]?.children[1]?.line_end).toBe(19); // C ends right before D
    expect(tree[1]?.line_end).toBe(30); // D ends at file end
  });

  it("sets section_lines = line_end - line + 1", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(11, 1, "B")];
    const tree = buildTocTree(flat, 20);
    expect(tree[0]?.section_lines).toBe(10);
    expect(tree[1]?.section_lines).toBe(10);
  });

  it("always sets is_likely_artifact=false in PR-03", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(3, 2, "A"), mkFlat(5, 2, "A")];
    const tree = buildTocTree(flat, 10);
    const allFalse = (nodes: typeof tree): boolean =>
      nodes.every((n) => n.is_likely_artifact === false && allFalse(n.children));
    expect(allFalse(tree)).toBe(true);
  });
});
```

- [ ] **Step 7.2: Run failing test** → FAIL.

- [ ] **Step 7.3: Implement**

```typescript
// src/index/reparenting.ts
import type { FlatHeader, TocNode } from "./types.js";

export function buildTocTree(headers: FlatHeader[], totalLines: number): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const h of headers) {
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
    while (stack.length > 0 && stack[stack.length - 1]!.level >= node.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1]!.children.push(node);
    }
    stack.push(node);
  }

  // Second pass: compute line_end. For each header at index i, the section ends
  // right before the next header with level <= h.level, or at totalLines.
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
    const node = findNodeById(roots, h.id);
    if (node) {
      node.line_end = endLine;
      node.section_lines = endLine - h.line + 1;
    }
  }

  return roots;
}

function findNodeById(nodes: TocNode[], id: string): TocNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNodeById(n.children, id);
    if (found) return found;
  }
  return undefined;
}
```

- [ ] **Step 7.4: Run tests** → PASS.

---

### Task 8: index/builder.ts

**Files:**
- Create: `src/index/builder.ts`
- Create: `tests/unit/index/builder.test.ts`

- [ ] **Step 8.1: TDD test cases**

Использовать `os.tmpdir()` + `node:fs/promises` для создания tmp файлов в каждом тесте.

```typescript
// tests/unit/index/builder.test.ts
import { describe, it, expect } from "vitest";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIndex } from "../../../src/index/builder.js";

async function withTmpFile(content: string, fn: (path: string) => Promise<void>) {
  const dir = await mkdtemp(join(tmpdir(), "md-docs-mcp-"));
  const file = join(dir, "doc.md");
  await writeFile(file, content, "utf8");
  try {
    await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("buildIndex", () => {
  it("builds Index from a simple markdown file", async () => {
    await withTmpFile("# H1\n\n## H2\nbody\n", async (path) => {
      const idx = await buildIndex(path);
      expect(idx.file_path).toBe(path);
      expect(idx.toc).toHaveLength(1);
      expect(idx.toc[0]?.title).toBe("H1");
      expect(idx.toc[0]?.children[0]?.title).toBe("H2");
      expect(idx.flat_headers).toHaveLength(2);
      expect(idx.line_count).toBe(5); // 4 lines + trailing
      expect(idx.frontmatter).toBeUndefined();
    });
  });

  it("strips BOM from content", async () => {
    await withTmpFile("﻿# Hello\n", async (path) => {
      const idx = await buildIndex(path);
      expect(idx.toc[0]?.title).toBe("Hello");
      expect(idx.raw_content.startsWith("﻿")).toBe(false);
    });
  });

  it("respects YAML frontmatter and adjusts heading line numbers", async () => {
    await withTmpFile(
      "---\ntitle: Foo\n---\n\n# Heading\nbody\n",
      async (path) => {
        const idx = await buildIndex(path);
        expect(idx.frontmatter).toEqual({ title: "Foo" });
        expect(idx.toc[0]?.line).toBe(5); // heading on line 5 of original file
      }
    );
  });

  it("records HTML comments in comment_ranges", async () => {
    await withTmpFile(
      "<!-- top -->\n# H\nbody\n<!-- bottom -->\n",
      async (path) => {
        const idx = await buildIndex(path);
        expect(idx.comment_ranges).toEqual([
          { start_line: 1, end_line: 1 },
          { start_line: 4, end_line: 4 },
        ]);
      }
    );
  });

  it("computes line_offsets for O(1) lookup", async () => {
    await withTmpFile("aa\nbb\nccc\n", async (path) => {
      const idx = await buildIndex(path);
      // line 1 starts at offset 0, line 2 at offset 3 ('aa\n'), line 3 at 6
      expect(idx.line_offsets[0]).toBe(0);
      expect(idx.line_offsets[1]).toBe(3);
      expect(idx.line_offsets[2]).toBe(6);
    });
  });

  it("throws on non-existent file", async () => {
    await expect(buildIndex("/no/such/file.md")).rejects.toBeDefined();
  });
});
```

- [ ] **Step 8.2: Run failing test** → FAIL.

- [ ] **Step 8.3: Implement**

```typescript
// src/index/builder.ts
import { readFile, stat } from "node:fs/promises";
import { extractHeadings } from "../parser/markdown.js";
import { findCommentRanges } from "../parser/comments.js";
import { parseFrontmatter } from "../parser/frontmatter.js";
import { extractNumbering } from "../parser/numbering.js";
import { buildTocTree } from "./reparenting.js";
import type { FlatHeader, Index } from "./types.js";

function stripBOM(s: string): string {
  return s.length > 0 && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function computeLineOffsets(content: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) === 10) {
      offsets.push(i + 1);
    }
  }
  // If the file doesn't end with \n, the last "line" is still counted via offsets[len-1].
  return offsets;
}

export async function buildIndex(filePath: string): Promise<Index> {
  const stats = await stat(filePath);
  const raw = stripBOM(await readFile(filePath, "utf8"));
  const fm = parseFrontmatter(raw);
  const headingsInBody = extractHeadings(fm.body);
  const bodyOffset = fm.body_start_line - 1;

  const flat: FlatHeader[] = headingsInBody.map((h) => {
    const absoluteLine = h.line + bodyOffset;
    return {
      id: `s${absoluteLine}`,
      level: h.level,
      title: h.title,
      numbering: extractNumbering(h.title),
      line: absoluteLine,
    };
  });

  const comment_ranges = findCommentRanges(raw);
  const line_offsets = computeLineOffsets(raw);
  const line_count = line_offsets.length;
  const toc = buildTocTree(flat, line_count);

  return {
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
  };
}
```

- [ ] **Step 8.4: Run tests** → PASS.

---

### Task 9: index/cache.ts

**Files:**
- Create: `src/index/cache.ts`
- Create: `tests/unit/index/cache.test.ts`

- [ ] **Step 9.1: TDD test cases**

```typescript
// tests/unit/index/cache.test.ts
import { describe, it, expect } from "vitest";
import { writeFile, utimes, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IndexCache } from "../../../src/index/cache.js";

async function makeFile(content: string): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), "md-docs-mcp-cache-"));
  const file = join(dir, "doc.md");
  await writeFile(file, content, "utf8");
  return { path: file, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

describe("IndexCache", () => {
  it("returns cached index on second call when file unchanged", async () => {
    const { path, cleanup } = await makeFile("# H\n");
    try {
      const cache = new IndexCache();
      const a = await cache.getOrBuild(path);
      const b = await cache.getOrBuild(path);
      expect(a).toBe(b); // reference equality — same instance
    } finally {
      await cleanup();
    }
  });

  it("rebuilds when mtime changes", async () => {
    const { path, cleanup } = await makeFile("# H\n");
    try {
      const cache = new IndexCache();
      const a = await cache.getOrBuild(path);
      // bump mtime by 2 seconds
      const future = new Date(Date.now() + 2000);
      await utimes(path, future, future);
      const b = await cache.getOrBuild(path);
      expect(a).not.toBe(b); // new instance built
      expect(b.mtime_ms).toBeGreaterThan(a.mtime_ms);
    } finally {
      await cleanup();
    }
  });

  it("rebuilds when content (and therefore size) changes", async () => {
    const { path, cleanup } = await makeFile("# A\n");
    try {
      const cache = new IndexCache();
      const a = await cache.getOrBuild(path);
      await writeFile(path, "# A\n## B\n", "utf8");
      const b = await cache.getOrBuild(path);
      expect(a).not.toBe(b);
      expect(b.flat_headers).toHaveLength(2);
    } finally {
      await cleanup();
    }
  });

  it("evicts least-recently-used entries past max size", async () => {
    const files: Array<{ path: string; cleanup: () => Promise<void> }> = [];
    try {
      const cache = new IndexCache(2);
      for (let i = 0; i < 3; i++) {
        const f = await makeFile(`# H${i}\n`);
        files.push(f);
        await cache.getOrBuild(f.path);
      }
      // After 3 files in a cache of size 2, the first one was evicted.
      // The second call to file[0] must rebuild (new instance):
      const firstAgain = await cache.getOrBuild(files[0]!.path);
      const secondCall = await cache.getOrBuild(files[0]!.path);
      expect(firstAgain).toBe(secondCall); // now cached again
    } finally {
      for (const f of files) await f.cleanup();
    }
  });

  it("throws and does not cache missing files", async () => {
    const cache = new IndexCache();
    await expect(cache.getOrBuild("/no/such/file.md")).rejects.toBeDefined();
  });
});
```

- [ ] **Step 9.2: Run failing test** → FAIL.

- [ ] **Step 9.3: Implement**

```typescript
// src/index/cache.ts
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { LRUCache } from "lru-cache";
import { buildIndex } from "./builder.js";
import type { Index } from "./types.js";

type Entry = { size_bytes: number; mtime_ms: number; index: Index };

export class IndexCache {
  private readonly lru: LRUCache<string, Entry>;

  constructor(maxSize: number = 10) {
    this.lru = new LRUCache<string, Entry>({ max: maxSize });
  }

  async getOrBuild(filePath: string): Promise<Index> {
    const key = resolve(filePath);
    const stats = await stat(key); // throws if missing — desired
    const cached = this.lru.get(key);
    if (
      cached &&
      cached.size_bytes === stats.size &&
      cached.mtime_ms === stats.mtimeMs
    ) {
      return cached.index;
    }
    const index = await buildIndex(key);
    this.lru.set(key, {
      size_bytes: index.size_bytes,
      mtime_ms: index.mtime_ms,
      index,
    });
    return index;
  }

  invalidate(filePath: string): void {
    this.lru.delete(resolve(filePath));
  }

  clear(): void {
    this.lru.clear();
  }
}
```

- [ ] **Step 9.4: Run tests** → PASS.

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

Все exit 0. Test count: 1 smoke + 3 integration + 7 unit (parser × 4 + index × 3) ≥ 11 файлов, ≥ 40 тестов.

- [ ] **Step 10.2: Tick PR-03 checkbox**

Edit раздел 15 spec'а: `- [ ] **PR-03: Parser + indexing core**` → `- [x] **PR-03: Parser + indexing core**`.

- [ ] **Step 10.3: Commit + push**

Стейджим все новые файлы, package.json, lockfile, spec. Commit с описательным message. Push на ветку `pr-03-parser-indexing`.

---

## Acceptance criteria

После merge PR-03:

1. `pnpm typecheck && pnpm test && pnpm build` зелёные.
2. `IndexCache.getOrBuild(path)` корректно строит и кэширует Index с инвалидацией по mtime+size.
3. `buildIndex(path)` возвращает корректное `Index` с TOC, flat_headers, comment_ranges, line_offsets, frontmatter.
4. `extractHeadings` распознаёт ATX-заголовки уровней 1-6, чистит inline-markdown, игнорирует заголовки в code-блоках.
5. `findCommentRanges` находит одностроковые и многостроковые HTML-комментарии, игнорирует внутри code-блоков.
6. `extractNumbering` обрабатывает числовую, алфавитную и Annex-нумерацию; `null` для не-нумерованных.
7. `buildTocTree` строит корректное дерево с reparenting'ом и точным `line_end`.
8. Tools всё ещё возвращают `not_implemented` — никаких изменений в `src/server.ts` / `src/tools/*`.
9. Чекбокс PR-03 отмечен в spec разделе 15.

## Anti-patterns (что НЕ делать в этом PR)

- Не имплементировать tool handlers (PR-04+).
- Не добавлять `is_likely_artifact` логику (PR-04).
- Не добавлять `pdf_pages` в TocNode (PR-04).
- Не менять Zod схемы или descriptions (PR-02 territory).
- Не добавлять integration-тесты на реальные fixtures — это в PR-04.
