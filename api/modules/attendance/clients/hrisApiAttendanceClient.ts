import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  AttendanceCapabilities,
  AttendanceEntry,
  AttendanceExportTarget,
  AttendanceMonth,
  RecordAttendanceDayRequest,
  WorkSchedule,
  WorkScheduleWriteRequest,
} from "@/models/attendance";

/** Backend URLs of the timesheet and the work schedule. No logic: that is the service's. */
export class HrisApiAttendanceClient {
  public async month(userId: string, month?: string | null): Promise<AttendanceMonth> {
    const query = month ? `?month=${encodeURIComponent(month)}` : "";
    return hrisApiClient.get<AttendanceMonth>(`/users/${userId}/attendance/month${query}`);
  }

  public async capabilities(userId: string): Promise<AttendanceCapabilities> {
    return hrisApiClient.get<AttendanceCapabilities>(`/users/${userId}/attendance/capabilities`);
  }

  public async recordDay(userId: string, date: string, body: RecordAttendanceDayRequest): Promise<AttendanceEntry> {
    return hrisApiClient.put<AttendanceEntry, RecordAttendanceDayRequest>(`/users/${userId}/attendance/${date}`, body);
  }

  public async workSchedules(userId: string): Promise<WorkSchedule[]> {
    return hrisApiClient.get<WorkSchedule[]>(`/users/${userId}/work-schedules`);
  }

  public async addWorkSchedule(userId: string, body: WorkScheduleWriteRequest): Promise<WorkSchedule> {
    return hrisApiClient.post<WorkSchedule>(`/users/${userId}/work-schedules`, body as unknown as Record<string, unknown>);
  }

  /** `query` carries format, month and exactly one target — Java refuses anything else (ATD00008). */
  public async exportMonth(query: URLSearchParams): Promise<Response> {
    return hrisApiClient.fetch(`/attendance/export?${query.toString()}`);
  }
}

/** The query an export is asked with, from a target the caller picked. */
export const exportQuery = (target: AttendanceExportTarget, month: string, format: "csv" | "xlsx"): URLSearchParams => {
  const params = new URLSearchParams({ format, month });
  if (target.type === "person") params.set("userId", target.userId);
  if (target.type === "team") params.set("teamId", target.teamId);
  if (target.type === "department") params.set("departmentId", target.departmentId);
  if (target.type === "company") params.set("company", "true");
  return params;
};

/** Only these keys are forwarded from a browser request; anything else is dropped at the BFF. */
export const EXPORT_QUERY_KEYS = ["format", "month", "userId", "teamId", "departmentId", "company"] as const;

export const hrisApiAttendanceClient = new HrisApiAttendanceClient();
