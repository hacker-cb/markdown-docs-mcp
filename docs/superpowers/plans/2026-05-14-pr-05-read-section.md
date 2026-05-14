# PR-05: read_section — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Реализовать второй real tool — `read_section`. Включает: raw + logical режимы, `include_subsections`, `include_comments`, truncation cap 200 KB + continuation через `from_line`. Тесты на public fixtures плюс byte-reconstruction invariant как мощная проверка no-content-loss.

**Architecture:**
- `src/tools/read_section.ts` — handler factory `makeReadSectionHandler(cache)`.
- `src/tools/read_section_response.ts` — чистые helpers: `extractRawRange`, `extractLogicalRange`, `stripComments`, `truncateAtBytes`.
- Контент извлекается через `Index.line_offsets` (O(1) substring по диапазону строк), `comment_ranges` фильтруются.
- Logical-mode определяет границу через flat_headers + lookup is_likely_artifact по `id` (Map для O(1)).
- `expansion` в response явно перечисляет absorbed artifacts.
- Hard cap 200 KB на `response.content`; превышение → `truncated_at_line: N`; continuation через `from_line: N+1`.
- read_section tool становится real; search + analyze_document — остаются stubs до PR-06.

**Tech Stack:** уже всё подключено. Новых deps нет.

**Реализация PR-05 из spec'а** [docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md](../specs/2026-05-14-markdown-docs-mcp-design.md), разделы 3.3 (API read_section), 5.4 (no-content-loss), 6 (comments), 9.2 (invariants).

**Ветка:** `pr-05-read-section` от `dev`.

---

## Файлы

**Создать:**
- `src/tools/read_section_response.ts` — pure helpers + buildResponse
- `tests/unit/tools/read_section_response.test.ts` — unit tests на synthetic indexes
- `tests/integration/read_section.test.ts` — end-to-end через InMemoryTransport
- `tests/integration/invariants_byte_reconstruction.test.ts` — byte-reconstruction на public fixtures

**Модифицировать:**
- `src/tools/read_section.ts` — заменить stub на real handler factory
- `src/server.ts` — заменить stub-callback на `makeReadSectionHandler(cache)`
- `tests/integration/tools-call-stub.test.ts` — убрать `read_section` из stub list (остаются search, analyze_document)
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` — tick PR-05 checkbox

**НЕ модифицировать:**
- `src/tools/{search,analyze_document}.ts` — остаются stubs.

---

## Контракты

### `extractRawRange`

```typescript
function extractRawRange(
  rawContent: string,
  lineOffsets: number[],     // 1-based: offsets[0] = start of line 1
  fromLine: number,           // 1-based, inclusive
  toLine: number              // 1-based, inclusive
): string;
```

Возвращает substring `rawContent` от начала `fromLine` до конца `toLine` (включая trailing `\n` строки `toLine` если она есть).

### `extractLogicalRange`

```typescript
type AbsorbedArtifact = {
  id: string;
  line: number;
  title: string;
  would_have_owned_lines: string;   // e.g. "L3935-L3961"
};

