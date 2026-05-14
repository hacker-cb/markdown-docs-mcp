# markdown-docs-mcp — дизайн

Статус: дизайн утверждён, готово к написанию плана реализации.
Целевой репозиторий: https://github.com/hacker-cb/markdown-docs-mcp

## 1. Контекст и цели

### 1.1 Проблема

LLM-агенты, работающие с большими markdown-документами (datasheets, IEC/ISO стандарты, reference manuals), при использовании стандартного file-read инструмента сжигают контекст на чтение десятков тысяч строк ради нескольких разделов. Примеры реальных документов:

| Документ | Размер | Строк | Заголовков |
|---|---|---|---|
| ESP32-P4 datasheet | 246 KB | 9 000 | 177 |
| STM32H750IB datasheet | 1 MB | 36 500 | 193 |
| IEC 62386-209 (DALI Part 209) | 470 KB | 10 800 | 232 |

### 1.2 Цели

- Дать агенту три механизма работы с большими markdown без прямого чтения целиком: навигация по структуре, чтение конкретных разделов, поиск.
- Сохранять полную информацию о документе — никакая часть содержимого не должна пропадать вне зависимости от эвристик.
- Поставлять MCP-сервер как самостоятельный артефакт (npm-пакет), совместимый с любым MCP-клиентом. Claude Code plugin — отдельная обёртка для удобства Claude users, не блокирующее условие.
- Корректно обрабатывать markdown, сконвертированный из PDF — частый источник структурных артефактов (повторяющиеся заголовки, фейковые границы разделов).

### 1.3 Не-цели

- Семантический поиск через embeddings (overkill для технических документов с точными терминами).
- Модификация документов (read-only сервер).
- Парсинг таблиц и изображений в структурированные форматы.
- Поддержка не-markdown входов (HTML, PDF напрямую и т.п.).

## 2. Архитектура и дистрибуция

### 2.1 Что отгружается

Первичный артефакт — MCP-сервер. Claude Code plugin — один из вариантов обёртки поверх него.

1. **npm-пакет `markdown-docs-mcp`** (первичный) — исполняемый MCP-сервер (stdio transport). Self-contained: bundle на esbuild, ноль runtime-зависимостей, работает с любым MCP-совместимым клиентом. Это основной отгружаемый артефакт; всё остальное — обёртки.

