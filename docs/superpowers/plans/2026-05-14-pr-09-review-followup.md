# PR-09: code-review follow-up — план

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Закрыть 2 Critical + 1 Important + 1 Minor находки полного code review проекта (catch-up review для PR-01..PR-08, которые шли без Copilot).

**Architecture:** Маленький fixup PR без новой функциональности. Только устранение spec-deviations и misleading документации, выявленных reviewer'ом.

**Связь:** Идёт между PR-08 (release pipeline) и первым `npm publish`. После merge PR-09 — Trusted Publisher setup пользователем + `pnpm release 0.1.0`.

**Ветка:** `pr-09-review-followup` от `dev`.

---

## Reviewer findings → scope PR-09

| Severity | Finding | Действие |
|---|---|---|
| 🔴 Critical #1 | `src/server.ts:38` hard-codes `version: "0.1.0"` — 5-й источник версии, не покрытый `release.mjs` | Читать `version` из `package.json` через `fs.readFileSync` + `import.meta.url`. Добавить assertion в plugin_manifest test. |
| 🔴 Critical #2 | `VIEW_TOC_DESCRIPTION` упоминает «25 KB» — устарело после PR-06.3 (default = 50 KB) | Интерполировать default cap из `DEFAULT_CONFIG.maxViewTocBytes`. Аналогично для read_section. |
| 🟡 Important #6 | `rawFlatCompact` всегда возвращает `line_end: h.line, section_lines: 1` — lies | Использовать реальный line_end/section_lines из TocNode (lookup по id). |
| 🟢 Minor #12 | README `Status:` line устарел после PR-08 (release pipeline shipped) | Обновить или убрать. |

**Отложенные (вне scope PR-09):**

- 🟡 #3 regex DoS в search — нужна re2 dep или timeout-loop
- 🟡 #4 concurrent `getOrBuild` race в cache — нужен in-flight Promise map
- 🟡 #5 `stripComments` O(N×ranges) — оптимизация при больших caps

Эти 3 — известные ограничения, не блокеры. Создаются как TODO в spec section 13 («не входит в MVP»).

---

## Файлы

**Modify:**
- `src/server.ts` — читать `version` из `package.json` runtime (через `import.meta.url`).
- `src/schemas/descriptions.ts` — динамическая подстановка cap из config.
- `src/tools/view_toc_response.ts` — `rawFlatCompact` использует TocNode.line_end/section_lines (lookup через map).
- `src/index/types.ts` — возможно расширить `FlatHeader` полями `line_end`, `section_lines`, ИЛИ builder передаёт TocNode-map в response builder.
- `src/index/builder.ts` — если расширяем FlatHeader: populate новые поля.
- `tests/unit/plugin_manifest.test.ts` — добавить assertion: server-reported version === package.json.version (через `client.getServerVersion()` или подобное).
- `tests/unit/tools/view_toc_response.test.ts` или `tests/integration/view_toc.test.ts` — добавить тест что `raw=true` возвращает реальный line_end (не == line).
- `README.md` — обновить `Status` блок.
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` — section 13 (не входит в MVP) — добавить deferred items; section 15 — `[x] PR-09`.

**НЕ модифицировать:**
- Production caps / annotation values — корректны.
- Anomaly detection, indexer reparenting — не задеты review'ом.
- `.mcp.json`, plugin.json, marketplace.json — версии обновляются `release.mjs`.

---

## Реализация по пунктам

### #1: server.ts version из package.json

```ts
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// repo: src/server.ts → ../package.json; npm: dist/index.js → ../package.json
const pkg = JSON.parse(readFileSync(resolve(here, "..", "package.json"), "utf8"));

// in createServer:
const server = new McpServer({ name: "markdown-docs", version: pkg.version });
```

Lazy чтение внутри `createServer` (а не глобально) — упростит test isolation.

### #2: descriptions с реальным cap

Превратить `VIEW_TOC_DESCRIPTION` и `READ_SECTION_DESCRIPTION` из плоских констант в функции либо в `getDescriptions(config)` factory. createServer передаёт config → factory строит описания с реальными числами.

```ts
export const VIEW_TOC_DESCRIPTION = (config: Config) => `...
server-capped at ${formatKB(config.maxViewTocBytes)} KB...`;
```

### #6: rawFlatCompact use real line_end

Два варианта:

A) **Lookup через map.** В response-builder перед `rawFlatCompact` собрать `Map<id, TocNode>` из `index.toc`, пробросить в helper. По O(N) build + O(1) lookup.

B) **Расширить FlatHeader** полями `line_end`, `section_lines`. Builder уже знает их при построении.

Идём по (B) — меньше callsites, простая правка.

### #12: README Status

Заменить «Status: under active development before first release» на короткий бейдж версии (после первого publish) или «v0.1.0 ready to publish». Сейчас — убрать строку, пусть бейдж появится в PR после публикации.

---

## Задачи

### Task 1: server.ts read version from package.json

- [ ] **Step 1.1:** Modify `src/server.ts` — runtime version read.
- [ ] **Step 1.2:** Verify via `pnpm dev` (или test) что server registers с правильной версией.

### Task 2: Dynamic VIEW_TOC / READ_SECTION descriptions

- [ ] **Step 2.1:** Превратить descriptions в factory functions.
- [ ] **Step 2.2:** server.ts передаёт config в descriptions.
- [ ] **Step 2.3:** Update existing test что `description.length > 200` все ещё проходит.

### Task 3: rawFlatCompact real line_end

- [ ] **Step 3.1:** Extend `FlatHeader` type с `line_end`, `section_lines`.
- [ ] **Step 3.2:** Update builder population.
- [ ] **Step 3.3:** `rawFlatCompact` использует новые поля.
- [ ] **Step 3.4:** Test: `view_toc(raw=true)` на STM32 возвращает несколько узлов с `line_end !== line`.

### Task 4: plugin_manifest test extension

- [ ] **Step 4.1:** Через `client.getServerVersion()` или сервер `initialize` capability получить version.
- [ ] **Step 4.2:** Assert === `package.json.version`.

### Task 5: README + spec finalization

- [ ] **Step 5.1:** Update README Status.
- [ ] **Step 5.2:** Spec section 13 — добавить deferred items (#3, #4, #5).
- [ ] **Step 5.3:** Spec section 15 — `[x] PR-09`.

### Task 6: Final pipeline

- [ ] **Step 6.1:** `pnpm typecheck && pnpm test && pnpm build` green.
- [ ] **Step 6.2:** Commit + push + PR + Copilot review + merge.

---

## Acceptance criteria

После merge PR-09:

1. `pnpm typecheck && pnpm test && pnpm build` green.
2. `pnpm release --dry-run 0.2.0` показывает diff 4 файлов как раньше; **plus** runtime test что server-reported version совпадает с package.json (5-я invariant).
3. `tools/list` теперь упоминает cap «50 KB» в view_toc description (или интерполируется из config).
4. `view_toc(file_path, raw=true)` возвращает реальный `line_end` для каждого узла (не равный `line`).
5. README не содержит устаревший «under active development» статус.
6. Spec section 13 (не входит в MVP) обновлена с 3 deferred items.

## Anti-patterns

- Не делать новых фичей.
- Не оптимизировать stripComments/cache race в этом PR — это отложено сознательно.
- Не вшивать version в build-time через esbuild define — runtime read проще и работает в `tsx` dev mode.
