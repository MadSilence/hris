"use client";

import { toast } from "sonner";
import { FALLBACK_ERROR_MESSAGE, messageForError } from "@/lib/errors/errorMessages";
import type { ActionResult } from "@/lib/errors/withActionError";

/**
 * The sliding card, for failures that have nowhere else to go.
 *
 * Reach for it when the action is over and its context has closed — a dialog that dismissed, a row
 * action, a drag that was refused. Do **not** use it for input validation: that message belongs
 * next to the field it is about, and a card will slide away before anyone works out which field
 * that was.
 *
 * An unexpected failure does not auto-dismiss. It carries a reference nobody can retype from memory
 * in the four seconds a normal toast lasts, and the whole point of showing the reference is that it
 * can be copied.
 */
const show = (message: string, reference?: string) => {
  const unexpected = message === FALLBACK_ERROR_MESSAGE;

  toast.error(message, {
    description: reference,
    duration: unexpected ? Infinity : undefined,
    closeButton: true,
  });
};

/** For the result of a server action. */
export const showActionError = (result: Pick<ActionResult, "errorMessage" | "requestId">) =>
  show(result.errorMessage ?? FALLBACK_ERROR_MESSAGE, result.requestId);

/** For an error caught on the client — a mutation hook, a drag handler. */
export const showError = (error: unknown) => show(messageForError(error), referenceOf(error));

/** Confirmation that something worked, for actions whose result is otherwise invisible. */
export const showSuccess = (message: string) => toast.success(message);

const referenceOf = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null && "requestId" in error
    ? ((error as { requestId?: string }).requestId ?? undefined)
    : undefined;
