# PR-06: search + analyze_document — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Реализовать два последних tool'а MVP. `search` поддерживает literal+regex, scope (titles/content/all), case sensitivity, context_lines, max_results, include_comments. `analyze_document` строит диагностический отчёт с обогащённым `logical_effect` для self_nesting аномалий. После этого PR — 0 stub-тулов, MVP функциональности завершён.

**Architecture:**
- `src/tools/search.ts` + `src/tools/search_response.ts` — handler factory + pure search algorithm.
- `src/tools/analyze_document.ts` + `src/tools/analyze_document_response.ts` — handler + response builder. Берёт `index.anomalies` и для каждой self_nesting добавляет `logical_effect`.
- Map line→section_id предкомпилируется один раз на Index для быстрого hit→section mapping.
- `tests/integration/tools-call-stub.test.ts` удаляется после PR-06 (0 stubs).

**Tech Stack:** уже всё подключено.

**Реализация PR-06 из spec'а** [docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md](../specs/2026-05-14-markdown-docs-mcp-design.md), разделы 3.4 (search), 3.5 (analyze_document), 5 (anomalies), 15 (roadmap).

**Ветка:** `pr-06-search-analyze` от `dev`.

---

## Файлы

**Создать:**
- `src/tools/search_response.ts` — pure search algorithm + helpers
- `src/tools/analyze_document_response.ts` — pure response builder with logical_effect
- `tests/unit/tools/search_response.test.ts`
- `tests/unit/tools/analyze_document_response.test.ts`
- `tests/integration/search.test.ts`
- `tests/integration/analyze_document.test.ts`

**Модифицировать:**
- `src/tools/search.ts` — replace stub with `makeSearchHandler(cache)`
- `src/tools/analyze_document.ts` — replace stub with `makeAnalyzeDocumentHandler(cache)`
- `src/server.ts` — wire both real handlers, drop stub callbacks
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` — tick PR-06 checkbox

**Удалить:**
- `tests/integration/tools-call-stub.test.ts` — все tools реальные; этот файл стал устаревшим (его место занимают integration tests view_toc / read_section / search / analyze_document)

---

## Контракты

### `search_response.ts`

```typescript
import type { Index, TocNode, FlatHeader } from "../index/types.js";
import type { SearchInput } from "../schemas/inputs.js";

export type SearchHit = {
  line: number;
  snippet: string;
  matched_text: string;
  section: {
    id: string;
    title: string;
    level: number;
    numbering: string | null;
  };
  in: "title" | "content";
};

export type SearchResponse = {
  hits: SearchHit[];
  total_matches: number;
  truncated: boolean;
};

export function buildSearchResponse(
  index: Index,
  input: SearchInput
): SearchResponse;
```

Алгоритм:

1. **Build line→section map** (lazy, кэш на Index — но в MVP per-call OK): для каждой строки 1..line_count найти deepest TocNode that contains. Если до первого header'а (preamble) — sentinel section (можно просто `null` и трактовать в hits).

2. **Build matcher:**
   - `regex=true`: `new RegExp(query, case_sensitive ?? true ? "g" : "gi")`. Если invalid regex — throw structured error.
   - `regex=false`: literal substring; `case_sensitive ?? false`.

3. **Search titles** (если scope ∈ {"all","titles"}):
   - Iterate flat_headers; match title via matcher (literal: includes / regex: test).
   - Hit: `{ line: header.line, snippet: header.title, matched_text: <matched>, section: { id, title, level, numbering }, in: "title" }`.

4. **Search content** (если scope ∈ {"all","content"}):
   - Iterate raw_content line-by-line. Skip lines wholly inside comment_ranges if `include_comments=false`.
   - For each match: build hit with snippet = lines `[line - context_lines .. line + context_lines]` joined by `\n` (clamp to file bounds).
   - Section: lookup via line→section map. Если no containing section (preamble) — фолбэк на virtual section `{ id: "", title: "(document preamble)", level: 0, numbering: null }`.

5. **Cap by max_results (default 50)**: count `total_matches` continuing — иначе для большого документа total дорого. Альтернатива: `total_matches = hits.length when not truncated, else null`. **Для MVP:** считаем total_matches только до cap; если упёрлись → `total_matches = max_results`, `truncated = true`. Это документируется в коде.

6. **Sort hits by line** ascending. Stable.

### `analyze_document_response.ts`

```typescript
import type { Index } from "../index/types.js";
import type { AnalyzeDocumentInput } from "../schemas/inputs.js";

type EnrichedAnomaly = Anomaly & {
  logical_effect?: {
    if_treated_as_artifact: {
      section_extended: string;
      extension: string;
    };
  };
};

