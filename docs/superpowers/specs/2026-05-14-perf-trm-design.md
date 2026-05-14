# Спека: производительность на больших документах (ESP32-P4 TRM и подобные)

**Дата:** 2026-05-14
**Статус:** черновик, готов к плану реализации

## Мотивация

На фикстуре `tests/fixtures/public/esp32-p4-trm.md` (5.18 MB, 143 383 строки, 2 011 заголовков, ~16 000 HTML-комментариев, ~5 200 PDF-маркеров) `buildIndex` занимает **112 секунд** на локальной машине (M-серия Mac). CI-таймаут стресс-теста стоит на 10 минут (`stress_huge_document.test.ts:50`), и это — реальная плата за то, что на каждый чтениe MCP-сервер пере-индексирует документ с нуля при сбое кэша.

Замер по фазам (`/tmp/bench-trm.mjs`):

| Фаза `buildIndex` | Время | Доля |
|---|---|---|
| `findCommentRanges` | 96 s | 86 % |
| `parsePdfPageMarkers` | 16 s | 14 % |
| `extractHeadings` (markdown-it) | 140 ms | < 1 % |
| `buildTocTree` | 13 ms | < 1 % |
| `computeLineOffsets` | 6.9 ms | < 1 % |
| остальное | < 5 ms каждый | — |

**Корневая причина — O(N × M) в двух парсерах.** В `comments.ts` и `pdf_pages.ts` функция `lineOfOffset(content, offset)` сканирует весь файл с нулевого байта при каждом совпадении регекса. Для 16 000 комментариев в 5.2-MB файле это ~80 миллиардов операций — отсюда 96 секунд.

Сопутствующие, не доминирующие, но грязные O(n²):
- `buildTocTree.findNodeById` рекурсивно из второго прохода (по 2 011 заголовкам).
- `findNodeById` дублируется ещё в трёх response-builders.
- `read_section.buildNodeMap` пересобирается **дважды** на каждый вызов.
- `search.buildLineSectionMap` пересобирается на каждый search-вызов.
- `view_toc(raw=true)` линейно перебирает префикс из 2 011 элементов с пересборкой JSON.

## Цели

1. Снизить cold-start `buildIndex` на TRM с 112 s до **< 1 s** (целевая планка 250×).
2. Снизить `view_toc(raw=true)` с 421 ms до **< 20 ms**.
3. Удалить четыре копии `findNodeById` и две копии `buildNodeMap`/`buildLineSectionMap`.
4. Не вносить регрессий в warm-путь (`view_toc depth=6`, `read_section`, `search top-50`).
5. Не изменять публичные API: тип `Index` — внутренний, MCP-ответы и input-схемы остаются прежними.

## Нецели

- Замена `markdown-it`. Парсинг — 140 мс из 112 с, экономия микроскопическая.
- Persistent on-disk cache между процессами. Внутри сессии Claude Code сервер живёт, кэш L1 + быстрый cold-start закрывают потребность.
- «Улучшения» search и read_section, которые уже укладываются в миллисекунды.
- Изменение публичных полей MCP-ответов или параметров environment.

## Архитектура

### Расширение типа `Index`

Все три новые структуры строятся **один раз в `buildIndex`** и затем — read-only — потребляются всеми response-builders.

```ts
type Index = {
  // ... существующие поля ...
  node_by_id: ReadonlyMap<string, TocNode>;       // O(1) lookup для start_id, section_id, anomaly.node_id
  flat_index_by_id: ReadonlyMap<string, number>;  // O(1) lookup позиции заголовка в flat_headers
  line_section_map: ReadonlyArray<SectionInfo | null>; // index = line - 1; null = preamble
};

type SectionInfo = {
  id: string;
  title: string;
  level: number;
  numbering: string | null;
};
```

Память на TRM: `node_by_id` — 2 011 записей (~50 KB), `flat_index_by_id` — 2 011 × 8 байт (~16 KB), `line_section_map` — 143 383 ссылки на shared `SectionInfo` (~1.1 MB). Итого ~1.2 MB на индекс TRM — приемлемо.

