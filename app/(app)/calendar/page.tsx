"use client";

import { PageGate } from "@/components/auth/PageGate";
import { CompanyCalendarBoardContainer } from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/CompanyCalendarBoardContainer";

export default function CalendarPage() {
  return (
    <PageGate resource="PEOPLE.CALENDAR" action="VIEW">
      <div className="flex h-[calc(100svh-6rem)] flex-col gap-5">
        <section className="flex flex-none flex-col gap-2">
          <h1 className="text-3xl font-semibold">Calendar</h1>
          <p className="max-w-2xl text-[var(--color-text-tertiary)]">
            See when people across the company are off — public holidays now, time off coming soon.
          </p>
        </section>

        <div className="min-h-0 flex-1">
          <CompanyCalendarBoardContainer />
        </div>
      </div>
    </PageGate>
  );
}
