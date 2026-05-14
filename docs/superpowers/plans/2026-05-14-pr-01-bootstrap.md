# PR-01: Bootstrap — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять npm-проект `markdown-docs-mcp` со всем инструментарием (TypeScript, esbuild, vitest, GitHub Actions), скопировать публичные fixtures, чтобы все последующие PR имели рабочую базу. Никакой логики MCP.

**Architecture:** ESM Node-проект с esbuild для single-file bundle, vitest для тестов, pnpm как пакетный менеджер. CI на GitHub Actions с matrix node 20/22. Один smoke-тест подтверждает что toolchain настроен правильно.

**Tech Stack:** TypeScript 6.0, esbuild 0.28, vitest 4.1, tsx 4.21, @types/node 25.7, pnpm 10, Node 20+ (target=node20).

**Реализация PR-01 из spec'а** [docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md](../specs/2026-05-14-markdown-docs-mcp-design.md), раздел 15.

**Ветка:** `pr-01-bootstrap` от `dev`.

---

## Файлы

**Создать:**
- `package.json` — npm package metadata, scripts, devDependencies
- `tsconfig.json` — TypeScript strict mode, ESM, target ESNext
- `esbuild.config.mjs` — bundle конфиг (src/index.ts → dist/index.js)
- `vitest.config.ts` — конфиг vitest
- `src/index.ts` — минимальный placeholder MCP entry (один `console.error`)
- `tests/unit/smoke.test.ts` — smoke-тест что vitest работает
- `tests/fixtures/private/.gitkeep` — пустой маркер для сохранения папки в git
- `tests/fixtures/public/esp32-p4-datasheet.md` — копия из jethome/datasheets-mcu/esp32/
- `tests/fixtures/public/stm32h750ib.md` — копия из jethome/datasheets-mcu/stm32/
- `LICENSE` — MIT
- `README.md` — skeleton (Overview, Install TBD, License)
- `.github/workflows/test.yml` — CI workflow для тестов и typecheck

**Модифицировать:**
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md:494` — `target: node18 (LTS)` → `target: node20 (LTS)` (node18 вышел из active LTS в апреле 2025)
- `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md` — отметить чекбокс PR-01 в разделе 15

---

## Задачи

### Task 1: Инициализировать package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1.1: Создать package.json**

```json
{
  "name": "markdown-docs-mcp",
  "version": "0.1.0",
  "description": "MCP server for efficient navigation of large markdown documents (datasheets, standards, manuals)",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "markdown-docs-mcp": "dist/index.js"
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "build": "node esbuild.config.mjs",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "markdown",
    "documentation",
    "datasheet"
  ],
  "author": "hacker-cb",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/hacker-cb/markdown-docs-mcp.git"
  },
  "homepage": "https://github.com/hacker-cb/markdown-docs-mcp",
  "bugs": {
    "url": "https://github.com/hacker-cb/markdown-docs-mcp/issues"
  }
}
```

- [ ] **Step 1.2: Установить devDependencies**

Run:
```bash
pnpm add -D typescript@6.0.3 @types/node@25.7.0 esbuild@0.28.0 vitest@4.1.6 tsx@4.21.0
```

Expected: создаётся `node_modules/`, `pnpm-lock.yaml`, обновляется `devDependencies` в `package.json`.

- [ ] **Step 1.3: Проверить package.json**

Run: `pnpm install`
Expected: `Already up to date`, exit 0.

---

### Task 2: TypeScript конфигурация

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 2.1: Создать tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["node", "vitest/globals"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "skipLibCheck": true,
    "noEmit": true,
    "forceConsistentCasingInFileNames": true,
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "*.config.*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2.2: Создать минимальный src/index.ts**

```typescript
// markdown-docs-mcp entry point.
// MCP server wiring lands in PR-02; for now this is a placeholder
// so the build pipeline has something to bundle.
console.error("markdown-docs-mcp: not implemented yet");
```

Run:
```bash
mkdir -p src && cat > src/index.ts <<'EOF'
// markdown-docs-mcp entry point.
// MCP server wiring lands in PR-02; for now this is a placeholder
// so the build pipeline has something to bundle.
console.error("markdown-docs-mcp: not implemented yet");
EOF
```

- [ ] **Step 2.3: Проверить typecheck**

Run: `pnpm typecheck`
Expected: exit 0, никаких ошибок.

---

### Task 3: esbuild конфигурация

**Files:**
- Create: `esbuild.config.mjs`

- [ ] **Step 3.1: Создать esbuild.config.mjs**

```javascript
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.js",
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Banner with shebang must be combined with chmod +x downstream.
  // esbuild does not set executable bit; npm pack/publish preserves
  // file mode, so we set it via build script below.
  legalComments: "linked",
  sourcemap: false,
  minify: false,
});