function extractLogicalRange(
  index: Index,
  node: TocNode,
  includeSubsections: boolean
): {
  start_line: number;
  raw_line_end: number;
  logical_line_end: number;
  artifacts_absorbed: AbsorbedArtifact[];
};
```

Алгоритм:
- `start_line = node.line`.
- `raw_line_end`: если `includeSubsections=false` — `(firstChild?.line - 1) ?? node.line_end`; иначе `node.line_end`.
- Найти `logical_line_end`: walk `flat_headers` после node'а; skip `is_likely_artifact: true` узлов; первый non-artifact с `level <= node.level` (или `level <= firstChild.level - 1` если includeSubsections=false? — нет, всё то же: ищем boundary одного семантического уровня) → `boundary.line - 1`. Если не найден → `line_count`.
  - Замечание про `includeSubsections=false`: при logical расширении подсекций не происходит — мы расширяем интрo за artifact'ами, но дочерние не-artifact заголовки `level > node.level` всё равно прерывают. Чтобы такое работало корректно, нужно для `includeSubsections=false` искать первый non-artifact с `level <= node.level + 1` (т.е. либо sibling/parent, либо real first child). Используем: `target_level = includeSubsections ? node.level : Infinity для children`. Проще: при `includeSubsections=false` boundary = первый non-artifact с `level <= firstChild.level` или `<= node.level` если нет children.
  - **Финальное решение для простоты MVP:** logical только расширяет границу прохождением через artifact узлы того же уровня или глубже. То есть:
    - Используем `raw_line_end` как стартовое значение.
    - Walk flat_headers от boundary справа: если узел в позиции `raw_line_end + 1` это artifact — расширяем дальше, повторяем; если non-artifact — стоп. Иначе boundary остался.
    - Это keeps semantics простой: «поглотить смежные artifact'ы за концом обычного раздела».
- `artifacts_absorbed`: те artifact-узлы которые попали в диапазон `(raw_line_end .. logical_line_end]`.

### `stripComments`

```typescript
function stripComments(
  content: string,
  startLine: number,                          // абсолютная строка начала content
  commentRanges: Array<{ start_line: number; end_line: number }>,
  lineOffsets: number[],
  contentEndLine: number                      // абсолютная строка конца content
): string;
```

Идея: получить список строк которые в commentRanges и попадают в `[startLine..contentEndLine]`; вырезать их из content. Line numbers content остаются абсолютными — gaps между сохранёнными строками отражают где были комментарии. Сами вырезанные строки **не** дозамещаются placeholder-строкой; content становится короче.

### `truncateAtBytes`

```typescript
function truncateAtBytes(
  content: string,
  startLine: number,
  lineOffsets: number[],
  maxBytes: number
): { content: string; truncated_at_line?: number };
```

Алгоритм: преобразуем content в Buffer; если `byteLength <= maxBytes` → as-is, no truncation. Иначе:
- Находим последний `\n` в первых `maxBytes` байтах.
- Считаем absolute line этого `\n` (через linecount от startLine).
- Возвращаем substring до этого `\n` (включительно) + `truncated_at_line = <эта строка>`.
- Если ни одного `\n` не нашлось в первых `maxBytes` — это редкий case (одна сверхдлинная строка); просто обрезаем по байтам и ставим `truncated_at_line = startLine`.

### `buildReadSectionResponse` (главная функция)

```typescript
type ReadSectionResponse = {
  section: {
    id: string;
    title: string;
    level: number;
    line: number;
    line_end: number;
    numbering: string | null;
  };
  content: string;
  children?: TocNode[];
  expansion?: {
    raw_line_end: number;
    logical_line_end: number;
    artifacts_absorbed: AbsorbedArtifact[];
  };
  truncated?: boolean;
  truncated_at_line?: number;
};

function buildReadSectionResponse(
  index: Index,
  input: ReadSectionInput
): ReadSectionResponse;
```

Логика:
1. Найти node по `section_id` (через flat_headers Map<id, TocNode>; если нет — throw structured Error).
2. Определить `start_line`:
   - Если `from_line` указан и `from_line >= node.line && from_line <= node.line_end` → `start_line = from_line`. Иначе `start_line = node.line`. Если `from_line` вне диапазона → throw структурный Error (`from_line out of section range`).
3. Определить `effective_end_line`:
   - mode="raw": `(includeSubsections ? node.line_end : (firstChild ? firstChild.line - 1 : node.line_end))`
   - mode="logical": через `extractLogicalRange` → `logical_line_end`, плюс собрать `artifacts_absorbed`
4. Extract content: `extractRawRange(raw_content, line_offsets, start_line, effective_end_line)`.
5. If `include_comments=false`: `stripComments(content, start_line, comment_ranges, line_offsets, effective_end_line)`.
6. Truncate: `truncateAtBytes(content, start_line, line_offsets, 200 * 1024)`.
7. Build children mini-TOC если `include_subsections=false` и `node.children.length > 0`.
8. Build expansion если mode="logical" и `artifacts_absorbed.length > 0`.
9. Return response.

### `makeReadSectionHandler`

```typescript
import type { IndexCache } from "../index/cache.js";
import type { ReadSectionInput } from "../schemas/inputs.js";
import { buildReadSectionResponse } from "./read_section_response.js";

