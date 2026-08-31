"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { ApiError, ForbiddenError, NotFoundError } from "@/components/clients/exceptions";
import { FALLBACK_ERROR_MESSAGE, messageForError } from "@/lib/errors/errorMessages";

/**
 * A fetch that failed, shown where the data was going to be.
 *
 * This is the "read" half of the error policy: a refusal while reading belongs to the region that
 * could not load, not to the whole page. Containers used to `throw error` here, which unmounted the
 * shell — sidebar, navigation and all — because one list did not come back.
 *
 * `compact` is for a panel or a modal body, where the full-height version would look absurd.
 */
export const ErrorState: React.FC<{
  error: unknown;
  title?: string;
  compact?: boolean;
  onRetry?: () => void;
  /**
   * Overrides the resolved text. The route boundary passes the generic sentence: an error that
   * reached it is unexpected by definition, and its message was written for whoever has to debug
   * it — "Cannot reach the API at http://localhost:8081" is true, and not for a person to read.
   */
  message?: string;
}> = ({ error, title, compact = false, onRetry, message: override }) => {
  const message = override ?? messageForError(error);
  const apiError = error instanceof ApiError ? error : undefined;

  // Worth showing only when the sentence above says nothing specific: then the code is the one
  // thing support can match on. A recognised refusal explains itself and needs no reference.
  const reference = message === FALLBACK_ERROR_MESSAGE
    ? apiError?.requestId ?? apiError?.code
    : apiError?.requestId;

  const heading = title ?? defaultHeading(error);

  return (
    <div
      role="alert"
      className={
        compact
          ? "flex flex-col items-center gap-3 px-4 py-8 text-center"
          : "flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center"
      }
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-50">
        <AlertTriangle className="h-6 w-6 text-brown-600" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-medium">{heading}</p>
        <p className="max-w-md text-sm text-[var(--color-text-tertiary)]">{message}</p>
      </div>

      {reference && (
        <p className="font-mono text-xs text-[var(--color-text-tertiary)]" data-testid="error-reference">
          {reference}
        </p>
      )}

      <Button variant="outline" size="sm" onClick={onRetry ?? (() => window.location.reload())}>
        <RotateCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
};

const defaultHeading = (error: unknown): string => {
  if (error instanceof ForbiddenError) return "You do not have access to this";
  if (error instanceof NotFoundError) return "Not found";
  return "This did not load";
};