2. **Claude Code plugin `markdown-docs`** (обёртка для удобства Claude Code users) — лежит в том же git-репо. Содержит `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (single-plugin marketplace под `hacker-cb` namespace) и корневой `.mcp.json` (запускает npm-пакет через `npx -y markdown-docs-mcp@<version>`). Plugin даёт one-click установку через Claude Code marketplace, но не является обязательным способом использования сервера.

**Skill в плагин НЕ входит** (решено в PR-07): tool descriptions в коде MCP-сервера (`src/schemas/descriptions.ts`) уже самодостаточны — содержат typical workflow, has_children-aware drill-down, scope-fallback hint, anomaly types и `mode="logical"` для PDF-артефактов. Skill добавил бы лишь PDF deep dive, что узко для general-markdown use case. Описания portable для других MCP-клиентов (Cursor / Continue), skill — нет.

Принцип: код MCP-сервера не знает про Claude plugin. Переменные типа `${CLAUDE_PLUGIN_ROOT}` живут только в `.mcp.json` плагина, не в коде сервера. Это сохраняет MCP-сервер портабельным для других MCP-клиентов и для будущих обёрток.

### 2.2 Связь между ними

`.mcp.json` плагина запускает MCP-сервер через npx с фиксированной версией:

```json
{
  "mcpServers": {
    "markdown-docs": {
      "command": "npx",
      "args": ["-y", "markdown-docs-mcp@0.1.0"]
    }
  }
}
```

Зафиксированная версия гарантирует совместимость skill'а и MCP. Release-скрипт синхронизирует версию в `package.json`, `.claude-plugin/plugin.json` и в `args` `.mcp.json` одним шагом.

### 2.3 Способы установки

Поддерживаются четыре варианта. Все они приводят к одному и тому же запущенному MCP-серверу, отличаются только удобством установки и сопутствующими артефактами (skill).

**А. Claude Code plugin (с skill, recommended для Claude Code users):**

```
/plugin marketplace add hacker-cb/markdown-docs-mcp
/plugin install markdown-docs@hacker-cb
```

Получает MCP-сервер + skill. По умолчанию глобально — skill активен во всех проектах. Project-scope доступен через стандартные механизмы Claude Code.

**Б. Прямое подключение MCP к Claude Code (без plugin, без skill):**

В `~/.claude/settings.json` (user-scope) или `<project>/.mcp.json` (project-scope) пользователь добавляет:

```json
{
  "mcpServers": {
    "markdown-docs": {
      "command": "npx",
      "args": ["-y", "markdown-docs-mcp"]
    }
  }
}
```

Полезно если пользователю не нужен skill, или он хочет version pinning по своим правилам.

**В. Подключение к любому MCP-совместимому клиенту:**

Тот же npx-вызов, формат конфига зависит от клиента. Cursor, Continue, и другие IDE/CLI с поддержкой MCP подключают наш сервер тем же способом — стандартный stdio MCP, никакой специфики Claude.

**Г. Локальная установка / разработка:**

```
git clone https://github.com/hacker-cb/markdown-docs-mcp
cd markdown-docs-mcp && pnpm install && pnpm build
claude --plugin-dir .                       # Claude Code, plugin mode
# или подключить ./dist/index.js напрямую в .mcp.json любого клиента
```

Используется для разработки и для случаев когда нужна непубличная версия сервера. Для запуска локальной сборки вместо npm-версии есть два рабочих варианта (выбор делается в плане реализации):

- Альтернативный `.mcp.json` в dev-копии плагина, переключающий `command` на `node ${CLAUDE_PLUGIN_ROOT}/dist/index.js`.
- `npm link` глобально + продакшен `.mcp.json` с `npx markdown-docs-mcp` — `npx` подхватит локальную сборку из линка.

В обоих случаях работа возможна без обращения к публичному npm-регистру.

## 3. API MCP-сервера

Четыре инструмента. Все принимают `file_path` (абсолютный путь к markdown-файлу) первым параметром.

### 3.1 Принцип: самодостаточные tool descriptions

MCP-сервер работает без skill — это базовая гарантия. Любой агент, у которого подключен наш сервер (Claude Code без plugin, Cursor, Continue, любой другой MCP-совместимый клиент), должен корректно использовать tools только по информации из `tools/list` (стандартный MCP discovery).

Поэтому tool descriptions внутри сервера являются самодостаточными:

- Каждый описывает когда tool применим и что значат параметры.
- Default-режимы и opt-in варианты явно проговорены (например, `read_section.mode: "raw"` default vs `"logical"` opt-in; `include_comments: false` default).
- Связи между tools отмечены: `view_toc.anomalies_summary.hint` подсказывает звать `analyze_document` при ненулевом `total`; `search.hits[].section.id` указывает на следующий шаг через `read_section`.
- Принципы no-content-loss и opaque section id упомянуты там, где это влияет на использование.

Skill (см. раздел 8) расширяет эту базу подсказками о типичных workflow и anti-patterns, но не заменяет её. Без skill MCP функционально работает; со skill агент использует его оптимально. Это degradation, не поломка, в сценариях без plugin.

### 3.2 view_toc

```ts
view_toc({
  file_path: string,
  depth?: number | null,      // default null = вся глубина
  start_id?: string,          // опаковый id из предыдущего view_toc для drill-down в поддерево
  raw?: boolean,              // default false; true отключает reparenting и пометки
}) => {
  file: {
    path: string,
    size_bytes: number,
    line_count: number,
    mtime: string,             // ISO-8601
    frontmatter?: object,      // YAML frontmatter если есть в начале файла
  },
  toc: TocNode[],
  anomalies_summary: {
    total: number,
    by_type: { [type: string]: number },
    hint?: string,             // присутствует если total > 0
  },
  truncated?: boolean,         // true если ответ был обрезан для укладки в cap
  effective_depth?: number,    // фактическая глубина после итеративного уменьшения
  hint?: string,               // подсказка как получить больше данных (start_id / depth)
}

