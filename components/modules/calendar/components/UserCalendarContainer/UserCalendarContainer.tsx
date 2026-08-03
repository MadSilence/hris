"use client";

import { FC, useMemo } from "react";

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
};

export const UserCalendarContainer: FC<Props> = ({ userId, variant = "full" }) => {
  const { data: holidays, isLoading: holidaysLoading } = useUserPublicHolidays({ userId });
  const { data: requests, isLoading: requestsLoading } = useTimeOffRequestsByUser({ userId });
  const { data: policies, isLoading: policiesLoading } = useTimeOffPolicies();

  const holidayEvents = useMemo<CalendarHolidayEvent[]>(
    () =>
      (holidays ?? []).map((h) => ({
        id: h.id,
        name: h.name,
        date: h.holidayDate,
        calendarName: h.calendarName,
      })),
    [holidays],
  );

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
    />
  );
};

export default UserCalendarContainer;
