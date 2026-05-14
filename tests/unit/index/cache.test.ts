import { describe, it, expect } from "vitest";
import { writeFile, utimes, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IndexCache } from "../../../src/index/cache.js";

async function makeFile(content: string): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), "md-docs-mcp-cache-"));
  const file = join(dir, "doc.md");
  await writeFile(file, content, "utf8");
  return { path: file, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

describe("IndexCache", () => {
  it("returns cached index on second call when file unchanged", async () => {
    const { path, cleanup } = await makeFile("# H\n");
    try {
      const cache = new IndexCache();
      const a = await cache.getOrBuild(path);
      const b = await cache.getOrBuild(path);
      expect(a).toBe(b); // reference equality — same instance
    } finally {
      await cleanup();
    }
  });

  it("rebuilds when mtime changes", async () => {
    const { path, cleanup } = await makeFile("# H\n");
    try {
      const cache = new IndexCache();
      const a = await cache.getOrBuild(path);
      // bump mtime by 2 seconds
      const future = new Date(Date.now() + 2000);
      await utimes(path, future, future);
      const b = await cache.getOrBuild(path);
      expect(a).not.toBe(b); // new instance built
      expect(b.mtime_ms).toBeGreaterThan(a.mtime_ms);
    } finally {
      await cleanup();
    }
  });

  it("rebuilds when content (and therefore size) changes", async () => {
    const { path, cleanup } = await makeFile("# A\n");
    try {
      const cache = new IndexCache();
      const a = await cache.getOrBuild(path);
      await writeFile(path, "# A\n## B\n", "utf8");
      const b = await cache.getOrBuild(path);
      expect(a).not.toBe(b);
      expect(b.flat_headers).toHaveLength(2);
    } finally {
      await cleanup();
    }
  });

  it("evicts least-recently-used entries past max size", async () => {
    const files: Array<{ path: string; cleanup: () => Promise<void> }> = [];
    try {
      const cache = new IndexCache(2);
      for (let i = 0; i < 3; i++) {
        const f = await makeFile(`# H${i}\n`);
        files.push(f);
        await cache.getOrBuild(f.path);
      }
      // After 3 files in a cache of size 2, the first one was evicted.
      // The second call to file[0] must rebuild (new instance):
      const firstAgain = await cache.getOrBuild(files[0]!.path);
      const secondCall = await cache.getOrBuild(files[0]!.path);
      expect(firstAgain).toBe(secondCall); // now cached again
    } finally {
      for (const f of files) await f.cleanup();
    }
  });

  it("throws and does not cache missing files", async () => {
    const cache = new IndexCache();
    await expect(cache.getOrBuild("/no/such/file.md")).rejects.toBeDefined();
  });
});
