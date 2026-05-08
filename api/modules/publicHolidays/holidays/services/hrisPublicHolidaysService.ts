import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";
import type {
  CreatePublicHolidayRequest,
  RenamePublicHolidayRequest,
  UpdatePublicHolidayRequest,
} from "@/api/modules/publicHolidays/holidays/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { PublicHoliday } from "@/models/publicHolidays/holiday";

export class HrisPublicHolidaysService {
  public async create(
    calendarId: string,
    body: CreatePublicHolidayRequest
  ): Promise<CreateResponse> {
    return hrisApiPublicHolidaysClient.create(calendarId, body);
  }

  public async list(calendarId: string): Promise<PublicHoliday[]> {
    return hrisApiPublicHolidaysClient.list(calendarId);
  }

  public async getById(id: string): Promise<PublicHoliday> {
    return hrisApiPublicHolidaysClient.getById(id);
  }

  public async update(
    id: string,
    body: UpdatePublicHolidayRequest
  ): Promise<UpdateResponse> {
    return hrisApiPublicHolidaysClient.update(id, body);
  }

  public async rename(
    id: string,
    body: RenamePublicHolidayRequest
  ): Promise<UpdateResponse> {
    return hrisApiPublicHolidaysClient.rename(id, body);
  }

  public async delete(id: string): Promise<void> {
    return hrisApiPublicHolidaysClient.delete(id);
  }
}

export const hrisPublicHolidaysService = new HrisPublicHolidaysService();