type TocNode = {
  id: string,                  // "s<line>", напр. "s3929"
  level: 1 | 2 | 3 | 4 | 5 | 6,
  title: string,               // текст заголовка без # и без inline-markdown
  numbering: string | null,    // извлечённый префикс "4.1.1.2" / "A.1" / null
  line: number,                // 1-based строка заголовка
  line_end: number,            // последняя строка раздела (до следующего заголовка <= level)
  section_lines: number,       // line_end - line + 1, физический размер
  is_likely_artifact: boolean,
  artifact_reason?: string,
  has_children?: true,         // присутствует только если дети были обрезаны depth cap'ом
  children: TocNode[],
}
```

Поведение:

- Парсер строит плоский список заголовков, затем дерево через reparenting (при пропуске уровней узел крепится к ближайшему предку с меньшим уровнем).
- Узлы помечаются `is_likely_artifact: true` по эвристикам (см. раздел 5).
- Никакие узлы не удаляются. `line_end` — буквальный, по парсеру.
- При `raw: true` reparenting и пометки отключаются — чистый вывод парсера.
- **Server-side cap (default 50 KB, override via `MARKDOWN_DOCS_MAX_TOC_BYTES`):** для очень больших документов сервер итеративно уменьшает глубину дерева (от запрошенной до 1), пока compact-JSON ответ не уложится в cap. Если обрезка произошла — в ответ добавляются `truncated=true`, `effective_depth=N`, `hint` с инструкцией использовать `start_id`. Cap считается на той же compact-сериализации, которая фактически возвращается клиенту (без `JSON.stringify` indent), что исключает расхождение между измеренным и реальным размером payload. Верхний потолок env-var override — 500 KB (соответствует Claude Code `anthropic/maxResultSizeChars` ceiling).
- **MCP annotation:** при регистрации tool'а сервер передаёт `_meta["anthropic/maxResultSizeChars"]: 200000` — Claude Code v2.1.91+ читает эту аннотацию и не truncate'ит inline-display для ответов до 200K chars. Другие MCP-клиенты игнорируют поле.
- **`start_id`:** без него возвращается корень документа; с ним `toc[]` содержит прямых дочерних узлов указанного узла (drill-down в поддерево).
- **JSON-компрессия:** поля с default-значениями опускаются из сериализации: `numbering` опускается если `null`; `is_likely_artifact` — если `false`; `children` — если пустой массив. Все четыре tool'а отдают compact JSON (без indent) для минимизации agent context budget.

### 3.3 read_section

```ts
read_section({
  file_path: string,
  section_id: string,
  include_subsections?: boolean,   // default false
  mode?: "raw" | "logical",        // default "raw"
  include_comments?: boolean,      // default false
  from_line?: number,              // для continuation после truncation
}) => {
  section: {
    id: string,
    title: string,
    level: number,
    line: number,
    line_end: number,
    numbering: string | null,
  },
  content: string,
  children?: TocNode[],             // если include_subsections=false и есть дочерние
  expansion?: {                     // только в mode="logical" если что-то было поглощено
    raw_line_end: number,
    logical_line_end: number,
    artifacts_absorbed: { id, line, title, would_have_owned_lines }[],
  },
  truncated?: boolean,
  truncated_at_line?: number,
}
```

Поведение по умолчанию (`mode: "raw"`):

- Возвращается текст от строки заголовка до `line_end` парсера.
- Если `include_subsections: false`, возврат обрезается на первом дочернем заголовке, в `children` возвращается мини-TOC.
- Если `include_comments: false` (default), HTML-комментарии вырезаются из content (но абсолютные line numbers не пересчитываются — gaps видны).
- Hard cap на `response.content` (default 200 KB, override via `MARKDOWN_DOCS_MAX_SECTION_BYTES`, ceiling 500 KB); превышение — `truncated: true`, `truncated_at_line: N`. Continuation через `from_line: N+1`. Tool регистрируется с тем же `_meta["anthropic/maxResultSizeChars"]: 200000` annotation для Claude Code.

Поведение `mode: "logical"`:

- Раздел расширяется до следующего НЕ-artifact заголовка уровня <= target.
- Поглощённые artifact-узлы перечисляются в `expansion.artifacts_absorbed` явно — агент всегда видит, какое содержимое было присоединено.

Ошибки:

- `section_id` не найден — error с предложением похожих id (или ссылкой на view_toc).
- file_path не существует / не читается — стандартная MCP-ошибка.

### 3.4 search

```ts
search({
  file_path: string,
  query: string,
  regex?: boolean,                              // default false
  case_sensitive?: boolean,                     // default false для literal, true для regex
  scope?: "all" | "titles" | "content",         // default "all"
  max_results?: number,                         // default 50
  context_lines?: number,                       // default 2
  include_comments?: boolean,                   // default false
}) => {
  hits: {
    line: number,
    snippet: string,                            // строки [line - context .. line + context]
    matched_text: string,                       // что именно сматчилось
    section: { id, title, level, numbering },   // ближайший родительский заголовок
    in: "title" | "content",
  }[],
  total_matches: number,
  truncated: boolean,                           // true если упёрлись в max_results
}
```

Поведение:

- Поиск по обоим scope (titles + content) по умолчанию.
- Literal substring — case-insensitive; regex — case-sensitive (стандартная семантика, можно переопределить флагом).
- Snippets не пересекают границы разделов (если match близко к границе, snippet обрезается).
- Комментарии исключаются из области поиска по default.

### 3.5 analyze_document

```ts
analyze_document({
  file_path: string,
}) => {
  file: { /* как в view_toc.file */ },
  summary: string,                              // человеко-читаемое резюме
  anomalies: Anomaly[],
  by_type: { [type: string]: number },
}

