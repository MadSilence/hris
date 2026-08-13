"use client";

import { FC, ReactNode, useMemo } from "react";

import { useUserPublicHolidays } from "@/components/modules/calendar/hooks/useUserPublicHolidays";
import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import {
  UserCalendar,
  type CalendarHolidayEvent,
  type CalendarTimeOffEvent,
} from "@/components/modules/calendar/components/UserCalendar/UserCalendar";

type Props = {
  userId: string;
  variant?: "full" | "compact";
  headerAction?: ReactNode;
  onSelectRange?: (startISO: string, endISO: string) => void;
};

export const UserCalendarContainer: FC<Props> = ({ userId, variant = "full", headerAction, onSelectRange }) => {
  const { data: holidays, isLoading: holidaysLoading } = useUserPublicHolidays({ userId });
  const { data: requests, isLoading: requestsLoading } = useTimeOffRequestsByUser({ userId });
  const { data: policies, isLoading: policiesLoading } = useTimeOffPolicies();

  // Expand each holiday's [holidayDate, endDate] span into one per-day event so multi-day holidays
  // mark every day they cover on the month grid.
  const holidayEvents = useMemo<CalendarHolidayEvent[]>(() => {
    const out: CalendarHolidayEvent[] = [];
    for (const h of holidays ?? []) {
      const start = h.holidayDate;
      const end = h.endDate && h.endDate >= h.holidayDate ? h.endDate : h.holidayDate;
      const cursor = new Date(`${start}T00:00:00`);
      const last = new Date(`${end}T00:00:00`);
      if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) {
        out.push({ id: h.id, name: h.name, date: start, calendarName: h.calendarName });
        continue;
      }
      while (cursor <= last) {
        const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
        out.push({ id: `${h.id}:${iso}`, name: h.name, date: iso, calendarName: h.calendarName });
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return out;
  }, [holidays]);

  const timeOffEvents = useMemo<CalendarTimeOffEvent[]>(() => {
    const policyName = new Map((policies ?? []).map((p) => [p.id, p.displayName]));
    return (requests ?? [])
      .filter(
        (r) =>
          r.status === TimeOffRequestStatus.Approved ||
          r.status === TimeOffRequestStatus.Pending,
      )
      .map((r) => ({
        id: r.id,
        label: policyName.get(r.policyId) ?? "Time off",
        startDate: r.startDate,
        endDate: r.endDate,
        tone: r.status === TimeOffRequestStatus.Approved ? "approved" : "pending",
      }));
  }, [requests, policies]);

  return (
    <UserCalendar
      holidays={holidayEvents}
      timeOff={timeOffEvents}
      isLoading={holidaysLoading || requestsLoading || policiesLoading}
      variant={variant}
      headerAction={headerAction}
      onSelectRange={onSelectRange}
    />
  );
};

export default UserCalendarContainer;
