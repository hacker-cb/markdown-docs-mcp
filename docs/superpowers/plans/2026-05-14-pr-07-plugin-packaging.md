# PR-07: plugin packaging (без skill) — план

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Сделать `markdown-docs-mcp` устанавливаемым Claude Code plugin'ом через `/plugin marketplace add hacker-cb/markdown-docs-mcp`. Плагин — тонкая обёртка над npm-пакетом: `.mcp.json` запускает сервер через `npx markdown-docs-mcp@<version>`. Skill **не входит** в комплект — descriptions в коде MCP-сервера уже self-contained и портабельны для других MCP-клиентов (см. обсуждение перед PR-07).

**Architecture:**
- `.claude-plugin/plugin.json` — plugin manifest (минимальный)
- `.claude-plugin/marketplace.json` — single-plugin marketplace (`hacker-cb` namespace)
- `.mcp.json` — server registration: `npx -y markdown-docs-mcp@0.1.0`. Env-vars (`MARKDOWN_DOCS_MAX_*`) **не зашиваем** — defaults в `src/config.ts` достаточны, override остаётся за пользователем.
- Unit-тест: парсит все 3 JSON, проверяет invariants (имена совпадают, версия синхронизирована с package.json)
- Spec section 8 удаляется (skill); section 2.1 / 11 обновляются.

**Связь с PR-06.4:** независимая от логики MCP. После merge'а PR-07 плагин публичен. PR-08 добавит release pipeline для атомарной синхронизации версий.

**Ветка:** `pr-07-plugin-packaging` от `dev`.

---

## Решение по skill (контекст)

После PR-06.2/06.3/06.4 4 tool descriptions (`VIEW_TOC_DESCRIPTION`, `READ_SECTION_DESCRIPTION`, `SEARCH_DESCRIPTION`, `ANALYZE_DOCUMENT_DESCRIPTION`) покрывают:

- Typical workflow (overview → has_children → drill-down)
- raw vs logical режим + PDF-artefacts mention
- search scope fallback hint
- anomaly types и `paired_with` для consecutive_pair_header
- `_meta["anthropic/maxResultSizeChars"]: 200000` annotation на все 4 tools

Skill добавил бы лишь deep dive по PDF-artefacts. **Пользовательское решение:** «MCP работает с general markdown, не только PDF» → skill не нужен. PDF-artefact handling остаётся в descriptions через `mode="logical"` и `analyze_document`.

---

## Файлы

**NEW:**
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.mcp.json`
- `tests/unit/plugin_manifest.test.ts` — JSON-валидность + cross-file invariants
- `docs/superpowers/plans/2026-05-14-pr-07-plugin-packaging.md` (этот файл)

**Modify:**
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md`:
  - section 2.1 — убрать skill из distribution, plugin = MCP wrapper
  - section 8 — заменить «Skill дизайн» на пометку «Removed in PR-07: descriptions self-contained»
  - section 11 — убрать `skills/...` из структуры
  - section 15 — отметить PR-07 done
- `README.md` — раздел Installation: `/plugin marketplace add` + `/plugin install`
- `.gitignore` — проверить что плагиновые файлы не игнорятся (на всякий случай)

**НЕ модифицировать:**
- `src/*` — ноль изменений в коде MCP
- `tests/integration/*` — ноль изменений
- `package.json` — версия 0.1.0 уже есть, sync делается PR-08

---

## Контракт

### `.claude-plugin/plugin.json`

```json
{
  "$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json",
  "name": "markdown-docs",
  "version": "0.1.0",
  "description": "MCP server for efficient navigation of large markdown documents (datasheets, standards, manuals)",
  "author": { "name": "hacker-cb" },
  "homepage": "https://github.com/hacker-cb/markdown-docs-mcp",
  "repository": "https://github.com/hacker-cb/markdown-docs-mcp",
  "license": "MIT",
  "keywords": ["mcp", "markdown", "documentation", "datasheet", "reference-manual"]
}
```

### `.claude-plugin/marketplace.json`

