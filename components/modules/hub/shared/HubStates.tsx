"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError } from "@/components/clients/exceptions";
import { Illustration, type Scene } from "@/components/illustrations";
import { cn } from "@/lib/cn";

/*
 * The hub's states (FIXES S, U1–U6). An illustration with a caption sits in the centre of its free area — the parent
 * gives it the room (`HubPage` reaches the bottom of the viewport). A scene drawn without an `-s` cut is never smaller
 * than 160 (`company-hub` spec, the illustration size rule): `m160` is that size, `s` is only for the `-s` cuts.
 */

const SCENE_SIZES = {
  s: { size: "s" as const, className: undefined },
  // An uncut scene at `s` is drawn at 160 by the shared Illustration (the size rule).
  m160: { size: "s" as const, className: undefined },
  m: { size: "m" as const, className: undefined },
};

export const HubState: React.FC<{
  scene: Scene;
  size: keyof typeof SCENE_SIZES;
  title: string;
  /** 18/26 (a column or page empty) or 15/22 (a search, an error, a popover). */
  titleSize?: "section" | "card";
  line?: string;
  action?: React.ReactNode;
  role?: "alert";
  className?: string;
}> = ({ scene, size, title, titleSize = "card", line, action, role, className }) => {
  const s = SCENE_SIZES[size];
  return (
    <div role={role} className={cn("flex flex-1 flex-col items-center justify-center text-center", className)}>
      <Illustration scene={scene} size={s.size} className={s.className} />
      <p className={cn("mt-4 text-primary", titleSize === "section" ? "text-section-title" : "text-card-title")}>{title}</p>
      {line && <p className="mt-1 max-w-sm text-body text-secondary">{line}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

/**
 * A hub read that failed (FIXES U1): something-broke at 160, the screen's own title, and Try again — no second line,
 * except where the spec gives one (CM01, CM08: what happened, and that the work is safe). A refusal of rights keeps
 * the shared state, which offers no retry.
 */
export const HubLoadError: React.FC<{ error: unknown; title: string; line?: string; onRetry: () => void; className?: string }> = ({
  error,
  title,
  line,
  onRetry,
  className,
}) => {
  const t = useTranslations("common");
  if (error instanceof ForbiddenError) return <ErrorState error={error} />;
  return (
    <HubState
      role="alert"
      scene="something-broke"
      size="m160"
      title={title}
      line={line}
      className={cn("py-12", className)}
      action={
        <Button type="button" variant="secondary" onClick={onRetry}>
          {t("actions.retry")}
        </Button>
      }
    />
  );
};
