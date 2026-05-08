import { hrisApiPublicHolidayCalendarsClient } from "@/api/modules/publicHolidays/calendars/clients";
import type {
  CreatePublicHolidayCalendarRequest,
  RenamePublicHolidayCalendarRequest,
  UpdatePublicHolidayCalendarRequest,
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

  public async update(
    id: string,
    body: UpdatePublicHolidayCalendarRequest
  ): Promise<UpdateResponse> {
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

  public async delete(id: string): Promise<void> {
    return hrisApiPublicHolidayCalendarsClient.delete(id);
  }
}

export const hrisPublicHolidayCalendarsService =
  new HrisPublicHolidayCalendarsService();
