import type { IndexCache } from "../index/cache.js";
import type { SearchInput } from "../schemas/inputs.js";
import { buildSearchResponse } from "./search_response.js";

export function makeSearchHandler(cache: IndexCache) {
  return async function search(input: SearchInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildSearchResponse(index, input);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  };
}
