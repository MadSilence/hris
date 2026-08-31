"use client";

import * as React from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FALLBACK_ERROR_MESSAGE } from "@/lib/errors/errorMessages";

/**
 * The route-level net for the signed-in shell.
 *
 * Next.js renders this in place of the page segment when something throws during render, keeping
 * the layout — sidebar, navigation, header — mounted. Before it existed there was no `error.tsx`
 * anywhere in the app, so a failed fetch in one container reached the framework's own handler and
 * the person lost the entire interface.
 *
 * The message is deliberately not read. Next.js flattens whatever was thrown into a plain `Error`
 * as it crosses the RSC boundary, so the class is gone and only a developer's sentence is left —
 * the first smoke run found "Cannot reach the API at http://localhost:8081 — is the backend
 * running?" on screen. In production the message is stripped anyway and `digest` identifies it in
 * the server log.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Unhandled error in the app shell:", error, error.digest ?? "");
  }, [error]);

  return (
    <ErrorState
      error={error}
      title="Something went wrong"
      message={FALLBACK_ERROR_MESSAGE}
      onRetry={reset}
    />
  );
}
