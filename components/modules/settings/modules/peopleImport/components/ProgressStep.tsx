"use client";

import React from "react";
import { Progress } from "@/public/desact/src/components/ui/progress";
import type { PeopleImportDTO } from "@/api/modules/peopleImport/dto";

/** Step 5: the job runs on the server; the page can be left and come back to. */
export const ProgressStep: React.FC<{ anImport: PeopleImportDTO }> = ({ anImport }) => {
  const total = Math.max(anImport.rowCount, 1);
  const done = Math.min(anImport.processedCount, total);
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <p className="text-sm font-medium text-brown-800">Importing {anImport.fileName}…</p>
      <Progress value={(done / total) * 100} aria-label="Import progress" />
      <p className="text-sm text-muted-foreground">
        {done} of {anImport.rowCount} rows. You can leave this page — the import carries on and the report waits here.
      </p>
    </div>
  );
};
