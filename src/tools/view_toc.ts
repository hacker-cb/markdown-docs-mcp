import type { IndexCache } from "../index/cache.js";
import type { ViewTocInput } from "../schemas/inputs.js";
import type { Config } from "../config.js";
import { DEFAULT_CONFIG } from "../config.js";
import { buildViewTocResponse } from "./view_toc_response.js";

export function makeViewTocHandler(cache: IndexCache, config: Config = DEFAULT_CONFIG) {
  return async function viewToc(input: ViewTocInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildViewTocResponse(index, input, config.maxViewTocBytes);
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  };
}
