"use client";

import { Suspense } from "react";
import { PublicHolidayCalendarNewPage } from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidayCalendarNewPage";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

function PageFallback() {
  return (
    <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function NewPublicHolidayCalendarPage() {
  return (
    <PermissionGate resource="ORG.PUBLIC_HOLIDAY_CALENDAR" action="MANAGE" fallback={<AccessDenied/>}>
      <Suspense fallback={<PageFallback />}>
        <PublicHolidayCalendarNewPage />
      </Suspense>
    </PermissionGate>
  );
}
