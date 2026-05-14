import { NotImplementedError } from "../lib/errors.js";
import type { AnalyzeDocumentInput } from "../schemas/inputs.js";

export async function analyzeDocument(_input: AnalyzeDocumentInput): Promise<never> {
  throw new NotImplementedError("analyze_document");
}
