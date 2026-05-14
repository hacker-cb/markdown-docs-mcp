import type { IndexCache } from "../index/cache.js";
import type { ReadSectionInput } from "../schemas/inputs.js";
import type { Config } from "../config.js";
import { DEFAULT_CONFIG } from "../config.js";
import { buildReadSectionResponse } from "./read_section_response.js";

export function makeReadSectionHandler(cache: IndexCache, config: Config = DEFAULT_CONFIG) {
  return async function readSection(input: ReadSectionInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildReadSectionResponse(index, input, config.maxSectionBytes);
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
    };
  };
}
