// tests/integration/invariants.test.ts
// Line-coverage invariant (spec section 5.4): the union of all node ownership
// ranges covers [1..line_count] exactly once — no gaps, no overlaps.
//
// Ownership semantics:
//   - Preamble:   lines [1 .. firstHeader.line - 1]  (if any header exists)
//   - Inner node: lines [node.line .. firstChild.line - 1]  (heading + intro)
//   - Leaf node:  lines [node.line .. node.line_end]
//
// If this test fails it signals a real bug in builder/reparenting, not a test
// problem — see the BLOCKED guidance in the implementation plan.

import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { IndexCache } from "../../src/index/cache.js";
import type { TocNode } from "../../src/index/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_FIXTURES = ["esp32-p4-datasheet.md", "stm32h750ib.md"];

describe("line coverage invariant (no content loss)", () => {
  for (const fixture of PUBLIC_FIXTURES) {
    it(
      `${fixture}: TOC covers every line exactly once`,
      async () => {
        const path = resolve(__dirname, "../fixtures/public", fixture);
        const cache = new IndexCache();
        const idx = await cache.getOrBuild(path);

        // owner[line] = id string or undefined; 1-based index (slot 0 unused)
        const owner: Array<string | undefined> = new Array(idx.line_count + 1);

        const assign = (line: number, id: string) => {
          expect(
            owner[line],
            `Line ${line} is already owned by "${owner[line]}" when "${id}" tries to claim it (overlap in ${fixture})`
          ).toBeUndefined();
          owner[line] = id;
        };

        // Mark preamble lines (before the first heading)
        const firstHeader = idx.flat_headers[0];
        const preambleEnd = firstHeader ? firstHeader.line - 1 : idx.line_count;
        for (let l = 1; l <= preambleEnd; l++) {
          assign(l, "preamble");
        }

        // Walk every node and assign ownership ranges
        const visit = (node: TocNode) => {
          const firstChild = node.children[0];
          // Inner node: owns from heading line up to (but not including) first child's heading
          // Leaf node: owns from heading line through line_end
          const ownEnd = firstChild ? firstChild.line - 1 : node.line_end;
          for (let l = node.line; l <= ownEnd; l++) {
            assign(l, node.id);
          }
          for (const child of node.children) {
            visit(child);
          }
        };

        for (const root of idx.toc) {
          visit(root);
        }

        // Verify every line has exactly one owner (no gaps)
        for (let l = 1; l <= idx.line_count; l++) {
          expect(
            owner[l],
            `Line ${l} has no owner in ${fixture}`
          ).toBeDefined();
        }
      },
      120000
    );
  }
});
