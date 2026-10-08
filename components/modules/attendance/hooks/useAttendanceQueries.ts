"use client";

import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  AttendanceCapabilities,
  AttendanceLog,
  AttendancePeriod,
  AttendanceReportPage,
  AttendanceReportRequest,
  WorkSchedule,
} from "@/models/attendance";
import type { FilterDTO } from "@/models/user/fields";
import { attendanceQueryKeys } from "./attendanceQueryKeys";

const REPORT_PAGE = 50;

/** One person's period, day by day — the person page and the profile tab read the same thing. */
export const useAttendanceLog = (userId: string | null, period: AttendancePeriod | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AttendanceLog>({
    queryKey: attendanceQueryKeys.log(userId ?? "", period ?? { from: "", to: "" }),
    queryFn: () => {
      const query = new URLSearchParams({ from: period!.from, to: period!.to });
      if (period!.expectedUntil) query.set("expectedUntil", period!.expectedUntil);
      return internalApiClient.get<AttendanceLog>(`/attendance/users/${userId}/log?${query.toString()}`);
    },
    enabled: Boolean(userId && period),
    placeholderData: keepPreviousData,
  });
};

/**
 * The overview: people over a period, a page at a time. The first page carries how many people the
 * whole report covers.
 */
export const useAttendanceReport = (params: AttendancePeriod & { q: string; filters: FilterDTO[] }, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useInfiniteQuery<AttendanceReportPage>({
    queryKey: attendanceQueryKeys.report(params),
    initialPageParam: null,
    queryFn: ({ pageParam }) => internalApiClient.post<AttendanceReportPage>("/attendance/report", {
      from: params.from,
      to: params.to,
      expectedUntil: params.expectedUntil ?? null,
      q: params.q.trim().length >= 2 ? params.q.trim() : null,
      filters: params.filters.length ? params.filters : null,
      cursor: (pageParam as string | null) ?? null,
      limit: REPORT_PAGE,
    } satisfies AttendanceReportRequest),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    enabled,
  });
};

/** What the caller may do on this person's attendance — answered by the server. */
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
 * Everything an attendance write can have changed. A span moves a day, the person's totals and the
 * overview's row; a new schedule moves the norm — so the whole module is refetched, not one key.
 */
export const useInvalidateAttendance = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.root });
};
