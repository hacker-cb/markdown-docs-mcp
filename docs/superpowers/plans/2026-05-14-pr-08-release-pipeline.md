# PR-08: release pipeline — план

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Атомарный release flow `dev` → `master` → npm publish. Версия синхронно проставляется в 4 местах (`package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.mcp.json`). Tag `v*` на `master` запускает GitHub Actions, которое publish'ит в npm через **npm Trusted Publisher (OIDC)** без секретного `NPM_TOKEN`.

**Architecture:**
- `scripts/release.mjs` — node-script (ESM, без TS) синхронизирует версии и создаёт commit + tag. Запускается локально автором.
- `.github/workflows/release.yml` — trigger на `push` тега `v*`: test → build → `npm publish --provenance` (OIDC) → создание GitHub Release.
- README + spec — итоговые installation instructions + раздел про релиз-процесс.

**Tech Stack:** уже подключено. npm Trusted Publisher не требует CLI-зависимостей в репо — только настройка на стороне npmjs.com (делает пользователь).

**Связь с PR-07:** PR-07 положил plugin-файлы с захардкоженной `0.1.0`. PR-08 даёт механизм обновлять её в одном месте.

**Ветка:** `pr-08-release-pipeline` от `dev`.

---

## Решение по distribution

Используем **npm Trusted Publisher** (OIDC) вместо классического `NPM_TOKEN`:

- ✅ Не нужно хранить долгоживущий secret в GitHub repo settings.
- ✅ Короткоживущий token выдаётся через GitHub OIDC при каждом publish.
- ✅ Publish получает `provenance` подпись — на npm-странице видна ссылка на конкретный workflow run.
- ⚠️ Требует разовой настройки на стороне npmjs.com (Account → Trusted Publishers → добавить `hacker-cb/markdown-docs-mcp` + workflow path). **Делает пользователь после merge PR-08.**

---

## Файлы

**NEW:**
- `scripts/release.mjs` — version-sync скрипт.
- `.github/workflows/release.yml` — publish workflow.
- `tests/unit/release_script.test.ts` — smoke-тест что скрипт парсит JSON, обновляет 4 файла, не падает на dry-run.

