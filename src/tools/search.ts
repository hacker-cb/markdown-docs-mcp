import { NotImplementedError } from "../lib/errors.js";
import type { SearchInput } from "../schemas/inputs.js";

export async function search(_input: SearchInput): Promise<never> {
  throw new NotImplementedError("search");
}
