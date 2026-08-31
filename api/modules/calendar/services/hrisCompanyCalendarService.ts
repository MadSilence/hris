import {
  hrisApiCompanyCalendarClient,
  type CompanyCalendarMarksQuery,
  type CompanyCalendarPeopleQuery,
} from "@/api/modules/calendar/clients";
import type { CompanyCalendarMark, CompanyCalendarPeoplePage } from "@/models/calendar";

export class HrisCompanyCalendarService {
  public async people(params: CompanyCalendarPeopleQuery): Promise<CompanyCalendarPeoplePage> {
    return hrisApiCompanyCalendarClient.people(params);
  }

  public async marks(params: CompanyCalendarMarksQuery): Promise<CompanyCalendarMark[]> {
    return hrisApiCompanyCalendarClient.marks(params);
  }
}

export const hrisCompanyCalendarService = new HrisCompanyCalendarService();