```json
{
  "name": "hacker-cb",
  "owner": { "name": "hacker-cb" },
  "plugins": [
    {
      "name": "markdown-docs",
      "source": "./",
      "description": "MCP server for efficient navigation of large markdown documents",
      "version": "0.1.0",
      "homepage": "https://github.com/hacker-cb/markdown-docs-mcp",
      "license": "MIT"
    }
  ]
}
```

### `.mcp.json`

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

Имена:
- npm-пакет: `markdown-docs-mcp`
- plugin name: `markdown-docs`
- marketplace name: `hacker-cb`
- MCP server name (в server.ts): `markdown-docs`

Установка: `/plugin marketplace add hacker-cb/markdown-docs-mcp && /plugin install markdown-docs@hacker-cb` (соответствует spec section 2.3).

---

## Задачи

### Task 1: Создать 3 plugin-файла

- [ ] **Step 1.1:** Создать `.claude-plugin/plugin.json` по contract выше.
- [ ] **Step 1.2:** Создать `.claude-plugin/marketplace.json` по contract выше.
- [ ] **Step 1.3:** Создать `.mcp.json` по contract выше.
- [ ] **Step 1.4:** Verify JSON парсится `node -e 'JSON.parse(require("fs").readFileSync("..."))'`.

### Task 2: Unit-тест plugin manifest

- [ ] **Step 2.1:** Создать `tests/unit/plugin_manifest.test.ts`:
  - Парсит все 3 JSON-файла из корня репо
  - Asserts:
    - `plugin.json.version === marketplace.json.plugins[0].version === package.json.version === args[1].split("@")[1]`
    - `plugin.json.name === marketplace.json.plugins[0].name === "markdown-docs"`
    - `marketplace.json.plugins[0].source === "./"`
    - `.mcp.json.mcpServers["markdown-docs"].command === "npx"`
    - `args` начинается с `-y` (auto-yes для npx)
    - npm-пакет в args соответствует `package.json.name`
- [ ] **Step 2.2:** Run tests — все зелёные.

### Task 3: Обновить spec и README

- [ ] **Step 3.1:** Spec section 2.1 — отметить, что skill НЕ входит.
- [ ] **Step 3.2:** Spec section 8 — заменить «Skill дизайн» на короткую пометку об удалении.
- [ ] **Step 3.3:** Spec section 11 — убрать `skills/` из дерева.
- [ ] **Step 3.4:** Spec section 15 — `[x] PR-07`.
- [ ] **Step 3.5:** README Installation — добавить marketplace команды.

### Task 4: Финализация

- [ ] **Step 4.1:** `pnpm typecheck && pnpm test && pnpm build` зелёные.
- [ ] **Step 4.2:** Commit + push + PR + merge.
- [ ] **Step 4.3:** Manual smoke test — **пользователь** проверяет `/plugin marketplace add` локально (это его territory, я не могу).

---

## Acceptance criteria

После merge PR-07:

1. `pnpm typecheck && pnpm test && pnpm build` зелёные.
2. `node -e 'JSON.parse(...)'` парсит все 3 plugin-файла без ошибок.
3. `plugin_manifest.test.ts` проверяет name/version invariants.
4. README показывает `/plugin marketplace add hacker-cb/markdown-docs-mcp && /plugin install markdown-docs@hacker-cb`.
5. Spec sections 2.1 / 8 / 11 / 15 обновлены.
6. ⚠️ **Manual smoke test пользователем** — установить через marketplace, убедиться, что 4 MCP tools видны в `tools/list`.

## Anti-patterns

- Не зашивать env-vars в `.mcp.json` — defaults `src/config.ts` уже разумные; override — за пользователем в его user-scope конфиге.
- Не создавать `skills/` каталог даже пустым.
- Не помещать `.mcp.json` в `.claude-plugin/` — стандартное место в корне репо (per docs).
- Не менять `package.json.version` отдельно от `plugin.json.version` — это PR-08 release pipeline.
- Не публиковать в npm в PR-07 — это PR-08.
