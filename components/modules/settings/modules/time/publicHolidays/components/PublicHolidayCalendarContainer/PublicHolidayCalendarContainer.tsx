"use client";

import { useParams } from "next/navigation";
import { PublicHolidayCalendarDetailsComponent } from "../PublicHolidayCalendarDetailsComponent";
import { PublicHolidayCalendarDetailsSkeleton } from "../PublicHolidayCalendarDetailsSkeleton";
import { usePublicHolidayCalendar } from "../../hooks/usePublicHolidayCalendar";
import { usePublicHolidays } from "../../hooks/usePublicHolidays";

export default function PublicHolidayCalendarContainer() {
  const params = useParams();
  const calendarId = params.id as string;

  const {
    data: calendar,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = usePublicHolidayCalendar({ calendarId });

  const {
    data: holidays,
    isLoading: isHolidaysLoading,
    error: holidaysError,
  } = usePublicHolidays({ calendarId });

  if (calendarError) throw calendarError;
  if (holidaysError) throw holidaysError;

  if (isCalendarLoading || isHolidaysLoading || !calendar) {
    return (
      <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
        <div className="mx-auto max-w-6xl">
          <PublicHolidayCalendarDetailsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <PublicHolidayCalendarDetailsComponent
      calendar={calendar}
      holidays={holidays ?? []}
    />
  );
}
