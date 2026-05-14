# Huge-document support — дизайн (PR-06.1)

Статус: дизайн утверждён, готов к написанию плана реализации.
Sub-spec поверх главного [2026-05-14-markdown-docs-mcp-design.md](2026-05-14-markdown-docs-mcp-design.md) — patches API view_toc и Heading model для документов масштаба 100k+ строк.

## 1. Контекст

### 1.1 Реальный случай

После merge PR-01..PR-06 MVP протестирован вручную на ESP32-P4 Technical Reference Manual (`/Users/pavel/projects/jethome/mcu-examples-rs/docs/datasheets-mcu/esp32/markdown/esp32-p4_technical_reference_manual.md`):

| Метрика | Значение |
|---|---|
| Размер файла | 5.2 MB |
| Число строк | 143 382 |
| Всего заголовков | 2011 |
| h1 / h2 / h3 / h4 / h5 | 118 / 476 / 879 / 481 / 57 |
| `view_toc(depth=1)` JSON | ~68 KB |
| `view_toc(depth=2)` JSON | ~277 KB |

Клиент Claude Code автоматически переадресует tool-output большой длины в файл с подсказкой «use grep on the file directly». В наблюдаемой сессии агент корректно начал с `view_toc`, получил redirect, и переключился на `Bash + grep` — то есть фактически перестал пользоваться MCP. Сам инструмент работал корректно; проблема в размере ответа.

Дополнительно: ~5 MB файла превратились в 118 h1 потому что pdf2md-claude генерирует пары `# Chapter N\n# Title` как два отдельных заголовка одного уровня. Реальных глав в документе ~35.

### 1.2 Цели

- `view_toc` отдаёт полезный ответ для документа **любого размера**, не превышая консервативный лимит, заведомо безопасный для типового MCP-клиента.
- Сохранить уже доказанные инварианты `no-content-loss` (line-coverage из PR-04 и byte-reconstruction из PR-05) на масштабе TRM.
- API расширения **аддитивные** — все существующие сценарии работают без правок.

### 1.3 Не-цели

- Streaming TOC через MCP resources — будущее, когда станет ясно что одного-pass'а cap'а недостаточно.
- Document-format detection (pdf2md vs sphinx vs mdbook) — generic-эвристика на consecutive_pair_header достаточно широка и не привязана к конкретному конвертеру.
- Auto-merge заголовков в builder'е — нарушает принцип «MCP не модифицирует документ» из главного spec'а раздел 5.4.

## 2. Изменения

### 2.1 Удалить `TocNode.pdf_pages`

Поле и связанная логика (`assignPdfPages` в builder, ассертии в тестах, упоминание в descriptions) полностью удаляются.

Почему:
- Раздувает JSON для документов с PDF-маркерами (главный use case — datasheets).
- Привязка к конкретному формату pdf2md-claude — другие конвертеры PDF→Markdown маркеров не оставляют.
- Реальная польза — cross-reference с оригинальным PDF — достигается через `search("PDF_PAGE_BEGIN <N>", include_comments=true)`.

Что остаётся:
- `parsePdfPageMarkers(content)` — используется внутри detector'а для `Anomaly.context.adjacent_pdf_markers`.
- `Index.pdf_markers: PdfMarker[]` — массив всех маркеров документа, нужен detector'у.

### 2.2 JSON-compression: omit defaults

Сериализация TocNode и связанных структур пропускает поля со значениями default:

| Поле | Default | Поведение |
|---|---|---|
| `is_likely_artifact` | `false` | если `false` — поле не сериализуется |
| `numbering` | `null` | если `null` — не сериализуется |
| `artifact_reason` | `undefined` | уже не сериализуется |
| `children` | `[]` | если пустой массив — не сериализуется |

Реализуется как общий helper `compactToc(node)` который рекурсивно строит «компактный» вид. Применяется во всех tool responses: `view_toc`, `read_section.children`, `search.hits[].section`, `analyze_document.anomalies[]`.

Эффект на TRM `view_toc(depth=1)`: ожидаемо 25-35 KB вместо 68 KB.

### 2.3 view_toc API — добавить `start_id` и truncation-поля

#### Сигнатура input

```ts
view_toc({
  file_path: string,
  depth?: number | null,        // default null — вся глубина (но capped)
  start_id?: string,            // NEW: id узла-корня поддерева
  raw?: boolean,                // default false
})
```

Семантика `start_id`:
- Отсутствует → корень документа (как раньше).
- Указан → возвращается поддерево этого узла; `toc[]` содержит **непосредственных детей**. Сам узел не дублируется в массив (он подразумевается из запроса).
- Неизвестный → структурная ошибка (как unknown section_id в read_section).
- Cap применяется к поддереву как к самостоятельному графу — если subtree влезает в cap, выдаём целиком даже когда глобально документ слишком большой.

