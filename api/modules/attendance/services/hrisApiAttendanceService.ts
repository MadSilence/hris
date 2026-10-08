import { hrisApiAttendanceClient } from "@/api/modules/attendance/clients";
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

const trimmed = (text: string | null | undefined): string | null => (text?.trim() ? text.trim() : null);

/** Only the keys the backend reads travel, so the BFF passes nothing through by accident. */
const periodOf = (body: AttendancePeriod): AttendancePeriod => ({
  from: body.from,
  to: body.to,
  expectedUntil: body.expectedUntil ?? null,
});

/**
 * The seam for Attendance and the work schedule: every transport — route handler, server action,
 * RSC — converges here. Authorization is Java's; nothing is checked on this side.
 */
export class HrisApiAttendanceService {
  public async log(userId: string, period: AttendancePeriod): Promise<AttendanceLog> {
    return hrisApiAttendanceClient.log(userId, periodOf(period));
  }

  public async capabilities(userId: string): Promise<AttendanceCapabilities> {
    return hrisApiAttendanceClient.capabilities(userId);
  }

  public async logEntries(userId: string, body: AttendanceEntryWriteRequest): Promise<AttendanceEntry[]> {
    return hrisApiAttendanceClient.logEntries(userId, {
      dates: body.dates,
      startTime: body.startTime,
      endTime: body.endTime,
      description: trimmed(body.description),
    });
  }

  public async amendEntry(userId: string, entryId: string, body: AttendanceEntryUpdateRequest): Promise<AttendanceEntry> {
    return hrisApiAttendanceClient.amendEntry(userId, entryId, {
      startTime: body.startTime,
      endTime: body.endTime,
      description: trimmed(body.description),
    });
  }

  public async removeEntry(userId: string, entryId: string): Promise<void> {
    return hrisApiAttendanceClient.removeEntry(userId, entryId);
  }

  public async report(body: AttendanceReportRequest): Promise<AttendanceReportPage> {
    return hrisApiAttendanceClient.report({
      ...periodOf(body),
      q: body.q ?? null,
      filters: body.filters?.length ? body.filters : null,
      cursor: body.cursor ?? null,
      limit: body.limit ?? null,
    });
  }

  public async exportReport(body: AttendanceExportRequest, format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiAttendanceClient.exportReport({
      ...periodOf(body),
      q: body.q ?? null,
      filters: body.filters?.length ? body.filters : null,
      format,
    });
  }

  public async workSchedules(userId: string): Promise<WorkSchedule[]> {
    return hrisApiAttendanceClient.workSchedules(userId);
  }

  public async addWorkSchedule(userId: string, body: WorkScheduleWriteRequest): Promise<WorkSchedule> {
    return hrisApiAttendanceClient.addWorkSchedule(userId, body);
  }
}

export const hrisApiAttendanceService = new HrisApiAttendanceService();
