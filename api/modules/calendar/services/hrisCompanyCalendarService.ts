import {
  hrisApiCompanyCalendarClient,
  type CompanyCalendarQuery,
} from "@/api/modules/calendar/clients";
import type { CompanyCalendarPage } from "@/models/calendar";

export class HrisCompanyCalendarService {
  public async company(params: CompanyCalendarQuery): Promise<CompanyCalendarPage> {
    return hrisApiCompanyCalendarClient.company(params);
  }
}

export const hrisCompanyCalendarService = new HrisCompanyCalendarService();
