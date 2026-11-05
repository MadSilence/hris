"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { PageGate } from "@/components/auth/PageGate";
import { AttendanceOverviewContainer } from "@/components/modules/attendance/overview";

/**
 * The company's attendance: people and their logged time over a period. For those who manage
 * attendance — an employee logs their own time on their profile and never sees this page.
 */
export default function AttendancePage() {
  const t = useTranslations("attendance");
  return (
    <PageGate resource="PEOPLE.ATTENDANCE" action="MANAGE">
      <div className="flex h-[calc(100svh-6rem)] min-h-0 flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-page-title">{t("page.title")}</h1>
          <p className="max-w-2xl text-tertiary">{t("page.description")}</p>
        </section>

        <Suspense fallback={null}>
          <AttendanceOverviewContainer/>
        </Suspense>
      </div>
    </PageGate>
  );
}
