"use client";

import { PageGate } from "@/components/auth/PageGate";
import { TimesheetContainer } from "@/components/modules/attendance/timesheet";

export default function AttendancePage() {
  return (
    <PageGate resource="PEOPLE.ATTENDANCE" action="VIEW">
      <div className="space-y-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Timesheet</h1>
          <p className="max-w-2xl text-[var(--color-text-tertiary)]">
            Hours worked and what they were spent on, one day at a time. Days of approved leave and public
            holidays are not expected.
          </p>
        </section>

        <TimesheetContainer/>
      </div>
    </PageGate>
  );
}