export function makeReadSectionHandler(cache: IndexCache) {
  return async function readSection(input: ReadSectionInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildReadSectionResponse(index, input);
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
    };
  };
}
```

---

## Задачи

### Task 1: read_section_response helpers

**Files:**
- Create: `src/tools/read_section_response.ts`
- Create: `tests/unit/tools/read_section_response.test.ts`

- [ ] **Step 1.1: TDD test cases**

Несколько unit-тестов на synthetic Index (используем minimal mocks как в anomalies/detector.test.ts):

```typescript
// tests/unit/tools/read_section_response.test.ts
import { describe, it, expect } from "vitest";
import { buildReadSectionResponse } from "../../../src/tools/read_section_response.js";
import type { Index, TocNode, FlatHeader } from "../../../src/index/types.js";

function buildIndexFromMarkdown(md: string): Index {
  // Simple inline index — not using real builder to keep unit isolation.
  // For more realistic tests, integration tests cover end-to-end.
  // For unit, hand-craft per test case.
  // (helper expanded in actual implementation)
  // ...
}

describe("buildReadSectionResponse", () => {
  it("raw mode without subsections returns content from heading to first child or line_end", () => {
    // ... craft Index with one root + one child; assert content == lines 1..(child.line - 1)
  });

  it("raw mode with include_subsections=true returns full section content", () => {
    // ... assert content == lines node.line..node.line_end
  });

  it("includes children mini-TOC when include_subsections=false and node has children", () => {
    // ... assert response.children matches node.children
  });

  it("strips HTML comments when include_comments=false", () => {
    // ... content has a comment line; assert that line is missing from response.content
  });

  it("preserves comments when include_comments=true", () => {
    // ... assert response.content contains the comment
  });

  it("truncates content over 200KB and sets truncated_at_line", () => {
    // ... craft Index with content > 200KB; assert truncated=true
  });

  it("supports from_line continuation", () => {
    // ... from_line in middle of section; assert content starts from that line
  });

  it("logical mode absorbs adjacent artifact nodes and lists them in expansion", () => {
    // ... craft Index where node has a sibling-level artifact right after raw_line_end;
    //     assert response.expansion.artifacts_absorbed contains that artifact
  });

  it("throws structured error for unknown section_id", () => {
    // ... expect throw with message containing "section_id" hint
  });
});
```

Implementer должен написать минимальный builder для inline-тестов или использовать вызов реального `buildIndex` на временных файлах (как в `builder.test.ts`). Выбор за implementer'ом.

- [ ] **Step 1.2: Implement read_section_response.ts**

Файл содержит: `extractRawRange`, `extractLogicalRange`, `stripComments`, `truncateAtBytes`, `buildReadSectionResponse`. Реализация — по контрактам выше. `200 * 1024 = 204800` как hard cap.

- [ ] **Step 1.3: Run tests** → PASS.

---

### Task 2: read_section tool handler + server DI

**Files:**
- Modify: `src/tools/read_section.ts`
- Modify: `src/server.ts`
- Modify: `tests/integration/tools-call-stub.test.ts`

- [ ] **Step 2.1: Replace stub in read_section.ts**

Реализовать `makeReadSectionHandler(cache)` factory (см. контракт выше).

- [ ] **Step 2.2: Update server.ts**

В createServer заменить stub-callback для read_section на `makeReadSectionHandler(cache)`.

- [ ] **Step 2.3: Update tools-call-stub.test.ts**

Убрать `read_section` из validArgs. Остаются только `search` и `analyze_document` (2 stubs).

- [ ] **Step 2.4: Запустить tests + typecheck + build**

```
pnpm typecheck && pnpm test && pnpm build && node dist/index.js < /dev/null
```

Все exit 0.

---

### Task 3: Integration tests on public fixtures

**Files:**
- Create: `tests/integration/read_section.test.ts`

- [ ] **Step 3.1: Тесты на ESP32 и STM32 фикстурах**

Покрытие:

1. **Raw mode без subsections для simple section в STM32:** content non-empty, response.children может присутствовать если есть дочерние.

2. **Raw mode include_subsections=true:** content больше (включает дочерние).

3. **include_comments=false (default):** PDF-маркеры `<!-- PDF_PAGE_BEGIN -->` отсутствуют в content для ESP32.

4. **include_comments=true:** маркеры присутствуют.

5. **Logical mode для ESP32 раздела 4.1.1.2 (RISC-V Trace Encoder):** content >= 33 строк (раздел вырастает с raw 6 до logical 33+ строк после absorbing fake `## 4 Functional Description`). `expansion.artifacts_absorbed` содержит фейк на L3935.

6. **Truncation на огромной section** (если есть в STM32 — например глава 6): content < 200KB + 5 (запас), `truncated=true`.

