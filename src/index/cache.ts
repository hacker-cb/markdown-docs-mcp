import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { LRUCache } from "lru-cache";
import { buildIndex } from "./builder.js";
import type { Index } from "./types.js";

type Entry = { size_bytes: number; mtime_ms: number; index: Index };

export class IndexCache {
  private readonly lru: LRUCache<string, Entry>;

  constructor(maxSize: number = 10) {
    this.lru = new LRUCache<string, Entry>({ max: maxSize });
  }

  async getOrBuild(filePath: string): Promise<Index> {
    const key = resolve(filePath);
    const stats = await stat(key); // throws if missing — desired
    const cached = this.lru.get(key);
    if (
      cached &&
      cached.size_bytes === stats.size &&
      cached.mtime_ms === stats.mtimeMs
    ) {
      return cached.index;
    }
    const index = await buildIndex(key);
    this.lru.set(key, {
      size_bytes: index.size_bytes,
      mtime_ms: index.mtime_ms,
      index,
    });
    return index;
  }

  invalidate(filePath: string): void {
    this.lru.delete(resolve(filePath));
  }

  clear(): void {
    this.lru.clear();
  }
}
