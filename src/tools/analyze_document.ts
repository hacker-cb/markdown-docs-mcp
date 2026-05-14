import type { IndexCache } from "../index/cache.js";
import type { AnalyzeDocumentInput } from "../schemas/inputs.js";
import { buildAnalyzeDocumentResponse } from "./analyze_document_response.js";

export function makeAnalyzeDocumentHandler(cache: IndexCache) {
  return async function analyzeDocument(input: AnalyzeDocumentInput): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const index = await cache.getOrBuild(input.file_path);
    const response = buildAnalyzeDocumentResponse(index, input);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  };
}
