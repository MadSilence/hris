import { EXPORT_QUERY_KEYS, hrisApiAttendanceClient } from "@/api/modules/attendance/clients";
import type {
  AttendanceCapabilities,
  AttendanceEntry,
  AttendanceMonth,
  RecordAttendanceDayRequest,
  WorkSchedule,
  WorkScheduleWriteRequest,
} from "@/models/attendance";

/**
 * The seam for the timesheet and the work schedule: every transport — route handler, server action,
 * RSC — converges here. Authorization is Java's; nothing is checked on this side.
 */
export class HrisApiAttendanceService {
  public async month(userId: string, month?: string | null): Promise<AttendanceMonth> {
    return hrisApiAttendanceClient.month(userId, month);
  }

  public async capabilities(userId: string): Promise<AttendanceCapabilities> {
    return hrisApiAttendanceClient.capabilities(userId);
  }

  public async recordDay(userId: string, date: string, body: RecordAttendanceDayRequest): Promise<AttendanceEntry> {
    return hrisApiAttendanceClient.recordDay(userId, date, {
      hours: body.hours,
      description: body.description?.trim() ? body.description.trim() : null,
    });
  }

  public async workSchedules(userId: string): Promise<WorkSchedule[]> {
    return hrisApiAttendanceClient.workSchedules(userId);
  }

  public async addWorkSchedule(userId: string, body: WorkScheduleWriteRequest): Promise<WorkSchedule> {
    return hrisApiAttendanceClient.addWorkSchedule(userId, body);
  }

  /** Forwards only the keys an export understands, so the BFF passes nothing through by accident. */
  public async exportMonth(incoming: URLSearchParams): Promise<Response> {
    const query = new URLSearchParams();
    for (const key of EXPORT_QUERY_KEYS) {
      const value = incoming.get(key);
      if (value) query.set(key, value);
    }
    return hrisApiAttendanceClient.exportMonth(query);
  }
}

export const hrisApiAttendanceService = new HrisApiAttendanceService();
