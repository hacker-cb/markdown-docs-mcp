import type { IndexCache } from "../index/cache.js";
import type { ViewTocInput } from "../schemas/inputs.js";
import { buildViewTocResponse } from "./view_toc_response.js";

export function makeViewTocHandler(cache: IndexCache) {
  return async function viewToc(input: ViewTocInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildViewTocResponse(index, input);
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
    };
  };
}