type Anomaly = {
  id: string,                                   // "a1", "a2", ...
  type: "self_nesting_header" | "level_jump" | "orphan_subheader" | "empty_section",
  line: number,
  raw_text: string,
  context: {
    preceding_real_header?: { line, title, level },
    following_real_header?: { line, title, level },
    duplicates_open_ancestor?: { line, title, level },   // для self_nesting
    adjacent_pdf_markers?: string[],                      // напр. ["L3932 PDF_PAGE_END 38"]
  },
  description: string,
  logical_effect?: {
    if_treated_as_artifact: {
      section_extended: string,                  // "h42 (4.1.1.2 RISC-V Trace Encoder)"
      extension: string,                         // "L3929-L3934 (6 lines) -> L3929-L3961 (33 lines)"
    },
  },
}
```

Назначение:

- Дать агенту достаточно контекста, чтобы сформулировать пользователю предложение по работе с документом на естественном языке. MCP не предлагает конкретных правок — это работа агента совместно с пользователем.
- `logical_effect` показывает цену интерпретации каждой аномалии как артефакта — на сколько вырастет какой раздел.

## 4. Heading model

### 4.1 Адресация — синтетический id

`id = "s" + <номер строки заголовка>`. Например, `s3929`.

- Уникален (один заголовок на строку).
- Стабилен при неизменности файла (mtime + size). При изменении файла кэш индекса инвалидируется, новый view_toc выдаёт свежие id.
- Опаковый для агента: id не следует конструировать из нумерации title.

### 4.2 title и numbering

`title` — текст заголовка как в документе (без `#` и без inline-markdown типа `**`). Сохраняется буквально, без транслитерации, slug'ов, нормализации Unicode.

`numbering` — опциональное извлечённое поле. Извлекается простым regex на префикс title:

- `^\d+(\.\d+)*\s+` — чисто числовая: `4.1.1.2`
- `^[A-Z]+(\.\d+)*\s+` — алфавитно-числовая: `A.1`, `B.2.3`
- `^Annex\s+([A-Z](\.\d+)*)\s+` — Annex-стиль: `A.1`
- Иначе — `null`

`numbering` используется для удобства в чате (агент говорит «раздел 4.1.1.2» вместо «s3929») и потенциальной фильтрации в `view_toc` в будущих версиях.

`null` — нормальное состояние для FOREWORD, Introduction, Examples, generic headings. Поиск и навигация работают независимо от наличия numbering.

### 4.3 Примеры

| Заголовок в документе | id | title | numbering |
|---|---|---|---|
| `#### 4.1.1.2 RISC-V Trace Encoder (TRACE)` | `s3929` | `4.1.1.2 RISC-V Trace Encoder (TRACE)` | `"4.1.1.2"` |
| `## FOREWORD` | `s5` | `FOREWORD` | `null` |
| `## 1 Scope` | `s32` | `1 Scope` | `"1"` |
| `## Annex A.1 Examples` (теоретический) | `s99` | `Annex A.1 Examples` | `"A.1"` |
| `# Getting Started` | `s1` | `Getting Started` | `null` |

## 5. Аномалии и санитизация

### 5.1 Типы аномалий MVP

- `self_nesting_header` — заголовок дублирует один из своих открытых предков по иерархии (например, `## 4 Functional Description` внутри уже открытого `## 4 Functional Description`). Структурно невозможно для легитимного документа — раздел не может быть подразделом самого себя. Главный источник на наших fixtures: PDF page header, попавший в markdown при конверсии.

- `level_jump` — после reparenting'а узел всё ещё имеет родителя с `level < current.level - 1` (пропуск более одного уровня). На наших fixtures этим типом ничего не помечается — все прыжки в ESP32 вызваны self_nesting'ами и лечатся reparenting'ом. Тип оставлен для будущих случаев.

- `orphan_subheader` — первый заголовок документа имеет уровень больше 1. Часто встречается (h1 в frontmatter или filename, документ начинается с h2). Information-only, чаще всего легитимно.

- `empty_section` — заголовок без содержимого до следующего заголовка. Information-only.

- `consecutive_pair_header` — два соседних заголовка одного уровня, где первый является «голым маркером» (matching `PAIR_MARKER_RE = /^(Chapter|Part|Section|Appendix)\s+([0-9IVX]+|[A-Z])$/i`, например `Chapter 5`, `Part I`, `Section 3`), а второй стоит на расстоянии ≤ 3 строк. Такие пары характерны для pdf2md-конверсии, где маркер главы отдельно от её названия. Маркер помечается `is_likely_artifact: true`; `context.paired_with` содержит line/title/level второго заголовка.

### 5.2 Эвристика self_nesting

Заголовок `H` помечается `is_likely_artifact: true` тогда и только тогда, когда:

1. В цепочке открытых предков `H` на момент его появления в файле уже есть заголовок с тем же `title` (буквальное сравнение после нормализации whitespace).

Это структурное условие, а не сходство. Глобальные повторы заголовков в разных ветках документа (типа `Examples` в Annex A и Annex B) не помечаются.

