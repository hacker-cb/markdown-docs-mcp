import { NotImplementedError } from "../lib/errors.js";
import type { ViewTocInput } from "../schemas/inputs.js";

export async function viewToc(_input: ViewTocInput): Promise<never> {
  throw new NotImplementedError("view_toc");
}
