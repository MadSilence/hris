"use client";

import { Alert02Icon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";
import { Illustration } from "@/components/illustrations/Illustration";
import type { Scene } from "@/components/illustrations/scenes";
import { Button } from "@/components/desact/button";
import { ApiError, ForbiddenError, NotFoundError } from "@/components/clients/exceptions";
import { isFallbackErrorMessage, messageForError } from "@/lib/errors/errorMessages";

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
  const t = useTranslations("common");
  const message = override ?? messageForError(error);
  const apiError = error instanceof ApiError ? error : undefined;

  // Worth showing only when the sentence above says nothing specific: then the code is the one
  // thing support can match on. A recognised refusal explains itself and needs no reference.
  const reference = isFallbackErrorMessage(message)
    ? apiError?.requestId ?? apiError?.code
    : apiError?.requestId;

  const heading = title ?? t(defaultHeading(error));

  return (
    <div
      role="alert"
      className={
        compact
          ? "flex flex-col items-center gap-3 px-4 py-8 text-center"
          : "flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center"
      }
    >
      {compact ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-subtle">
          <Icon icon={Alert02Icon} className="text-secondary" />
        </div>
      ) : (
        <Illustration scene={sceneFor(error)} size="s" />
      )}

      <div className="flex flex-col gap-1">
        <p className="text-card-title text-primary">{heading}</p>
        <p className="max-w-md text-body text-secondary">{message}</p>
      </div>

      {reference && (
        <p className="font-mono text-hint text-tertiary" data-testid="error-reference">
          {reference}
        </p>
      )}

      {/* A refusal of rights answers the same however often it is asked; offering a retry promised
          otherwise (the board's request dialog, walk of 2026-10-30). */}
      {!(error instanceof ForbiddenError) && (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry ?? (() => window.location.reload())}>
          <Icon icon={Refresh01Icon} size="sm" />
          {t("actions.retry")}
        </Button>
      )}
    </div>
  );
};

const defaultHeading = (error: unknown) => {
  if (error instanceof ForbiddenError) return "access.private" as const;
  if (error instanceof NotFoundError) return "errorState.notFound" as const;
  return "errorState.didNotLoad" as const;
};

const sceneFor = (error: unknown): Scene => {
  if (error instanceof ForbiddenError) return "policies";
  if (error instanceof NotFoundError) return "no-results-s";
  return "something-broke";
};
