"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicHolidayCalendarDetailsComponent } from "../PublicHolidayCalendarDetailsComponent";
import { PublicHolidayCalendarDetailsSkeleton } from "../PublicHolidayCalendarDetailsSkeleton";
import { usePublicHolidayCalendar } from "../../hooks/usePublicHolidayCalendar";
import { usePublicHolidays } from "../../hooks/usePublicHolidays";

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

  if (calendarError) throw calendarError;
  if (holidaysError) throw holidaysError;

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
