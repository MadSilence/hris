"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { AttendanceCapabilities, AttendanceMonth, WorkSchedule } from "@/models/attendance";
import { attendanceQueryKeys } from "./attendanceQueryKeys";

/** A person's month. `month` is `yyyy-MM`; `null` asks for the company's current month. */
export const useAttendanceMonth = (userId: string | null, month: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AttendanceMonth>({
    queryKey: attendanceQueryKeys.month(userId ?? "", month),
    queryFn: () => internalApiClient.get<AttendanceMonth>(
      `/attendance/users/${userId}/month${month ? `?month=${encodeURIComponent(month)}` : ""}`,
    ),
    enabled: Boolean(userId),
  });
};

/** What the caller may do on this person's timesheet and schedule — answered by the server. */
export const useAttendanceCapabilities = (userId: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AttendanceCapabilities>({
    queryKey: attendanceQueryKeys.capabilities(userId ?? ""),
    queryFn: () => internalApiClient.get<AttendanceCapabilities>(`/attendance/users/${userId}/capabilities`),
    enabled: Boolean(userId),
  });
};

export const useWorkSchedules = (userId: string | null, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<WorkSchedule[]>({
    queryKey: attendanceQueryKeys.workSchedules(userId ?? ""),
    queryFn: () => internalApiClient.get<WorkSchedule[]>(`/attendance/users/${userId}/work-schedules`),
    enabled: Boolean(userId) && enabled,
  });
};

/**
 * Everything an attendance write can have changed. A new schedule moves the norm and which days are
 * expected, so it invalidates the months too, not only the schedule list.
 */
export const useInvalidateAttendance = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.root });
};
