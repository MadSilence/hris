import {
  hrisApiCompanyCalendarClient,
  type CompanyCalendarExportRequest,
  type CompanyCalendarGroupsQuery,
  type CompanyCalendarMarksQuery,
  type CompanyCalendarPeopleQuery,
} from "@/api/modules/calendar/clients";
import type {
  CompanyCalendarAbsence,
  CompanyCalendarAbsenceSummary,
  CompanyCalendarGroup,
  CompanyCalendarMark,
  CompanyCalendarPeoplePage,
} from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";

export class HrisCompanyCalendarService {
  public async people(params: CompanyCalendarPeopleQuery): Promise<CompanyCalendarPeoplePage> {
    return hrisApiCompanyCalendarClient.people(params);
  }

  public async count(params: { q?: string | null; filters?: FilterDTO[] | null }): Promise<{ total: number }> {
    return hrisApiCompanyCalendarClient.count(params);
  }

  public async groups(params: CompanyCalendarGroupsQuery): Promise<CompanyCalendarGroup[]> {
    return hrisApiCompanyCalendarClient.groups(params);
  }

  public async marks(params: CompanyCalendarMarksQuery): Promise<CompanyCalendarMark[]> {
    return hrisApiCompanyCalendarClient.marks(params);
  }

  public async export(body: CompanyCalendarExportRequest): Promise<Response> {
    return hrisApiCompanyCalendarClient.export(body);
  }

  public async absences(params: CompanyCalendarMarksQuery): Promise<CompanyCalendarAbsence[]> {
    return hrisApiCompanyCalendarClient.absences(params);
  }

  public async currentAndNext(userId: string): Promise<CompanyCalendarAbsenceSummary> {
    return hrisApiCompanyCalendarClient.currentAndNext(userId);
  }
}

export const hrisCompanyCalendarService = new HrisCompanyCalendarService();
