"use client";

import { toast } from "sonner";
import { fallbackErrorMessage, isFallbackErrorMessage, messageForCode, messageForError } from "@/lib/errors/errorMessages";
import type { ActionResult } from "@/lib/errors/withActionError";

/**
 * The sliding card, for failures that have nowhere else to go.
 *
 * Reach for it when the action is over and its context has closed — a dialog that dismissed, a row
 * action, a drag that was refused. Do **not** use it for input validation: that message belongs
 * next to the field it is about, and a card will slide away before anyone works out which field
 * that was.
 *
 * An unexpected failure does not auto-dismiss: the person has to read what failed. Its request id is **not** shown —
 * an ordinary person has no use for the number (the owner, 2026-11-20; `technical_documentation/ERRORS.md`). It stays
 * in the backend's log under the same id, and goes to the browser console here for whoever is debugging.
 */
/**
 * A toast has no full stop at its end (`technical_documentation/ui/NAMING.md` § 1). The catalogues are written that
 * way, but an error text is shared with the in-form message, which is a sentence — so the toast drops the last stop
 * here. An ellipsis and the stops between two sentences stay.
 */
export const toastText = (message: string): string => message.replace(/(?<!\.)\.\s*$/, "");

const show = (message: string, reference?: string) => {
  // A server out of reach is as unexpected as it gets, and the person has to read what failed.
  const unexpected = isFallbackErrorMessage(message) || message === messageForCode("E00503");

  if (reference) console.warn(`[error] ${message} (request ${reference})`);

  toast.error(toastText(message), {
    duration: unexpected ? Infinity : undefined,
    closeButton: true,
  });
};

/** For the result of a server action. */
export const showActionError = (result: Pick<ActionResult, "errorMessage" | "requestId">) =>
  show(result.errorMessage ?? fallbackErrorMessage(), result.requestId);

/** For an error caught on the client — a mutation hook, a drag handler. */
export const showError = (error: unknown) => show(messageForError(error), referenceOf(error));

/** Confirmation that something worked, for actions whose result is otherwise invisible. */
export const showSuccess = (message: string) => toast.success(toastText(message));

const referenceOf = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null && "requestId" in error
    ? ((error as { requestId?: string }).requestId ?? undefined)
    : undefined;