В `analyze_document` дополнительно учитывается соседство с PDF-маркерами `<!-- PDF_PAGE_BEGIN/END N -->` — это независимое подтверждение природы артефакта. Эта проверка не влияет на флаг (флаг даёт self_nesting), но обогащает `context.adjacent_pdf_markers` в отчёте.

### 5.3 Reparenting

Алгоритм построения дерева:

- Поддерживается стек открытых родителей.
- Для каждого нового заголовка снимаем со стека всех предков с `level >= current.level`.
- Если на стеке остался предок — текущий заголовок становится его ребёнком.
- Иначе — текущий заголовок корневой.

Это стандартный алгоритм построения иерархии из плоского списка с устойчивостью к пропуску уровней. Reparenting не зависит от пометок artifact.

### 5.4 Принцип «no content loss»

Инвариант: объединение `[node.line .. node.line_end]` всех узлов TOC покрывает строки `[1 .. file.line_count]` без пропусков и без перекрытий.

Из этого следует:

- В default-режиме (`mode: "raw"`) каждая строка документа доступна через ровно один узел TOC. Контент artifact-узлов не теряется — они владеют своими строками так же, как и не-artifact узлы.
- `read_section` с `mode: "raw"` возвращает буквальные границы парсера. Эвристика artifact не участвует в default-чтении.
- Расширение границ через `mode: "logical"` опционально, агент явно соглашается. В ответе перечислены поглощённые узлы.

Этот инвариант проверяется автоматическими тестами на каждом fixture (см. раздел 9).

## 6. HTML-комментарии

Поведение по default (`include_comments: false`):

| Контекст | Эффект |
|---|---|
| view_toc | Комментарии не влияют на заголовки (у них нет `#`). На `line_end` не влияют. |
| read_section content | Комментарии вырезаются из текста. Line numbers абсолютные — gaps видны. |
| search | Комментарии не сканируются. `search("PAGE_END")` вернёт 0 hits. |
| section_lines | Считаются ВСЕ строки между заголовками as-is (физический размер). |

Escape hatch — `include_comments: true` в `read_section` и `search` возвращает текст с комментариями as-is.

Внутреннее использование комментариев в `analyze_document` (поле `adjacent_pdf_markers`) сохраняется — это диагностика, не пользовательский контент.

Поддержка многострочных комментариев: парсер корректно распознаёт блок `<!-- ... -->` независимо от переводов строк (стандартная функциональность markdown-it).

## 7. Индексация и кэш

### 7.1 Подход

- In-memory LRU кэш в процессе MCP-сервера: `Map<canonicalPath, Index>`.
- Размер кэша: 10 документов (избыточно для типовых сценариев, нет смысла усложнять).
- Ключ инвалидации: `(mtimeMs, size_bytes)` — при mismatch при следующем обращении индекс пересоздаётся.
- Disk-cache — НЕ делаем в MVP. Время первичной индексации STM32 (1 MB) на современном железе — десятки миллисекунд через markdown-it; npx cold start доминирует. Disk-cache добавим только если профайлинг покажет узкое место.

### 7.2 Ориентировочная структура индекса

Точная структура определяется на этапе плана реализации. Концептуально индекс хранит:

- Полный текст файла (для read_section).
- Маппинг line -> char-offset (для O(1) выборки диапазонов).
- Дерево TOC после reparenting'а и расстановки флагов artifact.
- Плоский список заголовков (для поиска по titles).
- Диапазоны строк с HTML-комментариями (для skip при чтении и поиске).
- Список аномалий с контекстом для analyze_document.
- Распарсенный YAML frontmatter если был.
- Метаданные файла (size, mtime) для инвалидации.

### 7.3 Стартап MCP

Под npx первый запуск в сессии — несколько секунд (скачивание + распаковка). Последующие — мгновенно (npx-кэш). Сервер сам стартует за <100ms (markdown-it bundle, нет lazy-load зависимостей).

Первый view_toc на 1 MB документе — ~50-200 ms (одноразовая индексация). После — миллисекунды для любых tool-вызовов.

## 8. Skill — удалён в PR-07

Skill `reading-large-markdown` исходно предполагался, но в PR-07 принято решение **не отгружать его в составе плагина**.

Причины:

- Tool descriptions (`src/schemas/descriptions.ts`) после PR-06.2 / 06.3 / 06.4 уже несут весь workflow: `Typical workflow` блок в `VIEW_TOC_DESCRIPTION`, `has_children`-aware drill-down, scope-fallback hint в search, описание anomaly types и `mode="logical"` для PDF-артефактов.
- Descriptions всегда видны агенту через `tools/list` — работают в любом MCP-клиенте (Cursor, Continue, Claude Desktop). Skill активируется только в Claude Code и только по триггерам.
- Single deep dive, который реально не помещается в descriptions, — это PDF-конвертированные документы. Но MCP general-purpose: работает с любыми markdown (datasheets, IEC, README, manuals); PDF-handling — частный случай. Узкий skill про PDF не оправдан.

