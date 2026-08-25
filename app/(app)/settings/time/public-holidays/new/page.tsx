"use client";

import { Suspense } from "react";
import { PublicHolidayCalendarNewPage } from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidayCalendarNewPage";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

function PageFallback() {
  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col gap-6 px-8 pt-2">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
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