7. **from_line continuation:** после truncation вызвать с `from_line = truncated_at_line + 1` → продолжение.

8. **Invalid section_id:** возвращает structured error через MCP isError.

Использовать `InMemoryTransport.createLinkedPair()` + `createServer({ cache: new IndexCache() })`. Закрывать клиента в `afterAll`.

- [ ] **Step 3.2: Run tests** → PASS.

Подсказка: для определения section id раздела `4.1.1.2 RISC-V Trace Encoder` в ESP32 — вызвать сначала `view_toc`, найти узел по `title` (или по `numbering = "4.1.1.2"`), взять `id`.

---

### Task 4: Byte-reconstruction invariant

**Files:**
- Create: `tests/integration/invariants_byte_reconstruction.test.ts`

- [ ] **Step 4.1: Написать тест**

Алгоритм:

```typescript
// Для каждого fixture:
const idx = await cache.getOrBuild(path);
const allNodes = flatten(idx.toc);

const parts: string[] = [];

// 1. Preamble (lines 1 .. firstHeader.line - 1)
const firstHeader = idx.flat_headers[0];
if (firstHeader) {
  const preambleEnd = firstHeader.line - 1;
  if (preambleEnd >= 1) {
    parts.push(extractRawRange(idx.raw_content, idx.line_offsets, 1, preambleEnd));
  }
} else {
  parts.push(idx.raw_content);
}

// 2. For each node in TOC traversal order: read_section(id, raw, include_subsections=false, include_comments=true)
for (const node of allNodes) {
  const result = await client.callTool({
    name: "read_section",
    arguments: {
      file_path: path,
      section_id: node.id,
      include_subsections: false,
      include_comments: true,
      mode: "raw",
    },
  });
  const parsed = JSON.parse((result as any).content[0].text);
  parts.push(parsed.content);
}

const reconstructed = parts.join("");
expect(reconstructed).toBe(idx.raw_content);
```

Запустить на ESP32-P4 + STM32H750IB. Если invariant падает — это сигнал бага в `extractRawRange` или `buildReadSectionResponse`; report BLOCKED, не мутировать тест.

⚠️ Возможный нюанс: trailing `\n` в substring через `lineOffsets`. Если `extractRawRange(content, offsets, fromLine, toLine)` возвращает `content.slice(offsets[fromLine - 1], offsets[toLine] ?? content.length)`, то trailing `\n` строки `toLine` входит. Конкатенация без gaps. Это правильно.

Граничный случай: последний node имеет `line_end === line_count`, его content слайс кончается на `content.length`. OK.

Преамбула: lines 1..firstHeader.line-1 — `slice(0, offsets[firstHeader.line - 1])`. OK.

- [ ] **Step 4.2: Run test** → PASS на обоих fixtures.

---

### Task 5: Финализация

- [ ] **Step 5.1: Pipeline**

```
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
node dist/index.js < /dev/null
```

Все exit 0. Test count: должно быть ≥ 17 files / ≥ 82 tests (15 + 1 unit + 1 integration + 1 invariant).

- [ ] **Step 5.2: Tick PR-05 checkbox**

В spec разделе 15: `[ ] **PR-05: read_section**` → `[x]`.

- [ ] **Step 5.3: Commit + push**

---

## Acceptance criteria

После merge PR-05:

1. `pnpm typecheck && pnpm test && pnpm build` зелёные.
2. `read_section` в raw mode возвращает literal parser boundaries.
3. `read_section` в logical mode для ESP32 раздела `4.1.1.2 RISC-V Trace Encoder` возвращает content ≥ 33 строк с `expansion.artifacts_absorbed` содержащим L3935.
4. include_comments=false вырезает HTML-комментарии без сдвига absolute line numbers (gaps видны).
5. Truncation срабатывает на content > 200 KB; continuation через from_line работает.
6. Byte-reconstruction invariant зелёный на обоих public fixtures.
7. Tools search и analyze_document остаются stubs.
8. Чекбокс PR-05 отмечен.

## Anti-patterns

- Не реализовывать search или analyze_document (PR-06).
- Не модифицировать Index или TOC во время чтения (read-only contract).
- Не пытаться «нормализовать» line numbers content при include_comments=false — gaps НАМЕРЕННЫЕ.
- Не использовать UTF-8 char count для cap'а — байты, не символы (Buffer.byteLength).
