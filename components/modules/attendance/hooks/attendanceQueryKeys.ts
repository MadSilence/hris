export const attendanceQueryKeys = {
  root: ["ATTENDANCE"] as const,
  month: (userId: string, month: string | null) => ["ATTENDANCE", "MONTH", userId, month ?? "CURRENT"] as const,
  capabilities: (userId: string) => ["ATTENDANCE", "CAPABILITIES", userId] as const,
  workSchedules: (userId: string) => ["ATTENDANCE", "WORK_SCHEDULES", userId] as const,
};