### Парсеры (комментарии и PDF-маркеры)

Оба парсера переходят на алгоритм «один проход по `content` с бегущим счётчиком newline».

#### `src/parser/comments.ts`

Текущая структура: цикл `re.exec(content)` + `lineOfOffset(content, offset)` на каждый match.

Новая структура (псевдокод):

```ts
export function findCommentRanges(content: string): CommentRange[] {
  const codeRanges = getCodeBlockRanges(content); // оставляем как есть — markdown-it один раз
  const re = /<!--[\s\S]*?-->/g;
  const matches: Array<{ startOffset: number; endOffset: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    matches.push({
      startOffset: m.index,
      endOffset: m.index + m[0].length - 1,
    });
  }
  // matches уже отсортированы по startOffset — один проход по content
  const result: CommentRange[] = [];
  let line = 1;
  let scanIdx = 0;
  for (const { startOffset, endOffset } of matches) {
    while (scanIdx < startOffset) {
      if (content.charCodeAt(scanIdx) === 10) line++;
      scanIdx++;
    }
    const start_line = line;
    while (scanIdx <= endOffset) {
      if (content.charCodeAt(scanIdx) === 10) line++;
      scanIdx++;
    }
    const end_line = line; // включает \n в комментарии до фактического конца
    // ... isInsideCode проверка ...
    if (!insideCode) result.push({ start_line, end_line });
  }
  return result;
}
```

Точнее, для `end_line` нужно посчитать линию **на byte = endOffset**, а не после него — мелкий off-by-one риск, ловится unit-тестом.

Альтернатива (проще): построить `line_offsets[]` раньше и использовать `binarySearch(offsets, offset)` для O(log N) на match. Но `line_offsets` сейчас строится **после** парсеров — потребуется переставить порядок в `builder.ts`. Это нормально и даже желательно: `computeLineOffsets` стоит 6.9 ms — двигаем в начало.

**Принимаемая стратегия:** строим `line_offsets` первым шагом в `builder.ts`, оба парсера принимают его как аргумент и используют бинпоиск.

```ts
// comments.ts
export function findCommentRanges(content: string, lineOffsets: number[]): CommentRange[]
// pdf_pages.ts
export function parsePdfPageMarkers(content: string, lineOffsets: number[]): PdfMarker[]
```

#### `src/parser/pdf_pages.ts`

Сейчас в цикле `while ((match = RE.exec(content)) !== null)` каждый раз `for (let i = 0; i < offset; i++)`. Заменяется на:

```ts
const line = lineOfOffsetBinary(lineOffsets, match.index);
```

Где `lineOfOffsetBinary` — это новая утилита в `src/index/builder.ts` (или общем `src/parser/_line_offsets.ts`):

```ts
export function lineOfOffsetBinary(lineOffsets: number[], offset: number): number {
  // lineOffsets[i-1] = char offset начала строки i, 1-based линия
  let lo = 0, hi = lineOffsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (lineOffsets[mid]! <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}
```

### `src/index/reparenting.ts` — убрать findNodeById из второго прохода

Сейчас второй проход вызывает `findNodeById(roots, h.id)` для каждого из 2 011 заголовков (O(n²)). Решение: первый проход уже создаёт `node` для каждого `h`. Сохраняем их в локальный `Map<string, TocNode>` во время прохода и используем во втором проходе напрямую:

```ts
export function buildTocTree(headers: FlatSeed[], totalLines: number): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  const nodes: TocNode[] = []; // в порядке headers[i]
  for (const h of headers) {
    const node: TocNode = { /* ... */ };
    nodes.push(node);
    while (stack.length && stack[stack.length - 1]!.level >= node.level) stack.pop();
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1]!.children.push(node);
    stack.push(node);
  }
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!;
    let endLine = totalLines;
    for (let j = i + 1; j < headers.length; j++) {
      if (headers[j]!.level <= h.level) { endLine = headers[j]!.line - 1; break; }
    }
    nodes[i]!.line_end = endLine;
    nodes[i]!.section_lines = endLine - h.line + 1;
  }
  return roots;
}
```

