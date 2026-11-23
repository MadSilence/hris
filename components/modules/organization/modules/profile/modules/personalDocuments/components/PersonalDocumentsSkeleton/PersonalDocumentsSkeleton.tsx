"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/desact/skeleton";

/**
 * The tab while it loads, in its real shape (documents-tab T16, DT26): the real "Folders" label over four tile shapes
 * 68 high, a 260 × 32 shape for the view switch, the real column header row, then six rows — a 28 tile shape and bars
 * — with shimmer. A bare `border` here once drew every block in black (walk of 2026-11-18): Tailwind 4 colours it with
 * the text.
 */
export const PersonalDocumentsSkeleton: React.FC = () => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const tSigning = useTranslations("signing");
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex flex-col gap-2">
        <p className="text-label text-secondary">{t("documents.folders")}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="mt-2.5 h-[68px] rounded-card" />
          ))}
        </div>
      </div>

      <Skeleton className="h-8 w-[260px] rounded-control" />

      <div className="flex flex-col">
        <div className="flex h-10 items-center gap-4 border-b border-divider pr-1 pl-2 text-hint font-medium text-tertiary">
          <span className="w-4" />
          <span className="flex-1">{tCommon("fields.name")}</span>
          <span className="w-32">{t("documents.table.category")}</span>
          <span className="hidden w-40 md:block">{tSigning("expiry.expires")}</span>
          <span className="w-32">{t("documents.table.whoCanSee")}</span>
          <span className="w-[104px]">{t("documents.table.uploaded")}</span>
          <span className="w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex h-12 items-center gap-4 border-b border-divider pr-1 pl-2">
            <Skeleton className="size-4 rounded-glyph" />
            <span className="flex flex-1 items-center gap-3">
              <Skeleton className="size-7 rounded-control" />
              <Skeleton className="h-2.5 w-48" />
            </span>
            <Skeleton className="h-2.5 w-32" />
            <Skeleton className="hidden h-2.5 w-40 md:block" />
            <Skeleton className="h-2.5 w-32" />
            <Skeleton className="h-2.5 w-[104px]" />
            <span className="w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};
