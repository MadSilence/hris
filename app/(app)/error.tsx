"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";

/**
 * The route-level net for the signed-in shell — SPEC § 12's 500.
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
 * the server log, which is why it is the error ID shown.
 *
 * SPEC's example line is "Your work is saved." — not said here, because nothing guarantees it.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  React.useEffect(() => {
    console.error("Unhandled error in the app shell:", error, error.digest ?? "");
  }, [error]);

  return (
    <ErrorPage
      scene="something-broke"
      title={t("errorPages.serverTitle")}
      line={t("errorPages.serverLine")}
      reference={error.digest}
      actions={
        <>
          <Button type="button" onClick={reset}>
            {tCommon("actions.retry")}
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">{tCommon("actions.goHome")}</Link>
          </Button>
        </>
      }
    />
  );
}
