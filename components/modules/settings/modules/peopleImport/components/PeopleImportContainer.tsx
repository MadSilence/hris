"use client";

import React, { useState } from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { useCurrentPeopleImport } from "@/components/modules/settings/modules/peopleImport/hooks";
import { UploadStep } from "./UploadStep";
import { MapStep } from "./MapStep";
import { ConfirmStep } from "./ConfirmStep";
import { ProgressStep } from "./ProgressStep";
import { ReportStep } from "./ReportStep";

/**
 * People import (PEOPLE_IMPORT.md § 3). One page whose step is the import's own status, read
 * from the server — so a reload, or coming back after the job finished, lands where things are.
 */
export const PeopleImportContainer: React.FC = () => {
  const current = useCurrentPeopleImport();
  // After a report, "Import another file" shows the upload without forgetting the report on the server.
  const [startedNew, setStartedNew] = useState<string | null>(null);

  const anImport = current.data ?? null;

  if (current.isLoading) {
    return (
      <div className="flex max-w-3xl flex-col gap-3 px-8">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  // Somebody holding none of the import rights: the page is not theirs, and "Try again" would not change
  // that (walk of 2026-10-30). The menu hides the entry from them; a typed address still lands here.
  if (current.error instanceof ForbiddenError) {
    return <AccessDenied />;
  }
  if (current.error) {
    return (
      <div className="px-8">
        <ErrorState error={current.error} onRetry={() => void current.refetch()} />
      </div>
    );
  }

  const over = anImport !== null
    && (anImport.status === "COMPLETED" || anImport.status === "COMPLETED_WITH_FAILURES" || anImport.status === "FAILED");
  const showUpload = anImport === null || anImport.status === "DISCARDED" || (over && startedNew === anImport.id);

  return (
    <div className="flex w-full flex-col gap-6 overflow-auto px-8 pb-10">
      {showUpload && <UploadStep />}
      {!showUpload && anImport && (anImport.status === "UPLOADED" || anImport.status === "MAPPED") && (
        <MapStep key={`${anImport.id}-${anImport.checkedAt ?? "unchecked"}`} anImport={anImport} />
      )}
      {!showUpload && anImport?.status === "CHECKED" && <ConfirmStep anImport={anImport} />}
      {!showUpload && anImport?.status === "APPLYING" && <ProgressStep anImport={anImport} />}
      {!showUpload && anImport && over && (
        <ReportStep anImport={anImport} onStartAnother={() => setStartedNew(anImport.id)} />
      )}
    </div>
  );
};
