"use client";

import { FC, ReactNode, useMemo } from "react";

import { useUserPublicHolidays } from "@/components/modules/calendar/hooks/useUserPublicHolidays";
import { expandSpanToDays } from "@/components/modules/calendar/lib/dateRange";
import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import {
  UserCalendar,
  type CalendarDayInfo,
  type CalendarHolidayEvent,
  type CalendarTimeOffEvent,
} from "@/components/modules/calendar/components/UserCalendar/UserCalendar";

/** Pending is on the board by default; Attendance asks for approved leave only — it is the only kind that holds a day. */
const DEFAULT_STATUSES = [TimeOffRequestStatus.Approved, TimeOffRequestStatus.Pending];

type Props = {
  userId: string;
  variant?: "full" | "compact";
  headerAction?: ReactNode;
  onSelectRange?: (startISO: string, endISO: string) => void;
  timeOffStatuses?: TimeOffRequestStatus[];
  /** Passed straight through; see `UserCalendar`. */
  selectedRange?: { start: string; end: string } | null;
  toolbar?: "grouped" | "split";
  renderDay?: (day: CalendarDayInfo) => ReactNode;
  onMonthChange?: (month: string) => void;
  footer?: (visibleDays: CalendarDayInfo[]) => ReactNode;
};

export const UserCalendarContainer: FC<Props> = ({
  userId,
  variant = "full",
  headerAction,
  onSelectRange,
  timeOffStatuses = DEFAULT_STATUSES,
  selectedRange,
  toolbar,
  renderDay,
  onMonthChange,
  footer,
}) => {
  const { data: holidays, isLoading: holidaysLoading } = useUserPublicHolidays({ userId });
  const { data: requests, isLoading: requestsLoading } = useTimeOffRequestsByUser({ userId });
  const { data: policies, isLoading: policiesLoading } = useTimeOffPolicies();

  // The month grid marks single days, so each holiday's span is expanded — through the shared
  // expander, not a local loop. There were three copies of this walk and they had already drifted;
  // see `expandSpanToDays`. The dates arriving here are observed, resolved server-side.
  const holidayEvents = useMemo<CalendarHolidayEvent[]>(
    () =>
      (holidays ?? []).flatMap((h) =>
        expandSpanToDays(h.holidayDate, h.endDate).map((iso) => ({
          id: `${h.id}:${iso}`,
          name: h.name,
          date: iso,
          calendarName: h.calendarName,
        })),
      ),
    [holidays],
  );

  const timeOffEvents = useMemo<CalendarTimeOffEvent[]>(() => {
    const policyName = new Map((policies ?? []).map((p) => [p.id, p.name]));
    return (requests ?? [])
      .filter((r) => timeOffStatuses.includes(r.status))
      .map((r) => ({
        id: r.id,
        label: policyName.get(r.policyId) ?? "Time off",
        startDate: r.startDate,
        endDate: r.endDate,
        tone: r.status === TimeOffRequestStatus.Approved ? "approved" : "pending",
      }));
  }, [requests, policies, timeOffStatuses]);

  return (
    <UserCalendar
      holidays={holidayEvents}
      timeOff={timeOffEvents}
      isLoading={holidaysLoading || requestsLoading || policiesLoading}
      variant={variant}
      headerAction={headerAction}
      onSelectRange={onSelectRange}
      selectedRange={selectedRange}
      toolbar={toolbar}
      renderDay={renderDay}
      onMonthChange={onMonthChange}
      footer={footer}
    />
  );
};

export default UserCalendarContainer;
