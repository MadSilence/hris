import type { AttendancePeriod } from "@/models/attendance";
import type { FilterDTO } from "@/models/user/fields";

export const attendanceQueryKeys = {
  root: ["ATTENDANCE"] as const,
  log: (userId: string, period: AttendancePeriod) =>
    ["ATTENDANCE", "LOG", userId, period.from, period.to, period.expectedUntil ?? null] as const,
  report: (params: AttendancePeriod & { q: string; filters: FilterDTO[] }) => ["ATTENDANCE", "REPORT", params] as const,
  capabilities: (userId: string) => ["ATTENDANCE", "CAPABILITIES", userId] as const,
  workSchedules: (userId: string) => ["ATTENDANCE", "WORK_SCHEDULES", userId] as const,
};