Локальная функция `findNodeById` из этого файла удаляется.

### `src/index/builder.ts` — построение maps

После `buildTocTree` и enrichment `flat`, перед `detectAnomalies`:

```ts
const node_by_id = buildNodeById(toc);
const flat_index_by_id = new Map<string, number>();
for (let i = 0; i < flat.length; i++) flat_index_by_id.set(flat[i]!.id, i);
const line_section_map = buildLineSectionMap(toc, line_count);
```

`buildLineSectionMap` логически перенесён из `search_response.ts` сюда. Алгоритм тот же: для каждого узла дерева, в порядке родитель→дети, заполняем `[node.line .. node.line_end]` ссылками на shared `SectionInfo` (дети перезаписывают родителя — получается deepest-section semantics).

`tempIndex` теперь содержит эти три поля, и `detectAnomalies` может использовать `flat_index_by_id` вместо `findIndex`.

Шаг `collectRanges` (заполнение `flat[].line_end` / `section_lines`) уходит совсем. `buildTocTree` уже знает `node.line_end` после второго прохода — пусть он возвращает `{ roots: TocNode[], enrichedFlat: FlatHeader[] }`, где `enrichedFlat[i]` соответствует `headers[i]` и уже содержит `line_end` / `section_lines`. Это убирает дополнительный обход дерева и `Map` в builder.

### Response-builders — удаление дублей

| Файл | Что убирается | Чем заменяется |
|---|---|---|
| `src/tools/view_toc_response.ts` | локальная `findNodeById` | `index.node_by_id.get(input.start_id)` |
| `src/tools/read_section_response.ts` | локальная `buildNodeMap` (вызывается 2× за вызов) | `index.node_by_id` |
| `src/tools/read_section_response.ts` | `index.flat_headers.findIndex(...)` в `extractLogicalRange` | `index.flat_index_by_id.get(node.id)` |
| `src/tools/search_response.ts` | локальная `buildLineSectionMap` | `index.line_section_map` |
| `src/tools/analyze_document_response.ts` | локальная `findNodeById` | `index.node_by_id` |
| `src/anomalies/detector.ts` | `flat.findIndex((h) => h.id === node.id)` | `index.flat_index_by_id.get(node.id)` |

### `view_toc(raw=true)` — бинпоиск префикса

Сейчас `view_toc_response.ts:127-141`:

```ts
for (let n = allFlat.length - 1; n >= 1; n--) {
  prefix = allFlat.slice(0, n);
  candidate = { ..., toc: prefix, ... };
  if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= maxBytes) return candidate;
}
```

Заменяется на бинпоиск по `n ∈ [1, allFlat.length-1]`, ищущий **максимальное** `n`, при котором JSON ≤ cap. `O(log N)` итераций вместо `O(N)`. Hint и truncated/effective_depth остаются.

Аналогичный фоллбэк для depth=1 при слишком большом числе root-нод (`view_toc_response.ts:191-205`) — тоже бинпоиск.

## Поток данных в новом `buildIndex`

```
readFile + stripBOM         -> raw
computeLineOffsets(raw)     -> line_offsets        ← ПЕРЕНЕСЁН ВВЕРХ
parseFrontmatter(raw)       -> fm
extractHeadings(fm.body)    -> headingsInBody
flatSeeds = ...
findCommentRanges(raw, line_offsets)    ← single-pass через бинпоиск
parsePdfPageMarkers(raw, line_offsets)  ← single-pass через бинпоиск
buildTocTree(flatSeeds, line_count) -> toc + enriched flat (без второго findNodeById)
buildNodeById(toc)          -> node_by_id
buildFlatIndexById(flat)    -> flat_index_by_id
buildLineSectionMap(toc, line_count) -> line_section_map
tempIndex = { ..., все три map ... }
detectAnomalies(tempIndex)  -> anomalies   (использует flat_index_by_id)
for each anomaly: set is_likely_artifact via node_by_id.get(...)
return Index
```

