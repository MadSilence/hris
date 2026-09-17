import { hrisApiPublicHolidayCalendarsClient } from "@/api/modules/publicHolidays/calendars/clients";
import type { PublicHolidayCalendarDeleteImpact } from "@/models/publicHolidays/calendar";
import type {
  CreatePublicHolidayCalendarRequest,
  RenamePublicHolidayCalendarRequest,
  UpdatePublicHolidayCalendarRequest,
  UpdatePublicHolidayCalendarResponse,
} from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";

export class HrisPublicHolidayCalendarsService {
  public async create(
    body: CreatePublicHolidayCalendarRequest
  ): Promise<CreateResponse> {
    return hrisApiPublicHolidayCalendarsClient.create(body);
  }

  public async list(): Promise<PublicHolidayCalendar[]> {
    return hrisApiPublicHolidayCalendarsClient.list();
  }

  public async getById(id: string): Promise<PublicHolidayCalendar> {
    return hrisApiPublicHolidayCalendarsClient.getById(id);
  }

  public async getDeleteImpact(id: string): Promise<PublicHolidayCalendarDeleteImpact> {
    return hrisApiPublicHolidayCalendarsClient.getDeleteImpact(id);
  }

  public async update(
    id: string,
    body: UpdatePublicHolidayCalendarRequest
  ): Promise<UpdatePublicHolidayCalendarResponse> {
    return hrisApiPublicHolidayCalendarsClient.update(id, body);
  }

  public async rename(
    id: string,
    body: RenamePublicHolidayCalendarRequest
  ): Promise<UpdateResponse> {
    return hrisApiPublicHolidayCalendarsClient.rename(id, body);
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiPublicHolidayCalendarsClient.activate(id);
  }

  public async deactivate(id: string): Promise<UpdateResponse> {
    return hrisApiPublicHolidayCalendarsClient.deactivate(id);
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiPublicHolidayCalendarsClient.archive(id);
  }

  public async fillYear(id: string, year: number) {
    return hrisApiPublicHolidayCalendarsClient.fillYear(id, year);
  }

  public async restore(id: string): Promise<UpdateResponse> {
    return hrisApiPublicHolidayCalendarsClient.restore(id);
  }

  public async delete(id: string): Promise<void> {
    return hrisApiPublicHolidayCalendarsClient.delete(id);
  }

  public async duplicate(id: string, name?: string): Promise<CreateResponse> {
    return hrisApiPublicHolidayCalendarsClient.duplicate(id, name);
  }

  public async exportCalendars(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiPublicHolidayCalendarsClient.exportCalendars(format);
  }

  public async exportCalendar(id: string, format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiPublicHolidayCalendarsClient.exportCalendar(id, format);
  }
}

export const hrisPublicHolidayCalendarsService =
  new HrisPublicHolidayCalendarsService();