export type AnalyzeDocumentResponse = {
  file: {
    path: string;
    size_bytes: number;
    line_count: number;
    mtime: string;
  };
  summary: string;
  anomalies: EnrichedAnomaly[];
  by_type: Record<string, number>;
};

export function buildAnalyzeDocumentResponse(
  index: Index,
  input: AnalyzeDocumentInput
): AnalyzeDocumentResponse;
```

Алгоритм:
1. **summary**: построить человекочитаемый текст. Если total > 0:  
   `"Document has N likely structural anomalies (M self_nesting, K level_jump, ...). M self_nesting are often PDF-conversion artifacts; check adjacent_pdf_markers in each entry. analyze_document is DESCRIPTIVE — apply fixes only after agreeing with the user."`  
   Иначе: `"No structural anomalies detected. Hierarchy is clean."`
2. **Enrich self_nesting anomalies with logical_effect**:
   - Найти `preceding_real_header` из anomaly.context.
   - Найти соответствующий TocNode (через flat lookup).
   - Compute logical_line_end if `preceding_real_header` is treated like in PR-05 logical mode but absorbing this artifact + adjacent ones.
   - `section_extended = "<node.id> (<numbering or title>)"` — например `"s3929 (4.1.1.2 RISC-V Trace Encoder)"`.
   - `extension = "L<orig.line>-L<orig.line_end> (X lines) -> L<orig.line>-L<new_end> (Y lines)"`.

   Если `preceding_real_header` не определён (например, аномалия в начале файла) — `logical_effect` опускается.

3. **by_type**: счётчики по AnomalyType.

### Handler factories

```typescript
// src/tools/search.ts
export function makeSearchHandler(cache: IndexCache) {
  return async function search(input: SearchInput) {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildSearchResponse(index, input);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  };
}

