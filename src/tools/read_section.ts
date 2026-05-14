import { NotImplementedError } from "../lib/errors.js";
import type { ReadSectionInput } from "../schemas/inputs.js";

export async function readSection(_input: ReadSectionInput): Promise<never> {
  throw new NotImplementedError("read_section");
}
