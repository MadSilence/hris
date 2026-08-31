import { ApiError, ForbiddenError } from "@/components/clients/exceptions";

/**
 * Catalogue mutations fail for reasons the user can act on — a name already taken at that level, a
 * code already used elsewhere, a position archived twice. Java sends those with a message, so
 * passing it through is the difference between "fix the code" and "something went wrong".
 * A refusal on permissions says nothing actionable, so it falls back to the generic sentence.
 */
/**
 * Interim: domain refusals used to arrive as 400 and are now 409 (conflict) or 422 (invalid input),
 * so matching on BadRequestError alone would stop showing them. Both mappers are replaced by the
 * single `withActionError` middle in batch C — see ERRORS_ANALYSIS.md §6.
 */
export const jobCatalogErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError && !(error instanceof ForbiddenError) && error.message
    ? error.message
    : fallback;