// Make bin entry executable so `npx markdown-docs-mcp` works after install.
import { chmodSync } from "node:fs";
chmodSync("dist/index.js", 0o755);

console.error("Build complete: dist/index.js");
```

- [ ] **Step 3.2: Запустить build**

Run: `pnpm build`
Expected: `Build complete: dist/index.js`, файл `dist/index.js` создан.

- [ ] **Step 3.3: Проверить что bundle runnable**

Run: `node dist/index.js`
Expected output (stderr): `markdown-docs-mcp: not implemented yet`. Exit code 0.

---

### Task 4: vitest конфигурация

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/unit/smoke.test.ts`

- [ ] **Step 4.1: Создать vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    testTimeout: 10000,
  },
});
```

- [ ] **Step 4.2: Написать smoke-тест**

```typescript
// tests/unit/smoke.test.ts
import { describe, it, expect } from "vitest";

describe("toolchain smoke test", () => {
  it("vitest runs and assertions work", () => {
    expect(1 + 1).toBe(2);
  });

  it("node 20+ available", () => {
    const major = parseInt(process.versions.node.split(".")[0]!, 10);
    expect(major).toBeGreaterThanOrEqual(20);
  });
});
```

- [ ] **Step 4.3: Запустить тесты**

Run: `pnpm test`
Expected: `2 passed`, exit 0.

---

### Task 5: Скопировать public fixtures

**Files:**
- Create: `tests/fixtures/public/esp32-p4-datasheet.md`
- Create: `tests/fixtures/public/stm32h750ib.md`
- Create: `tests/fixtures/private/.gitkeep`

- [ ] **Step 5.1: Создать структуру папок fixtures**

Run:
```bash
mkdir -p tests/fixtures/public tests/fixtures/private
touch tests/fixtures/private/.gitkeep
```

- [ ] **Step 5.2: Скопировать ESP32-P4 fixture**

Run:
```bash
cp /Users/pavel/projects/jethome/datasheets-mcu/esp32/markdown/esp32-p4-datasheet.md \
   tests/fixtures/public/esp32-p4-datasheet.md
```

Expected: файл существует, размер ~246 KB.

Verify: `wc -l tests/fixtures/public/esp32-p4-datasheet.md` → 9000 строк.

- [ ] **Step 5.3: Скопировать STM32 fixture**

Run:
```bash
cp /Users/pavel/projects/jethome/datasheets-mcu/stm32/markdown/stm32h750ib.md \
   tests/fixtures/public/stm32h750ib.md
