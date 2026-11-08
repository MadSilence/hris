"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Illustration, type Scene } from "@/components/illustrations";

type Props = {
  /** Defaults describe an empty folder; the trash passes its own wording. */
  title?: string;
  description?: string;
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

      <p className="max-w-sm text-body text-tertiary">{description ?? t("documents.emptyState.description")}</p>
    </div>
  );
};
