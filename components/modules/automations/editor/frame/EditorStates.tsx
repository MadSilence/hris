"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Illustration } from "@/components/illustrations";
import { EditorHeaderSkeleton } from "./EditorHeader";
import { ToolBlock } from "./ToolBlock";

const SkeletonCard: React.FC<{ wide?: boolean }> = ({ wide }) => (
  <div className="flex w-[320px] flex-col gap-3 rounded-popover border border-divider bg-card p-4 shadow-raised">
    <Skeleton className="h-3 w-24" />
    <Skeleton className={wide ? "h-4 w-56" : "h-4 w-40"} />
  </div>
);

/** Loading (F1): the header with a skeleton name, the tool block, and skeleton cards — When and two steps. */
export const EditorLoading: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="flex h-full min-h-0 flex-col bg-canvas" data-test="editor-loading">
    <EditorHeaderSkeleton onClose={onClose} />
    <div className="relative min-h-0 flex-1">
      <div className="absolute top-4 left-4">
        <ToolBlock open={null} readOnly={false} disabled={{ ai: true, add: true, who: true, runs: true, versions: true }} onToggle={() => undefined} />
      </div>
      <div className="flex flex-col items-center gap-12 pt-28" aria-hidden>
        <SkeletonCard wide />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);

/**
 * The automation could not be loaded (`automations-editor` → States, NOT-DRAWN N7): in the canvas area, the
 * something-broke scene, "It keeps running as it was.", Try again and Back to automations.
 */
export const EditorLoadError: React.FC<{ onRetry: () => void; onBack: () => void }> = ({ onRetry, onBack }) => {
  const t = useTranslations("automationsEditor");
  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <EditorHeaderSkeleton onClose={onBack} announce={false} />
      <div role="alert" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <Illustration scene="something-broke" size="s" />
        <div className="flex flex-col gap-1">
          <p className="text-card-title text-primary">{t("loadError.title")}</p>
          <p className="max-w-md text-body text-secondary">{t("loadError.body")}</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack}>
            {t("loadError.back")}
          </Button>
          <Button type="button" onClick={onRetry}>
            {t("loadError.retry")}
          </Button>
        </div>
      </div>
    </div>
  );
};
