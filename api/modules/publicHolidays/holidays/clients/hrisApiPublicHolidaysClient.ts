import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  CreatePublicHolidayRequest,
  PublicHolidayDTO,
  RenamePublicHolidayRequest,
  UpdatePublicHolidayRequest,
} from "@/api/modules/publicHolidays/holidays/dto";
import { publicHolidayMapper } from "@/api/modules/publicHolidays/holidays/mappers";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { PublicHoliday } from "@/models/publicHolidays/holiday";

export class HrisApiPublicHolidaysClient {
  public async create(
    calendarId: string,
    body: CreatePublicHolidayRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      `/public-holiday-calendars/${calendarId}/holidays`,
      body as unknown as Record<string, unknown>
    );
  }

  public async list(calendarId: string): Promise<PublicHoliday[]> {
    const dtos = await hrisApiClient.get<PublicHolidayDTO[]>(
      `/public-holiday-calendars/${calendarId}/holidays`
    );

    return publicHolidayMapper.mapPublicHolidayDTOs(dtos);
  }

  public async getById(id: string): Promise<PublicHoliday> {
    const dto = await hrisApiClient.get<PublicHolidayDTO>(
      `/public-holidays/${id}`
    );

    return publicHolidayMapper.mapPublicHolidayDTO(dto);
  }

  public async update(
    id: string,
    body: UpdatePublicHolidayRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, UpdatePublicHolidayRequest>(
      `/public-holidays/${id}`,
      body
    );
  }

  public async rename(
    id: string,
    body: RenamePublicHolidayRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `/public-holidays/${id}/rename`,
      body as unknown as Record<string, unknown>
    );
  }

  public async delete(id: string): Promise<void> {
    return hrisApiClient.post<void>(`/public-holidays/${id}/delete`);
  }
}

export const hrisApiPublicHolidaysClient =
  new HrisApiPublicHolidaysClient();