#### Дополнительные поля в response

```ts
{
  file: {...},
  toc: TocNode[],
  anomalies_summary: {...},

  truncated?: boolean,           // NEW: true если cap сработал
  effective_depth?: number,      // NEW: фактическая глубина после auto-reduce
  hint?: string,                 // NEW: подсказка агенту что делать
}
```

Поля появляются **только когда** `truncated === true`. Это сохраняет компактность ответа в типовом случае.

#### Cap-константа

`MAX_VIEW_TOC_BYTES = 25 * 1024` (25 600 bytes). Выбран с запасом ниже наблюдаемого порога редиректа клиента (>= 68 KB redirect'ило). Tuning через env var — будущее, не в этом spec'е.

### 2.4 Degradation алгоритм

Реализация в `view_toc_response.ts`:

```
1. effective_root := либо корень документа, либо subtree от start_id.
2. requested_depth := input.depth ?? 6 (максимум).
3. Iterative depth reduction. Для depth от requested_depth до 1:
   a. Построить trimmed tree глубины `depth` с применением JSON-compression.
   b. Подсчитать byte length JSON.stringify(response).
   c. Если ≤ MAX_VIEW_TOC_BYTES → return as-is.
4. Если даже depth=1 > cap (множество h1 на root level):
   → Вернуть префикс flat root-узлов до cap'а, set truncated=true, effective_depth=1.
   → hint: "Document has too many root sections (${total}). Returned first ${returned}. Use start_id to navigate further."
5. При срабатывании случая 3c (reduction with N→M, M<N):
   → truncated=true, effective_depth=M
   → hint: "Tree trimmed from depth ${N} to ${M}; use start_id=<a leaf id> to drill deeper."
```

Раунд cap-loop'а — 6 итераций максимум (depth 1..6). Каждая итерация делает `JSON.stringify` + recursive walk. На TRM это ~10 ms × 6 = ~60 ms — приемлемо.

#### raw mode + cap

В `raw=true` cap всё равно действует (flat list тоже может быть огромным). При срабатывании cap'а в raw mode возвращается prefix flat_headers до байтового лимита + `truncated: true`, `effective_depth: 1` (raw mode плоский — глубина всегда 1).

### 2.5 Новая аномалия `consecutive_pair_header`

#### Эвристика

Заголовок `H` помечается как `consecutive_pair_header` artifact когда **все** условия выполнены:

1. Существует следующий заголовок `H_next` в `flat_headers`.
2. `H.level === H_next.level`.
3. `H_next.line - H.line ≤ 3` (только пустые строки между).
4. `H.title` соответствует regex `/^(Chapter|Part|Section|Appendix)\s+([0-9IVX]+|[A-Z])$/i`.

Тогда:
- `H.is_likely_artifact = true`
- `H.artifact_reason = "consecutive_pair_header: generic marker '${H.title}' followed by '${H_next.title}'"`

#### Точность regex

- `"Chapter 5"` → match (generic numeric)
- `"Chapter 5 — Overview"` → NO match (содержательный, не generic)
- `"Part I"` → match (roman numeral)
- `"Appendix A"` → match (single letter)
- `"Introduction"` → NO match (не generic marker)

Regex strict (без trailing `.*`) намеренно: содержательные заголовки типа «Chapter 5: Architecture» не должны помечаться.

#### Тип Anomaly + context

```ts
type AnomalyType =
  | "self_nesting_header"
  | "level_jump"
  | "orphan_subheader"
  | "empty_section"
  | "consecutive_pair_header";   // NEW

type AnomalyContext = {
  preceding_real_header?: {...};
  following_real_header?: {...};
  duplicates_open_ancestor?: {...};   // self_nesting
  paired_with?: { line: number; title: string; level: number };   // NEW: для consecutive_pair_header
  adjacent_pdf_markers?: string[];
};
```

#### Поведение logical mode

Существующая логика `read_section(mode="logical")` поглощает adjacent `is_likely_artifact: true` узлы. Новый тип попадает под то же правило — никаких изменений в read_section не нужно.

Эффект на TRM: 118 h1 → ~35 «реальных» + ~50 помеченных как consecutive_pair artifact. После `mode: "logical"` агент видит чистую иерархию.

#### logical_effect для `consecutive_pair_header`

В `analyze_document` для аномалий этого типа `logical_effect.if_treated_as_artifact.section_extended` указывает на парный (содержательный) заголовок — он бы поглотил artifact-метку.

### 2.6 TRM как public fixture

Файл копируется в `tests/fixtures/public/esp32-p4-trm.md`. Лицензия — Espressif PDF-документация публична и распространяется свободно; markdown-конверсия (через pdf2md-claude) не нарушает их terms.

Repo вырастет на 5 MB. Это разумная цена за регрессионный тест на real-world-масштабе.

## 3. Тестирование

### 3.1 Новый stress-test файл

`tests/integration/stress_huge_document.test.ts`:

1. `view_toc(file_path=TRM)` без параметров → `truncated=true`, `effective_depth=1`, hint содержит `"start_id"`.
2. `JSON.stringify(response).length ≤ MAX_VIEW_TOC_BYTES`.
3. `view_toc(file_path=TRM, start_id=<id одного из h1>)` → возвращает subtree этой главы. Может быть полным до естественной глубины — зависит от размера subtree.
4. После consecutive_pair_header detection: count is_likely_artifact ≥ 30 (точное число будет известно после запуска; ожидание 50+).
5. `read_section({file_path: TRM, section_id: <первый из пары>, mode: "logical"})` корректно склеивает «Chapter N» с заголовком и возвращает объединённый content.
6. **Existing invariants (line-coverage, byte-reconstruction) продолжают держаться на TRM.** Это критично — изменения не должны нарушить no-content-loss.

### 3.2 Performance smoke

- `view_toc` cold-start на TRM (5.2 MB) — < 2 секунд (markdown-it парсинг доминирует).
- Subsequent calls (warm cache) — < 50 ms.
- Не gating CI — smoke только.

### 3.3 Unit-тесты

- `compactToc` helper: omit defaults, recursive, не мутирует входное дерево.
- `consecutive_pair_header` detector: 6+ cases (positive matches, negative matches — содержательный текст, разные level, дальнее расстояние, не-pair-pattern).
- Cap-loop: synthetic Index с known JSON size, проверка что reduction корректно срабатывает.

### 3.4 Что удаляется

- Тесты на `TocNode.pdf_pages` (builder.test.ts, view_toc.test.ts).
- `pdf_pages` ассерты в integration view_toc test (если есть).

### 3.5 Регрессионный набор

Все 141 существующих теста **должны продолжать проходить**. Это validated после имплементации.

## 4. Изменения в основном spec'е

В рамках PR-06.1 синхронизируется главный spec (`2026-05-14-markdown-docs-mcp-design.md`):

- Раздел 3.2 (view_toc): добавить `start_id` параметр, `truncated`/`effective_depth`/`hint` поля, упомянуть cap.
- Раздел 4.2 / 5.1: добавить `consecutive_pair_header` тип в перечисление AnomalyType.
- Раздел 9.3: добавить упоминание TRM как третьего public fixture для stress-тестов.
- Удалить упоминания `pdf_pages` из TocNode schema и связанных пассажей.
- Tick PR-06 checkbox остаётся (он уже отмечен), новый чекбокс PR-06.1 добавляется как промежуточный.

## 5. Не входит в PR-06.1

- MCP resources / streaming.
- Конфиг env-var для `MAX_VIEW_TOC_BYTES`.
- Document-format detection.
- Auto-merge consecutive headers в builder (мы пометили artifact'ы, но дерево остаётся as parser).
- Дополнительные anomaly types (если найдём при работе с TRM — отдельный PR).

## 6. Roadmap правок

PR-06.1 — single focused PR. Декомпозиция:

| Группа | Затрагиваемые файлы |
|---|---|
| Drop pdf_pages | `src/index/types.ts`, `src/index/builder.ts`, `tests/unit/index/builder.test.ts`, `tests/integration/view_toc.test.ts` |
| JSON compression helper | новый `src/tools/_compact.ts` + использование во всех tool response builders |
| start_id support | `src/schemas/inputs.ts`, `src/tools/view_toc_response.ts`, `src/schemas/descriptions.ts` |
| Cap + auto-reduce | `src/tools/view_toc_response.ts` (loop, truncated fields), `src/schemas/descriptions.ts` (упомянуть behavior) |
| consecutive_pair_header | `src/anomalies/types.ts`, `src/anomalies/detector.ts`, `src/index/builder.ts` |
| TRM fixture | `tests/fixtures/public/esp32-p4-trm.md` |
| stress-test | `tests/integration/stress_huge_document.test.ts` |
| Spec sync | `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` |

Ожидаемый объём: ~600-800 строк изменений + 5 MB fixture. Большой PR, но cohesive — все правки служат одной цели.

После merge PR-06.1 — пауза для ручного тестирования пользователем, затем переход к PR-07 (plugin packaging).

## 7. Открытые вопросы

Все архитектурные решения зафиксированы. Технические нюансы (точная форма JSON serialization helper, ровно где cap-loop проверяет size — на каждой итерации или только в финале) решаются в плане реализации.
