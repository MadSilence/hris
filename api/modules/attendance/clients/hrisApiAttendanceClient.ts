import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  AttendanceCapabilities,
  AttendanceEntry,
  AttendanceEntryUpdateRequest,
  AttendanceEntryWriteRequest,
  AttendanceExportRequest,
  AttendanceLog,
  AttendancePeriod,
  AttendanceReportPage,
  AttendanceReportRequest,
  WorkSchedule,
  WorkScheduleWriteRequest,
} from "@/models/attendance";

/** Backend URLs of Attendance and the work schedule. No logic: that is the service's. */
export class HrisApiAttendanceClient {
  public async log(userId: string, period: AttendancePeriod): Promise<AttendanceLog> {
    const query = new URLSearchParams({ from: period.from, to: period.to });
    if (period.expectedUntil) query.set("expectedUntil", period.expectedUntil);
    return hrisApiClient.get<AttendanceLog>(`/users/${userId}/attendance/log?${query.toString()}`);
  }

  public async capabilities(userId: string): Promise<AttendanceCapabilities> {
    return hrisApiClient.get<AttendanceCapabilities>(`/users/${userId}/attendance/capabilities`);
  }

  public async logEntries(userId: string, body: AttendanceEntryWriteRequest): Promise<AttendanceEntry[]> {
    return hrisApiClient.post<AttendanceEntry[]>(
      `/users/${userId}/attendance/entries`, body as unknown as Record<string, unknown>);
  }

  public async amendEntry(userId: string, entryId: string, body: AttendanceEntryUpdateRequest): Promise<AttendanceEntry> {
    return hrisApiClient.put<AttendanceEntry, AttendanceEntryUpdateRequest>(
      `/users/${userId}/attendance/entries/${entryId}`, body);
  }

  public async removeEntry(userId: string, entryId: string): Promise<void> {
    await hrisApiClient.delete<void>(`/users/${userId}/attendance/entries/${entryId}`);
  }

  public async report(body: AttendanceReportRequest): Promise<AttendanceReportPage> {
    return hrisApiClient.post<AttendanceReportPage>("/attendance/report", body as unknown as Record<string, unknown>);
  }

  /** The file, unread — Java names it and the route streams it through. */
  public async exportReport(body: AttendanceExportRequest & { format: "csv" | "xlsx" }): Promise<Response> {
    return hrisApiClient.postForBinary("/attendance/export", body);
  }

  public async workSchedules(userId: string): Promise<WorkSchedule[]> {
    return hrisApiClient.get<WorkSchedule[]>(`/users/${userId}/work-schedules`);
  }

  public async addWorkSchedule(userId: string, body: WorkScheduleWriteRequest): Promise<WorkSchedule> {
    return hrisApiClient.post<WorkSchedule>(`/users/${userId}/work-schedules`, body as unknown as Record<string, unknown>);
  }
}

export const hrisApiAttendanceClient = new HrisApiAttendanceClient();
