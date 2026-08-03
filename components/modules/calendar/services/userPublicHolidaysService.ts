import { internalApiClient } from "@/components/clients/apiClient";
import type { UserPublicHoliday } from "@/models/publicHolidays/userHoliday";

export class UserPublicHolidaysService {
  public async listByUserId(userId: string, year?: number): Promise<UserPublicHoliday[]> {
    const qs = year ? `?year=${year}` : "";
    return internalApiClient.get<UserPublicHoliday[]>(
      `/users/${userId}/public-holidays${qs}`,
    );
  }
}

export const userPublicHolidaysService = new UserPublicHolidaysService();