Если в будущем понадобится skill — он останется отдельным проектом и сможет переиспользовать наш MCP без изменений в этом репо.

## 9. Тестирование

### 9.1 Структура

- `tests/unit/` — парсер, эвристика artifact, TOC builder, sanitization, search, обработка комментариев. Используются маленькие inline-фикстуры markdown.
- `tests/integration/` — реальные fixtures, end-to-end вызовы MCP через JSON-RPC stdin/stdout.
- `tests/fixtures/public/` — `esp32-p4-datasheet.md`, `stm32h750ib.md`, `esp32-p4-trm.md` (ESP32-P4 Technical Reference Manual, ~143k строк, 2011 заголовков; stress fixture для тестирования view_toc cap и consecutive_pair_header). Все коммитятся в репо.
- `tests/fixtures/private/` — gitignored. Локально содержит `IEC-62386-209-2011.md`. Тесты на private fixtures graceful skip если папка пуста (CI / чужие машины не падают).
- Будущие fixtures — авто-подхватываются glob'ом в `tests/fixtures/public/**.md` и `tests/fixtures/private/**.md`.

### 9.2 Инварианты «no content loss»

Для каждого fixture (public + private если доступны):

1. **Line coverage:** объединение `[node.line .. node.line_end]` всех узлов TOC == `[1 .. file.line_count]`. Без пропусков, без перекрытий.

2. **Byte reconstruction:** конкатенация `read_section(id, mode="raw", include_comments=true)` для всех узлов в обходе TOC даёт исходный файл побайтово (плюс корректная обработка переводов строк).

Эти два теста — основа гарантии что эвристики не теряют данные.

### 9.3 Дополнительные интеграционные проверки

- ESP32: `analyze_document` возвращает >= 20 self_nesting аномалий, все с `adjacent_pdf_markers`.
- STM32: `analyze_document` возвращает 0 self_nesting аномалий (чистая иерархия).
- DALI (если доступен private): 0 self_nesting аномалий, корректная обработка FOREWORD без numbering.
- ESP32 mode="logical" для раздела `4.1.1.2 RISC-V Trace Encoder`: возвращает >= 33 строки контента, `expansion.artifacts_absorbed` содержит фейковый `## 4 Functional Description` на L3935.

### 9.4 Performance smoke-tests

- view_toc на STM32 (1 MB) — < 500 ms на cold start (включая индексацию).
- read_section на любом разделе — < 50 ms warm.
- 100 последовательных search-запросов с разными query — < 1 секунды cumulative.

Не critical-path тесты; в CI могут быть skipping на медленных runner'ах.

## 10. Build / CI / Release

### 10.1 Build

- Single-file bundle через esbuild: `src/index.ts` -> `dist/index.js`. Большинство runtime deps вкомпилены в bundle. Исключение: `gray-matter` помечен `external` в esbuild config из-за dynamic `require("fs")`, который не работает в ESM-бандле; npm install / npx подтягивают его автоматически как обычный transitive dep.
- target: `node20` (LTS) — node18 вышел из active LTS в апреле 2025; обновление зафиксировано в PR-01.
- `dist/` gitignored. Собирается в CI перед npm publish и перед запуском integration-тестов.

### 10.2 GitHub Actions

- **`.github/workflows/test.yml`** — PR / push на `dev` / `master` / feature-ветку: `pnpm install --frozen-lockfile && pnpm typecheck && pnpm test && pnpm build` на матрице Node 20 / 22.
- **`.github/workflows/release.yml`** — trigger на `push` тега `v*`: тот же test + build, затем `npm publish --provenance --access public` через **npm Trusted Publisher (OIDC)** + создание GitHub Release через `softprops/action-gh-release@v2 (generate_release_notes: true)`. `permissions: id-token: write` нужен для OIDC; `NPM_TOKEN` секрет **не используется**.

### 10.3 Release flow

Single source of truth — `package.json` version. Скрипт `scripts/release.mjs` атомарно проставляет одну и ту же версию в 4 места:

| Файл | Где обновляется |
|---|---|
| `package.json` | `.version` |
| `.claude-plugin/plugin.json` | `.version` |
| `.claude-plugin/marketplace.json` | `.plugins[0].version` |
| `.mcp.json` | `.mcpServers["markdown-docs"].args[1]` (`markdown-docs-mcp@<version>`) |

Workflow:

