"use client";

import { Suspense } from "react";
import { PageGate } from "@/components/auth/PageGate";
import { AttendanceOverviewContainer } from "@/components/modules/attendance/overview";

/**
 * The company's attendance: people and their logged time over a period. For those who manage
 * attendance — an employee logs their own time on their profile and never sees this page.
 */
export default function AttendancePage() {
  return (
    <PageGate resource="PEOPLE.ATTENDANCE" action="MANAGE">
      <div className="flex h-[calc(100svh-6rem)] min-h-0 flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Attendance</h1>
          <p className="max-w-2xl text-[var(--color-text-tertiary)]">
            Time logged against what was expected, per person. Expected days leave out weekends, public holidays
            and approved leave; overtime is time beyond a day&apos;s norm, and every minute on a day without one.
          </p>
        </section>

        <Suspense fallback={null}>
          <AttendanceOverviewContainer/>
        </Suspense>
      </div>
    </PageGate>
  );
}
