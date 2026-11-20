"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Illustration, type Scene } from "@/components/illustrations";

type Props = {
  /** Defaults describe an empty folder; the trash passes its own wording. */
  title?: string;
  /** Null: no second line at all (a reader with nothing to add — REDESIGN F5.1). */
  description?: string | null;
  /** The folder's picture by default; the trash passes its bin. */
  scene?: Extract<Scene, "documents" | "trash">;
};

/**
 * The "there is nothing here" panel for the Documents tab and its trash.
 *
 * It fills the space it is given rather than sitting as a small card at the top of an otherwise
 * blank page — an empty folder should look like an empty folder, not like a notice that failed to
 * load. Dashed edge and a tint, so it reads as a place waiting for content instead of a surface.
 */
export const PersonalDocumentsEmptyState: React.FC<Props> = ({
  title,
  description,
  scene = "documents",
}) => {
  const t = useTranslations("organization");

  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-divider bg-subtle/40 p-10 text-center">
      <Illustration scene={scene} />

      <h3 className="text-body font-medium text-primary">{title ?? t("documents.emptyState.title")}</h3>

      {description !== null && (
        <p className="max-w-sm text-body text-tertiary">{description ?? t("documents.emptyState.description")}</p>
      )}
    </div>
  );
};

/**
 * An empty folder (or an empty view). "Drop files here or use Add." only for somebody who may add: a reader who may
 * not upload sees one line and no buttons (REDESIGN_SMOKE_TESTS F5.1 — the walk of 2026-11-19 found the hint shown
 * to a manager with view rights, beside no Add button).
 */
export const EmptyFolderState: React.FC<{ canAdd: boolean }> = ({ canAdd }) => {
  const t = useTranslations("organization");
  return (
    <PersonalDocumentsEmptyState
      title={t("documents.container.emptyFolderTitle")}
      description={canAdd ? t("documents.container.emptyFolderDescription") : null}
    />
  );
};
