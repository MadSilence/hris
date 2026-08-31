"use client";

import { AlertTriangle } from "lucide-react";
import { FALLBACK_ERROR_MESSAGE } from "@/lib/errors/errorMessages";

/**
 * A refusal shown inside the form it belongs to.
 *
 * This is the "the user can fix it" half of the error policy: the form stays open, what was typed
 * is still there, and the reason sits next to it. Contrast with the sliding card, which is for a
 * failure whose context has already closed.
 *
 * `role="alert"` is the point of having one component: of the error renderings scattered through
 * the modules only thirteen had it, so most refusals were invisible to a screen reader — and it is
 * exactly the moment when being told matters.
 */
export const FormError: React.FC<{
  message?: string | null;
  /** Shown in small type under the message: a request id, or the code when nothing else explains it. */
  reference?: string | null;
  className?: string;
}> = ({ message, reference, className }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 ${className ?? ""}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-red-700">{message}</p>
        {reference && <p className="font-mono text-xs text-red-600/70">{reference}</p>}
      </div>
    </div>
  );
};

/** The reference is only worth the space when the sentence above it says nothing specific. */
export const referenceFor = (message?: string | null, requestId?: string, code?: string) =>
  message === FALLBACK_ERROR_MESSAGE ? requestId ?? code : requestId;
