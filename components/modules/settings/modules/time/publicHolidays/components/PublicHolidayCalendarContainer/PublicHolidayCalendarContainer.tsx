"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicHolidayCalendarDetailsComponent } from "../PublicHolidayCalendarDetailsComponent";
import { PublicHolidayCalendarDetailsSkeleton } from "../PublicHolidayCalendarDetailsSkeleton";
import { usePublicHolidayCalendar } from "../../hooks/usePublicHolidayCalendar";
import { usePublicHolidays } from "../../hooks/usePublicHolidays";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

const CURRENT_YEAR = new Date().getFullYear();

export default function PublicHolidayCalendarContainer() {
  const params = useParams();
  const calendarId = params.id as string;

  const [year, setYear] = useState(CURRENT_YEAR);
  const [yearPicked, setYearPicked] = useState(false);

  const {
    data: calendar,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = usePublicHolidayCalendar({ calendarId });

  /**
   * Land on a year that actually has days. A calendar filled only for next year would otherwise
   * open empty on the current one and look broken.
   */
  useEffect(() => {
    if (yearPicked || !calendar) return;

    setYearPicked(true);
    if (calendar.years.length > 0 && !calendar.years.includes(CURRENT_YEAR)) {
      setYear(calendar.years[0]);
    }
  }, [calendar, yearPicked]);

  const {
    data: holidays,
    isLoading: isHolidaysLoading,
    error: holidaysError,
  } = usePublicHolidays({ calendarId, year });

  // Rendered here, not thrown. `throw` reaches `app/(app)/error.tsx`, which deliberately ignores the
  // message \u2014 Next.js flattens the class away crossing the RSC boundary \u2014 so a coded refusal
  // arrived as "Something went wrong", and the page it belonged to was replaced whole. Keeping the
  // failure in the region that failed is the rule the rest of the app already follows.
  const failure = calendarError ?? holidaysError;
  if (failure instanceof ForbiddenError) return <AccessDenied compact/>;
  if (failure) return <ErrorState error={failure} title="This calendar could not be loaded"/>;

  if (isCalendarLoading || !calendar) {
    return <PublicHolidayCalendarDetailsSkeleton />;
  }

  return (
    <PublicHolidayCalendarDetailsComponent
      calendar={calendar}
      holidays={holidays ?? []}
      year={year}
      onYearChange={setYear}
      isHolidaysLoading={isHolidaysLoading}
    />
  );
}