**Modify:**
- `package.json` — добавить `release` script (`node scripts/release.mjs`).
- `README.md` — раздел Releases, ссылка на CI workflow, упоминание trusted-publisher.
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md`:
  - section 10.2 — добавить release.yml в GitHub Actions описание
  - section 10.3 — переписать flow под Trusted Publisher (вместо NPM_TOKEN)
  - section 15 — отметить PR-08 done

**НЕ модифицировать:**
- `src/*` — ноль изменений в коде MCP.
- `.claude-plugin/*`, `.mcp.json` — структура уже OK, версии обновляет release-script.
- `package.json.version` руками — только через `release.mjs`.

---

## Контракт

### `scripts/release.mjs`

```
Usage: node scripts/release.mjs <version>
       node scripts/release.mjs --dry-run <version>

<version> — semver string, e.g. "0.1.0" or "1.2.3-rc.1".
```

Что делает:

1. Валидирует semver через regex (no major preview, `^v?\d+\.\d+\.\d+(?:-[\w.]+)?$`).
2. Читает 4 файла, обновляет:
   - `package.json` → `version`
   - `.claude-plugin/plugin.json` → `version`
   - `.claude-plugin/marketplace.json` → `plugins[0].version`
   - `.mcp.json` → `mcpServers.markdown-docs.args[1]` (всегда `markdown-docs-mcp@<version>`)
3. На `--dry-run` — печатает diff, ничего не пишет.
4. Иначе — пишет файлы, `git add -A`, `git commit -m "release: v<version>"`, `git tag v<version>`. **Не пушит** — это делает автор (`git push --follow-tags origin master`).
5. Перед commit проверяет, что ветка — `master` (предупреждает иначе, можно override через `--force`).

### `.github/workflows/release.yml`

```yaml
name: release
on:
  push:
    tags: ["v*"]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write    # GitHub release
      id-token: write    # npm OIDC (Trusted Publisher)
    steps:
      - uses: actions/checkout@v4
      - pnpm/setup
      - setup-node 20 with registry npmjs.com
      - pnpm install --frozen-lockfile
      - pnpm typecheck && pnpm test && pnpm build
      - npm publish --provenance --access public
      - softprops/action-gh-release@v2 (создаёт GitHub Release с body из CHANGELOG или auto-generated)
```

### `package.json` scripts

```jsonc
{
  "scripts": {
    "release": "node scripts/release.mjs"
  }
}
```

---

## Задачи

### Task 1: `scripts/release.mjs`

- [ ] **Step 1.1:** Реализовать `scripts/release.mjs`. ESM (`import`/`export`).
- [ ] **Step 1.2:** Manual sanity: `node scripts/release.mjs --dry-run 0.1.1` → печатает 4 diff'а, ничего не пишет.

### Task 2: `tests/unit/release_script.test.ts`

- [ ] **Step 2.1:** TDD: import функцию `applyVersionToFiles(version, files)` из release.mjs (export'нуть). Тесты:
  1. Valid version → обновляет все 4 структуры, возвращает diff.
  2. Invalid semver → throw.
  3. `.mcp.json.args[1]` корректно подставляет `markdown-docs-mcp@<version>`.

### Task 3: `.github/workflows/release.yml`

- [ ] **Step 3.1:** Создать workflow.
- [ ] **Step 3.2:** Syntax sanity: `actionlint` если установлен; иначе визуальная инспекция.

### Task 4: Spec + README

- [ ] **Step 4.1:** Spec section 10.2 — упомянуть `release.yml` trigger.
- [ ] **Step 4.2:** Spec section 10.3 — переписать flow: `node scripts/release.mjs X.Y.Z` → `git push --follow-tags origin master` → CI publishes via OIDC.
- [ ] **Step 4.3:** Spec section 15 — `[x] PR-08`.
- [ ] **Step 4.4:** README Installation — указать `markdown-docs-mcp@<latest>` без жёсткой версии. Добавить «Releases» раздел с badge'ом или ссылкой на npm.

### Task 5: Финализация

- [ ] **Step 5.1:** `pnpm typecheck && pnpm test && pnpm build` зелёные.
- [ ] **Step 5.2:** Commit + push + PR против `dev` + merge.
- [ ] **Step 5.3:** После merge PR-08 в `dev` — отдельный merge `dev` → `master` (fast-forward).
- [ ] **Step 5.4:** **Пользователь** настраивает Trusted Publisher на npmjs.com.
- [ ] **Step 5.5:** Локально: `pnpm release 0.1.0` → `git push --follow-tags origin master` → CI publish.

---

## Acceptance criteria

После merge PR-08 (но до первого релиза):

1. `pnpm typecheck && pnpm test && pnpm build` зелёные.
2. `node scripts/release.mjs --dry-run 0.1.1` показывает diff'ы 4 файлов без записи.
3. `node scripts/release.mjs 0.1.1` (на feature-ветке для проверки) обновляет 4 файла и создаёт commit + tag (потом `git reset --hard HEAD~1; git tag -d v0.1.1` для отката).
4. `.github/workflows/release.yml` синтаксически валиден.
5. README / spec обновлены.

После npm trusted-publisher setup + первого тега `v0.1.0`:

6. CI run завершается зелёным.
7. Пакет `markdown-docs-mcp@0.1.0` появляется на https://npmjs.com/package/markdown-docs-mcp с provenance badge.
8. `/plugin marketplace add hacker-cb/markdown-docs-mcp && /plugin install markdown-docs@hacker-cb` устанавливает работающий plugin (npx подхватывает опубликованный пакет).

## Anti-patterns

- Не хранить `NPM_TOKEN` в GitHub secrets — Trusted Publisher делает его не нужным.
- Не пушить tag без предварительного `release.mjs` — версии 4 файлов рассинхронизируются.
- Не публиковать с `dev` ветки — releases только из `master`.
- Не делать `npm version` напрямую — он только bump'ит package.json, остальные 3 файла останутся со старой версией.
