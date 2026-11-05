"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useDateFormatter, useDisplayLocale } from "@/lib/date";
import type { UserPublicHoliday } from "@/models/publicHolidays/userHoliday";
import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto";
import { useMyPublicHolidays } from "@/components/modules/home/hooks";
import { isoDateInZone, weekdayOf } from "@/components/modules/home/utils/zonedTime";
import { HomeCard, HomeEmpty, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

export const UPCOMING_HOLIDAYS_LIMIT = 3;

/** The next public holidays on the reader's own calendars — observed dates, from today on. */
export const nextHolidays = (holidays: UserPublicHoliday[], today: string, limit = UPCOMING_HOLIDAYS_LIMIT) =>
  holidays
    .filter((h) => h.endDate >= today)
    .sort((a, b) => a.holidayDate.localeCompare(b.holidayDate) || a.name.localeCompare(b.name))
    .slice(0, limit);

/** The reader's next public holidays, as their own calendars give them (one calendar can differ from the next desk's). */
export const UpcomingHolidaysWidget: React.FC = () => {
  const formatDisplayDate = useDateFormatter();
  const locale = useDisplayLocale();
  const t = useTranslations("home");
  const { userId } = useCurrentUser();
  const settings = useUserSettings();
  const query = useMyPublicHolidays(userId);
  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);

  return (
    <HomeCard title={t("widgets.upcomingHolidays.title")}>
      {!userId || query.isLoading ? (
        <HomeRowsSkeleton rows={3} avatar={false} />
      ) : query.error || !query.data ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : nextHolidays(query.data, today).length === 0 ? (
        <HomeEmpty>{t("holidays.empty")}</HomeEmpty>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {nextHolidays(query.data, today).map((holiday) => (
            <li key={`${holiday.calendarId}-${holiday.id}-${holiday.holidayDate}`} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-body font-medium text-primary">{holiday.name}</span>
                <span className="block truncate text-hint text-tertiary">
                  {holiday.calendarName ?? t("holidays.calendarFallback")}
                  {holiday.dayPart === PublicHolidayDayPart.HalfDay ? ` · ${t("holidays.halfDay")}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-right text-hint text-secondary">
                {holiday.holidayDate === today ? t("card.today") : weekdayOf(holiday.holidayDate, locale)}
                <span className="block text-tertiary">
                  {formatDisplayDate(holiday.holidayDate, { style: "medium" })}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </HomeCard>
  );
};