```

Expected: файл существует, размер ~1 MB.

Verify: `wc -l tests/fixtures/public/stm32h750ib.md` → 36517 строк.

- [ ] **Step 5.4: Проверить что private/.gitkeep сохранится в git**

Run: `git -C . status tests/fixtures/`
Expected: видим как новые файлы public/*.md и private/.gitkeep, ничего из private/ кроме .gitkeep (т.к. в .gitignore уже есть `tests/fixtures/private/*` + `!tests/fixtures/private/.gitkeep`).

---

### Task 6: LICENSE

**Files:**
- Create: `LICENSE`

- [ ] **Step 6.1: Создать MIT LICENSE**

```
MIT License

Copyright (c) 2026 hacker-cb

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### Task 7: README skeleton

**Files:**
- Create: `README.md`

- [ ] **Step 7.1: Создать README skeleton**

```markdown
# markdown-docs-mcp

MCP server for efficient navigation of large markdown documents — datasheets, IEC/ISO standards, reference manuals.

Lets agents read what they need from a 36 000-line markdown file without dumping the whole thing into context.

> Status: under active development. See [docs/superpowers/specs/](docs/superpowers/specs/) for the design.

## Tools (planned)

- `view_toc` — get document structure (TOC with line ranges, sizes, anomaly hints).
- `read_section` — fetch a single section by opaque id; raw and logical reading modes.
- `search` — literal or regex search across titles and content with section context.
- `analyze_document` — diagnostic report on structural anomalies (PDF-conversion artifacts and similar).

## Installation

Will be available via:

- Claude Code plugin (with bundled skill)
- Direct MCP config (any MCP-compatible client: Claude Code, Cursor, Continue, ...)
- Local development

Detailed instructions ship with the first release.

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT — see [LICENSE](LICENSE).
```

---

### Task 8: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] **Step 8.1: Создать test workflow**

```yaml
name: test

on:
  push:
    branches: [dev, master]
  pull_request:
    branches: [dev, master]

concurrency:
  group: test-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: test (node ${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node: ["20", "22"]
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build
```

- [ ] **Step 8.2: Локальная проверка эквивалентного pipeline**

Run:
```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Expected: все четыре шага exit 0.

---

### Task 9: Обновить spec — target node20 + tick checkbox

**Files:**
- Modify: `docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md`

- [ ] **Step 9.1: Обновить target в spec'е раздел 10.1**

Edit раздел 10.1 (Build): найти строку `target: node18 (LTS)` и заменить на `target: node20 (LTS) — node18 вышел из active LTS в апреле 2025; обновление зафиксировано в PR-01`.

- [ ] **Step 9.2: Отметить чекбокс PR-01 в spec разделе 15**

Edit раздел 15: найти `- [ ] **PR-01: Bootstrap**` и заменить на `- [x] **PR-01: Bootstrap**`.

---

### Task 10: Финальный коммит и push

- [ ] **Step 10.1: Проверить git status**

Run: `git -C . status`
Expected: untracked + modified, включая всё перечисленное в "Файлы" выше + изменения в spec'е.

- [ ] **Step 10.2: Staging**

Run:
```bash
git -C . add package.json pnpm-lock.yaml tsconfig.json esbuild.config.mjs vitest.config.ts \
  src/index.ts \
  tests/unit/smoke.test.ts \
  tests/fixtures/public/esp32-p4-datasheet.md \
  tests/fixtures/public/stm32h750ib.md \
  tests/fixtures/private/.gitkeep \
  LICENSE README.md \
  .github/workflows/test.yml \
  docs/superpowers/specs/2026-05-14-markdown-docs-mcp-design.md \
  docs/superpowers/plans/2026-05-14-pr-01-bootstrap.md
```

- [ ] **Step 10.3: Commit**

Run:
```bash
git -C . commit -m "$(cat <<'EOF'
feat(bootstrap): scaffold markdown-docs-mcp project (PR-01)

- package.json + pnpm lockfile with TypeScript, esbuild, vitest, tsx
- tsconfig.json (strict mode, ESM, target ES2022)
- esbuild config: src/index.ts -> dist/index.js (node20 target, esm)
- vitest config + smoke test
- Public fixtures: esp32-p4-datasheet.md, stm32h750ib.md
  (sourced from /Users/pavel/projects/jethome/datasheets-mcu/,
   converted from official PDFs via pdf2md-claude)
- tests/fixtures/private/.gitkeep for the gitignored private bucket
- LICENSE (MIT), README skeleton
- GitHub Actions test workflow: typecheck + test + build matrix on
  node 20/22
- Spec: bump esbuild target node18 -> node20 (node18 fell out of LTS
  in April 2025); tick PR-01 checkbox in section 15 roadmap

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 10.4: Push на origin**

Run: `git -C . push -u origin pr-01-bootstrap`
Expected: branch создаётся на remote, tracking настроен.

---

## Acceptance criteria

После merge PR-01 в `dev`:

1. `pnpm install && pnpm typecheck && pnpm test && pnpm build` проходит локально без ошибок.
2. `node dist/index.js` запускается и пишет в stderr `markdown-docs-mcp: not implemented yet`.
3. CI workflow `test` зелёный на push в `dev` и на PR.
4. `tests/fixtures/public/` содержит два markdown-файла (esp32-p4, stm32h750ib).
5. Чекбокс PR-01 отмечен в spec разделе 15.

## Anti-patterns (что НЕ делать в этом PR)

- Не добавлять runtime-зависимости (`markdown-it`, `zod`, `@modelcontextprotocol/sdk`) — это в PR-02 и PR-03.
- Не реализовывать MCP handlers — placeholder в src/index.ts достаточный.
- Не писать unit/integration тесты для будущих модулей — только smoke-тест.
- Не публиковать в npm — это в PR-08.
- Не создавать `.claude-plugin/`, `.mcp.json`, `skills/` — это в PR-07.
