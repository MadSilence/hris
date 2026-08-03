import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { UserPublicHoliday } from "@/models/publicHolidays/userHoliday";

export class HrisApiUserPublicHolidaysClient {
  private readonly USERS_PATH = "/users";

  public async listByUserId(userId: string, year?: number): Promise<UserPublicHoliday[]> {
    const qs = year ? `?year=${year}` : "";
    return hrisApiClient.get<UserPublicHoliday[]>(
      `${this.USERS_PATH}/${userId}/public-holidays${qs}`,
    );
  }
}

export const hrisApiUserPublicHolidaysClient = new HrisApiUserPublicHolidaysClient();