1. Чекаут `master`, `git pull --ff-only`.
2. `pnpm release X.Y.Z` (или `--dry-run X.Y.Z` для предпросмотра diff'ов). Скрипт: валидирует semver → пишет 4 файла → `git add` → `git commit -m "release: vX.Y.Z"` → `git tag vX.Y.Z`. Не пушит.
3. Локальная проверка: `pnpm test && pnpm build`.
4. `git push --follow-tags origin master` — пушит commit и tag.
5. GitHub Actions release.yml: тестирует, билдит, `npm publish --provenance` (OIDC), создаёт GitHub Release.

Чтобы первый publish прошёл — нужно разово настроить **npm Trusted Publisher** на npmjs.com (Account → Trusted Publishers → добавить `hacker-cb/markdown-docs-mcp` + workflow path `.github/workflows/release.yml`). После этого никаких секретов в GitHub не требуется — OIDC-токен выдаётся в момент publish'а.

Скрипт защищён от запуска не из `master` (override через `--force` для rehearsal). Тесты `tests/unit/release_script.test.ts` проверяют пуристый transform `applyVersionToFiles` независимо от git/файловой системы.

### 10.4 Версионирование

- Семантическое: `0.x.x` до публичного API stability, `1.0.0+` после.
- В git ветки `dev` / `master` — по конвенции проектов hacker-cb (`master` создаётся при первом релизе, до этого только `dev`).

### 10.5 Конфигурация через окружение

Сервер читает 2 env vars при старте (`src/config.ts:loadConfig`):

| Variable                              | Default  | Cap     | Назначение                                       |
| ------------------------------------- | -------- | ------- | ------------------------------------------------ |
| `MARKDOWN_DOCS_MAX_TOC_BYTES`         | 51 200   | 500 000 | Cap на compact-JSON `view_toc` response          |
| `MARKDOWN_DOCS_MAX_SECTION_BYTES`     | 204 800  | 500 000 | Cap на `read_section.content` (раздел документа) |

Ceiling 500 000 соответствует Claude Code `_meta["anthropic/maxResultSizeChars"]` annotation, которую сервер выставляет на 200 000 при регистрации `view_toc` и `read_section`. Невалидные значения env (non-integer / ≤ 0) — warn в stderr и fallback на default; сервер не падает. Значения > 500 000 — warn и clamp к ceiling.

Тонкости:

- Cap считается на compact-JSON (`JSON.stringify(response)` без indent) — это та же сериализация, которая фактически отдаётся клиенту. Раньше (до PR-06.3) cap измерял compact, а tool отдавал pretty-print с indent=2 — расхождение ~40% делало контракт `truncated` ненадёжным.
- Все 4 tool'а отдают compact JSON. Для search и analyze_document cap не применяется — их ответы limited by `max_results` и количеством аномалий.
- В тестах cap инжектится через `createServer({ cache, config: { maxViewTocBytes: ..., maxSectionBytes: ... } })` для проверки поведения cap-loop'а независимо от размера fixture.

## 11. Структура репозитория

```
markdown-docs-mcp/
  .claude-plugin/
    plugin.json
    marketplace.json
  .mcp.json
  src/
    index.ts                     # MCP entry, stdio transport setup
    server.ts                    # tool handlers
    parser/
      markdown.ts                # markdown-it wrapper, heading extraction
      comments.ts                # HTML-комментарии: распознавание, фильтрация
      frontmatter.ts             # YAML frontmatter parsing
      numbering.ts               # извлечение numbering из title
    index/
      builder.ts                 # построение Index из файла
      cache.ts                   # LRU + mtime invalidation
      reparenting.ts             # построение дерева с reparenting
    anomalies/
      detector.ts                # self_nesting, level_jump, orphan_subheader, empty_section
    tools/
      view_toc.ts
      read_section.ts
      search.ts
      analyze_document.ts
    schemas/
      input.ts                   # Zod input schemas
      output.ts                  # Zod output schemas
  tests/
    unit/
      ...
    integration/
      invariants.test.ts         # line coverage, byte reconstruction
      esp32.test.ts
      stm32.test.ts
      dali.test.ts               # skip if private fixture missing
    fixtures/
      public/
        esp32-p4-datasheet.md
        stm32h750ib.md
      private/
        .gitkeep
  .github/
    workflows/
      test.yml
      release.yml
  package.json
  pnpm-lock.yaml
  tsconfig.json
  esbuild.config.mjs
  .gitignore
  LICENSE
  README.md
```

## 12. README — что упомянуть

- Краткое описание (MCP + skill для больших markdown).
- Установка через plugin marketplace.
- Available tools (краткий справочник).
- Раздел про test fixtures: ESP32-P4 и STM32H750IB сконвертированы из официальных PDF через [pdf2md-claude](https://github.com/hacker-cb/pdf2md-claude); маркеры `<!-- PDF_PAGE_BEGIN/END -->` и self-nesting заголовки — нормальные артефакты конверсии, обрабатываются `analyze_document`.
- Локальная разработка (`--plugin-dir`).
- License.

## 13. Не входит в MVP

- Семантический поиск через embeddings.
- Парсинг таблиц в JSON / structured формат.
- Парсинг изображений / OCR.
- Disk-кэш индекса.
- Write-операции (правка markdown).
- find_by_pdf_page tool (агент справится через search с include_comments=true).
- numbering_filter в view_toc (если понадобится — добавим позже).
- Performance benchmarks в CI как gating condition (smoke-tests только).
- Обёртки для других платформ (Cursor extension, Copilot CLI plugin, Gemini CLI extension и т.п.). Сам MCP-сервер уже работает с любым MCP-совместимым клиентом через стандартный stdio — никаких изменений в коде сервера не потребуется. Платформенные обёртки (аналог нашего Claude plugin) — отдельная работа, выполняется по мере появления спроса.

## 14. Открытые вопросы

Все ключевые решения зафиксированы в этом spec'е. Открытых архитектурных вопросов на момент написания нет. Технические детали реализации (точный формат marketplace.json, конкретные esbuild опции, выбор библиотеки для frontmatter parsing) решаются в плане реализации.

## 15. Roadmap реализации

Декомпозиция работы на серию PR. Статус каждого PR трекается чекбоксом — отмечается в финальном коммите каждого PR перед merge'ом. Per-PR планы живут отдельно в `docs/superpowers/plans/<date>-pr-NN-<slug>.md` (по `working-on-large-tasks` skill).

- [x] **PR-01: Bootstrap** — `package.json`, `tsconfig.json`, esbuild config, vitest config, GitHub Actions test workflow, LICENSE, README skeleton, public fixtures (`esp32-p4-datasheet.md`, `stm32h750ib.md`). Без логики MCP.

- [x] **PR-02: MCP server skeleton** — stdio entry (`src/index.ts`), Zod schemas (`src/schemas/`), регистрация четырёх tools через стандартный `tools/list`. Tools возвращают `not_implemented` error до своей очереди. Базовый JSON-RPC integration test (handshake + список tools).

- [x] **PR-03: Parser + indexing core** — `src/parser/*` (markdown-it wrapper, comments, frontmatter, numbering), `src/index/*` (builder, LRU cache, reparenting). Unit-тесты на inline-фикстурах. Tools всё ещё возвращают `not_implemented`.

- [x] **PR-04: view_toc + anomalies** — реализация `view_toc` tool, anomalies detector (`self_nesting_header`, `level_jump`, `orphan_subheader`, `empty_section`). Integration test на public fixtures + line-coverage invariant («no content loss»).

- [x] **PR-05: read_section** — `raw` + `logical` modes, `include_subsections`, `include_comments`, truncation с hard cap 200 KB + continuation через `from_line`. Byte-reconstruction invariant на public fixtures.

- [x] **PR-06: search + analyze_document** — оба оставшихся tool'а. `search` с `scope`, `regex`, `case_sensitive`, `context_lines`. `analyze_document` с `logical_effect` и `adjacent_pdf_markers`. Integration tests.

- [x] **PR-06.1: Huge documents support** — view_toc cap + start_id, JSON compression, consecutive_pair_header anomaly, TRM stress fixture. (Подробности: docs/superpowers/specs/2026-05-14-huge-documents-support-design.md)

- [x] **PR-06.2: has_children + workflow hint** — view_toc nodes carry has_children:true when children were trimmed; description gains workflow block. (Refinement of PR-06.1 after manual testing.)

- [x] **PR-06.3: cap-fix + env config + maxResultSizeChars** — compact JSON во всех 4 tools (cap и output теперь меряются на одном представлении), env-vars `MARKDOWN_DOCS_MAX_TOC_BYTES` / `MARKDOWN_DOCS_MAX_SECTION_BYTES` для override (defaults 50 / 200 KB, ceiling 500 KB), Claude Code `_meta["anthropic/maxResultSizeChars"]: 200000` annotation на view_toc и read_section.

- [x] **PR-07: Plugin packaging** — `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.mcp.json` (запускает npm-пакет через `npx -y markdown-docs-mcp@<version>`), cross-file invariants test. Skill решено не отгружать (см. section 8). Manual smoke test через `/plugin marketplace add hacker-cb/markdown-docs-mcp`.

- [x] **PR-08: Release pipeline** — `scripts/release.mjs` (атомарная синхронизация версий в 4 файлах), `.github/workflows/release.yml` (test + build + `npm publish --provenance` через Trusted Publisher OIDC + GitHub Release), pure-transform unit-тесты на release-script, README с актуальной installation секцией. Trusted Publisher настройка на npmjs.com выполняется автором разово вне репо.

После merge всех PR — `cleanup-superpowers-plans` (Mode C) для уборки per-PR планов и этого spec'а, если он перестаёт быть нужен.
