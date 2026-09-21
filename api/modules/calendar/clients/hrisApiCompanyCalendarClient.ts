import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  CompanyCalendarGroup,
  CompanyCalendarGrouping,
  CompanyCalendarMark,
  CompanyCalendarPeoplePage,
} from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";

export type CompanyCalendarPeopleQuery = {
  cursor?: string;
  limit?: number;
  q?: string;
  filters?: FilterDTO[] | null;
  /** With `groupBy` set, the rows of one group; a null `groupId` is the "no value" group. */
  groupBy?: CompanyCalendarGrouping | null;
  groupId?: string | null;
};

export type CompanyCalendarGroupsQuery = {
  q?: string;
  filters?: FilterDTO[] | null;
  groupBy: CompanyCalendarGrouping;
};

export type CompanyCalendarMarksQuery = {
  from: string;
  to: string;
  userIds: string[];
};

export class HrisApiCompanyCalendarClient {
  private readonly BASE_PATH = "/calendar/company";

  public async people(params: CompanyCalendarPeopleQuery): Promise<CompanyCalendarPeoplePage> {
    return hrisApiClient.post<CompanyCalendarPeoplePage>(`${this.BASE_PATH}/people`, {
      cursor: params.cursor ?? null,
      limit: params.limit ?? null,
      q: params.q ?? null,
      filters: params.filters ?? null,
      groupBy: params.groupBy ?? null,
      groupId: params.groupId ?? null,
    });
  }

  public async groups(params: CompanyCalendarGroupsQuery): Promise<CompanyCalendarGroup[]> {
    return hrisApiClient.post<CompanyCalendarGroup[]>(`${this.BASE_PATH}/groups`, {
      q: params.q ?? null,
      filters: params.filters ?? null,
      groupBy: params.groupBy,
    });
  }

  public async marks(params: CompanyCalendarMarksQuery): Promise<CompanyCalendarMark[]> {
    return hrisApiClient.post<CompanyCalendarMark[]>(`${this.BASE_PATH}/marks`, {
      from: params.from,
      to: params.to,
      userIds: params.userIds,
    });
  }
}

export const hrisApiCompanyCalendarClient = new HrisApiCompanyCalendarClient();