// src/tools/analyze_document.ts
export function makeAnalyzeDocumentHandler(cache: IndexCache) {
  return async function analyzeDocument(input: AnalyzeDocumentInput) {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildAnalyzeDocumentResponse(index, input);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  };
}
```

### Server wiring

В `createServer`: оставить view_toc / read_section как есть, заменить stub callbacks для search и analyze_document на real handlers.

---

## Задачи

### Task 1: search_response.ts + unit tests

**Files:**
- Create: `src/tools/search_response.ts`
- Create: `tests/unit/tools/search_response.test.ts`

- [ ] **Step 1.1: TDD test cases**

Unit tests на hand-crafted Index'ах (или на `buildIndex` от tmp md). Покрытие:

1. Literal substring match (case-insensitive by default).
2. Literal substring with case_sensitive=true → не находит "FOO" на "foo".
3. Regex match.
4. Invalid regex → structured error.
5. scope="titles" — находит только в headers, не в body.
6. scope="content" — находит только в body, не в headers.
7. scope="all" — оба.
8. context_lines: snippet содержит N строк до/после.
9. include_comments=false: PDF marker не находится.
10. include_comments=true: находится.
11. max_results: ограничивает hits и устанавливает truncated.
12. Hits sorted by line ascending.
13. Hit section field указывает на ближайший containing TocNode.
14. Preamble matches (до first heading) имеют virtual section.

- [ ] **Step 1.2: Implement search_response.ts**

Реализация по контракту выше. Помни:
- `String.includes` для literal с lowercase manipulation для case insensitivity.
- `RegExp.exec` в loop с `global` флагом для multi-match — но в SearchInput это per-line match. Можно проще: для regex `test()` на каждой строке + `match` для capture'ов.
- `matched_text`: для literal — это substring которая matched (case-preserved оригинальная). Для regex — full match.
- Snippet: `lineOffsets[from-1]` до `lineOffsets[to] ?? content.length`.

- [ ] **Step 1.3: Run tests** → PASS.

---

### Task 2: search.ts handler + server wiring

- [ ] **Step 2.1: Replace search stub**

`src/tools/search.ts`: реализовать `makeSearchHandler(cache)`.

- [ ] **Step 2.2: Update server.ts**

Заменить stub callback для search.

- [ ] **Step 2.3: typecheck + test**

Run: `pnpm typecheck && pnpm test`. Существующий stub test `tests/integration/tools-call-stub.test.ts` всё ещё работает (видит search как stub если мы пока не убрали — но мы убрали в Task 5). Пока просто убрать `search` из его validArgs.

---

### Task 3: search integration tests

**Files:**
- Create: `tests/integration/search.test.ts`

- [ ] **Step 3.1: Тесты на public fixtures**

Через MCP InMemoryTransport. Минимум:

1. **STM32 search "DMA"** — возвращает hits с in="title" для headers с DMA + in="content" для упоминаний в тексте. Total > 0.
2. **regex с whole-word** boundary `/\\bDMA\\b/`.
3. **scope="titles"**: только in="title" hits.
4. **scope="content"**: только in="content" hits.
5. **case_sensitive=true** на verbatim string.
6. **include_comments=false** на ESP32: запрос "PDF_PAGE_BEGIN" возвращает 0 hits.
7. **include_comments=true** на ESP32: запрос "PDF_PAGE_BEGIN" возвращает много hits.
8. **max_results: 5** на популярном слове → truncated=true, hits.length=5.
9. **section field**: для hit в context section правильный id и title.
10. **Invalid regex**: → isError.

- [ ] **Step 3.2: Run** → PASS.

---

### Task 4: analyze_document_response.ts + unit tests

**Files:**
- Create: `src/tools/analyze_document_response.ts`
- Create: `tests/unit/tools/analyze_document_response.test.ts`

- [ ] **Step 4.1: TDD test cases**

Unit tests на synthetic Index с self_nesting anomaly:
1. Empty anomalies → summary "No structural anomalies detected".
2. Mixed types → by_type counts корректные.
3. self_nesting anomaly: enriched с logical_effect — section_extended содержит preceding header info, extension в формате "L<a>-L<b> (X lines) -> L<a>-L<c> (Y lines)".
4. Anomaly без preceding_real_header → logical_effect отсутствует.

- [ ] **Step 4.2: Implement**

Реализация: для каждой anomaly типа `self_nesting_header`:
- Если есть `preceding_real_header` в context — найти TocNode по `flat.find(h => h.line === preceding.line)` → его id.
- Найти next non-artifact header после anomaly.line с level ≤ ancestor.level (ancestor = duplicates_open_ancestor).
- Вычислить orig range (preceding raw_line_end) и new range (next-non-artifact.line - 1).
- Сформировать строки.

- [ ] **Step 4.3: Run tests** → PASS.

---

### Task 5: analyze_document.ts handler + server wiring + tools-call-stub.test.ts cleanup

- [ ] **Step 5.1: Replace analyze_document stub**

`src/tools/analyze_document.ts`: реализовать `makeAnalyzeDocumentHandler(cache)`.

- [ ] **Step 5.2: Update server.ts**

Все 4 tools используют real handler factories.

- [ ] **Step 5.3: Delete tools-call-stub.test.ts**

```bash
git rm tests/integration/tools-call-stub.test.ts
```

Файл больше не имеет смысла — 0 stubs. handshake + tools-list + individual tool integration tests покрывают всю поверхность.

- [ ] **Step 5.4: typecheck + test + build**

Run: `pnpm typecheck && pnpm test && pnpm build && node dist/index.js < /dev/null` — all exit 0.

---

### Task 6: analyze_document integration tests

**Files:**
- Create: `tests/integration/analyze_document.test.ts`

- [ ] **Step 6.1: Тесты на public fixtures**

1. **STM32**: anomalies array empty, summary "No structural anomalies detected".
2. **ESP32**: anomalies.length ≥ 22 (self_nesting count); by_type.self_nesting_header ≥ 22.
3. **ESP32 self_nesting entry**: имеет context.adjacent_pdf_markers с PDF_PAGE_*; имеет logical_effect.if_treated_as_artifact с section_extended ~ "4.1.1.2 RISC-V Trace Encoder", extension содержит численные диапазоны.
4. **Invalid file_path**: → isError.

- [ ] **Step 6.2: Run** → PASS.

---

### Task 7: Финализация

- [ ] **Step 7.1: Full pipeline**

```
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
node dist/index.js < /dev/null
```

Все exit 0. Test count: ≥ 19 files / ≥ 130 tests (после удаления stub файла и добавления новых).

- [ ] **Step 7.2: Tick PR-06 checkbox**

В spec разделе 15.

- [ ] **Step 7.3: Commit + push**

---

## Acceptance criteria

После merge PR-06:

1. `pnpm typecheck && pnpm test && pnpm build` зелёные.
2. `search` находит результаты в STM32/ESP32 fixtures, поддерживает literal/regex, scope, case sensitivity, context_lines, max_results, include_comments.
3. `analyze_document` для ESP32 возвращает ≥ 22 self_nesting anomalies каждая с adjacent_pdf_markers + logical_effect.
4. `analyze_document` для STM32 возвращает empty anomalies + clean summary.
5. Все 4 tools реальные, 0 stubs.
6. `tests/integration/tools-call-stub.test.ts` удалён.
7. Чекбокс PR-06 отмечен.

## Anti-patterns

- Не реализовывать full-text indexing или fuzzy search — grep-like only.
- Не пересоздавать line→section map для каждого hit — один проход.
- Не пытаться нормализовать invalid regex (let `new RegExp()` throw → structured error).
- Не модифицировать Index (read-only contract).
