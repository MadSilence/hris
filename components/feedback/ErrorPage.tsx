import * as React from "react";
import { useTranslations } from "next-intl";

import { Illustration } from "@/components/illustrations/Illustration";
import type { Scene } from "@/components/illustrations/scenes";
import { cn } from "@/lib/cn";

/*
 * A whole page that could not be shown — 404, 403, 500 (SPEC § 12): an M illustration, a short title, one
 * line of at most six words, one primary and one secondary action. Never a dead end, so `actions` is required.
 *
 * `reference` is the error ID a 500 shows in small mono text, for support to match against the server log.
 * `fullScreen` is for a page outside the shell (the root 404 and 403); inside the shell the sidebar stays and
 * only the content area is replaced. `drawing` replaces the scene for a page with a picture of its own — the 404.
 */
export function ErrorPage({
  scene,
  drawing,
  title,
  line,
  actions,
  reference,
  fullScreen = false,
}: ({ scene: Scene; drawing?: never } | { drawing: React.ReactNode; scene?: never }) & {
  title: string;
  line: string;
  actions: React.ReactNode;
  reference?: string;
  fullScreen?: boolean;
}) {
  const t = useTranslations("common");
  return (
    <main
      className={
        fullScreen
          ? "flex min-h-svh items-center justify-center bg-page p-8"
          : "flex min-h-[60vh] items-center justify-center p-8"
      }
    >
      <div className={cn("flex flex-col items-center gap-6 text-center", drawing ? "max-w-xl" : "max-w-md")}>
        {drawing ?? (scene && <Illustration scene={scene} size="m" />)}
        <div className="flex flex-col gap-2">
          <h1 className="text-page-title text-primary">{title}</h1>
          <p className="text-body text-secondary">{line}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
        {reference && (
          <p className="font-mono text-hint text-tertiary" data-testid="error-reference">
            {t("errorState.errorId", { reference })}
          </p>
        )}
      </div>
    </main>
  );
}
