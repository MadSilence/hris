import type { ActionResult } from "@/lib/errors/withActionError";

/**
 * A refused create or save, with the envelope kept: the wizard reads `fieldErrors` to put a refusal
 * next to the field it is about — a name already taken goes under Name, not into a card.
 */
export class PolicyActionError extends Error {
  readonly fieldErrors?: Record<string, string>;

  constructor(result: ActionResult, fallback: string) {
    super(result.errorMessage || fallback);
    this.name = "PolicyActionError";
    this.fieldErrors = result.fieldErrors;
  }
}
