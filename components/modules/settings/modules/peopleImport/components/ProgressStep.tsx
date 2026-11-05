"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/desact/progress";
import type { PeopleImportDTO } from "@/api/modules/peopleImport/dto";

/** Step 5: the job runs on the server; the page can be left and come back to. */
export const ProgressStep: React.FC<{ anImport: PeopleImportDTO }> = ({ anImport }) => {
  const t = useTranslations("peopleImport");
  const total = Math.max(anImport.rowCount, 1);
  const done = Math.min(anImport.processedCount, total);
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <p className="text-body font-medium text-primary">{t("progress.importing", { fileName: anImport.fileName })}</p>
      <Progress value={(done / total) * 100} aria-label={t("progress.aria")} />
      <p className="text-body text-tertiary">
        {t("progress.rows", { done, total: anImport.rowCount })}
      </p>
    </div>
  );
};
