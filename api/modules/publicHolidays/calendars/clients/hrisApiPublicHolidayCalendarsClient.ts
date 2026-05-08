import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  CreatePublicHolidayCalendarRequest,
  PublicHolidayCalendarDTO,
  RenamePublicHolidayCalendarRequest,
  UpdatePublicHolidayCalendarRequest,
} from "@/api/modules/publicHolidays/calendars/dto";
import { publicHolidayCalendarMapper } from "@/api/modules/publicHolidays/calendars/mappers";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";

export class HrisApiPublicHolidayCalendarsClient {
  private readonly BASE_PATH = "/public-holiday-calendars";

  public async create(
    body: CreatePublicHolidayCalendarRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      this.BASE_PATH,
      body as unknown as Record<string, unknown>
    );
  }

  public async list(): Promise<PublicHolidayCalendar[]> {
    const dtos = await hrisApiClient.get<PublicHolidayCalendarDTO[]>(
      this.BASE_PATH
    );

    return publicHolidayCalendarMapper.mapPublicHolidayCalendarDTOs(dtos);
  }

  public async getById(id: string): Promise<PublicHolidayCalendar> {
    const dto = await hrisApiClient.get<PublicHolidayCalendarDTO>(
      `${this.BASE_PATH}/${id}`
    );

    return publicHolidayCalendarMapper.mapPublicHolidayCalendarDTO(dto);
  }

  public async update(
    id: string,
    body: UpdatePublicHolidayCalendarRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<
      UpdateResponse,
      UpdatePublicHolidayCalendarRequest
    >(`${this.BASE_PATH}/${id}`, body);
  }

  public async rename(
    id: string,
    body: RenamePublicHolidayCalendarRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/rename`,
      body as unknown as Record<string, unknown>
    );
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/activate`
    );
  }

  public async deactivate(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/deactivate`
    );
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/archive`
    );
  }

  public async delete(id: string): Promise<void> {
    return hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/delete`);
  }
}

export const hrisApiPublicHolidayCalendarsClient =
  new HrisApiPublicHolidayCalendarsClient();
