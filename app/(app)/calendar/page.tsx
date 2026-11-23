"use client";

import { Suspense } from "react";
import { PageGate } from "@/components/auth/PageGate";
import { CompanyCalendarBoardContainer } from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/CompanyCalendarBoardContainer";

/** The company calendar (`hris/design/screens/company-calendar`). Its state is its address, read inside a Suspense. */
export default function CalendarPage() {
  return (
    <PageGate resource="PEOPLE.CALENDAR" action="VIEW">
      <div className="flex h-[calc(100cqh-6rem)] flex-col">
        <Suspense fallback={null}>
          <CompanyCalendarBoardContainer />
        </Suspense>
      </div>
    </PageGate>
  );
}
