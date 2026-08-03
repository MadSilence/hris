import { hrisApiUserPublicHolidaysClient } from "@/api/modules/publicHolidays/userHolidays/clients";
import type { UserPublicHoliday } from "@/models/publicHolidays/userHoliday";

export class HrisUserPublicHolidaysService {
  public async listByUserId(userId: string, year?: number): Promise<UserPublicHoliday[]> {
    return hrisApiUserPublicHolidaysClient.listByUserId(userId, year);
  }
}

export const hrisUserPublicHolidaysService = new HrisUserPublicHolidaysService();
