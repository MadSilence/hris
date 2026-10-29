import {
  hrisApiCompanyCalendarClient,
  type CompanyCalendarCapacityQuery,
  type CompanyCalendarExportRequest,
  type CompanyCalendarGroupsQuery,
  type CompanyCalendarMarksQuery,
  type CompanyCalendarPeopleQuery,
} from "@/api/modules/calendar/clients";
import type {
  CompanyCalendarAbsence,
  CompanyCalendarCapacity,
  CompanyCalendarGroup,
  CompanyCalendarMark,
  CompanyCalendarPeoplePage,
} from "@/models/calendar";

export class HrisCompanyCalendarService {
  public async people(params: CompanyCalendarPeopleQuery): Promise<CompanyCalendarPeoplePage> {
    return hrisApiCompanyCalendarClient.people(params);
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

  public async capacity(params: CompanyCalendarCapacityQuery): Promise<CompanyCalendarCapacity[]> {
    return hrisApiCompanyCalendarClient.capacity(params);
  }

  public async absences(params: CompanyCalendarMarksQuery): Promise<CompanyCalendarAbsence[]> {
    return hrisApiCompanyCalendarClient.absences(params);
  }
}

export const hrisCompanyCalendarService = new HrisCompanyCalendarService();
