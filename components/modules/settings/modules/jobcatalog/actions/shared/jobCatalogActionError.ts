import { BadRequestError } from "@/components/clients/exceptions";

/**
 * Catalogue mutations fail for reasons the user can act on — a name already taken at that level, a
 * code already used elsewhere, a position archived twice. Java sends those as 400 with a message,
 * so passing it through is the difference between "fix the code" and "something went wrong".
 * Anything else falls back to the generic sentence.
 */
export const jobCatalogErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof BadRequestError && error.message ? error.message : fallback;