## Обработка ошибок

Контракты не меняются:
- `UNKNOWN_SECTION_ID` (`view_toc.start_id`, `read_section.section_id`) — `Map.get(...) === undefined`.
- `INVALID_REGEX` в search — без изменений.
- `FROM_LINE_OUT_OF_RANGE` — без изменений.
- Невалидные env переменные — без изменений.

## Тестирование

### Существующие тесты — обязательный pass без модификаций

- `tests/integration/invariants.test.ts` (line-coverage на TRM)
- `tests/integration/invariants_byte_reconstruction.test.ts`
- `tests/integration/stress_huge_document.test.ts` (4 sub-теста + line-coverage)
- все `tests/unit/**`

### Новые unit-тесты

`tests/unit/parser/comments.test.ts` (расширение):
- Комментарий на L1 (offset = 0).
- Комментарий на последней строке файла, оканчивающейся без `\n`.
- Многострочный комментарий, охватывающий 5+ строк.
- Несколько комментариев в одной строке.
- Цель: ловить off-by-one в бегущем счётчике / бинпоиске.

`tests/unit/parser/pdf_pages.test.ts` (расширение):
- Маркер на L1.
- Маркер на последней строке.
- Несколько маркеров подряд.
- Та же цель.

`tests/unit/index/builder_maps.test.ts` (новый):
- `node_by_id` содержит все 2 011 узлов TRM.
- `flat_index_by_id` всё ещё указывает на корректные позиции после rebuild.
- `line_section_map[line - 1]` для нескольких известных линий TRM указывает на правильную deepest-section.

### Stress-test timeout

Текущее: `600_000 ms` (10 минут) в `stress_huge_document.test.ts:50`.

Шаги:
1. Реализовать оптимизацию.
2. Локально запустить `pnpm test` и измерить реальное время cold-start на TRM.
3. Запушить PR, посмотреть фактическое время на GitHub CI (medium-slow раннеры, обычно 3-5× медленнее локали).
4. Установить новый timeout: `CI_observed_ms × 3` (запас на GC, I/O jitter, разные раннеры).
5. Удалить устаревший комментарий `~90-120 s локально` и `~3-4× slower on GitHub`, заменить новой фразой.

Цель планки: ≤ 30 с (если выйдет ≤ 10 с — отлично, ставим 30 с с запасом).

## Acceptance — измеримые гарантии

| Метрика | До | После |
|---|---|---|
| `buildIndex` на TRM (cold) | 112 s | **< 1 s** |
| `findCommentRanges` | 96 s | < 50 ms |
| `parsePdfPageMarkers` | 16 s | < 30 ms |
| `view_toc(raw=true)` | 421 ms | **< 20 ms** |
| `view_toc(depth=6)` | 3.8 ms | без регрессии (± 20 %) |
| `read_section` (root / deepest) | 1 ms / 0.5 ms | без регрессии |
| `search` (literal, top-50 / top-1000) | 1 ms / 51 ms | без регрессии |
| `analyze_document` | 0.5 ms | без регрессии |
| stress-test timeout | 600 000 ms | определяется замером + 3× |

## Что НЕ делаем (зафиксировано)

- ❌ Не меняем `markdown-it`.
- ❌ Не вводим persistent on-disk cache.
- ❌ Не меняем публичные типы MCP-ответов и input-схемы.
- ❌ Не меняем env-переменные / config defaults.
- ❌ Не «улучшаем» search/read_section warm-путь сверх того, что даёт переход на shared maps.

## Открытые риски

1. **Off-by-one в новых парсерах.** Lo-fi mitigation: новые unit-тесты на boundary cases + существующий byte-reconstruction invariant ловит несовпадение range на TRM сразу.
2. **`line_section_map` ~1 MB RAM на TRM.** Приемлемо; индексы и так держат полный `raw_content` в памяти (5 MB). Если в будущем понадобится — заменим на бинпоиск по интервалам узлов.
3. **CI-флаки на новом timeout.** Mitigation: измерить дважды (быстрый PR + перезапуск), взять max × 3.
