import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  CompanyCalendarGroup,
  CompanyCalendarGrouping,
  CompanyCalendarAbsence,
  CompanyCalendarMark,
  CompanyCalendarPeoplePage,
} from "@/models/calendar";
import type { CompanyCalendarAbsenceSummary } from "@/models/calendar";
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

/** The board as a file: its window, search and filters. Exported flat, whatever the grouping. */
export type CompanyCalendarExportRequest = {
  from: string;
  to: string;
  q: string | null;
  filters: FilterDTO[] | null;
  format: "csv" | "xlsx";
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

  /**
   * The count beside a saved view (B5): the people the board would show for its `q` and `filters`, within the
   * reader's own calendar scope.
   */
  public async count(params: { q?: string | null; filters?: FilterDTO[] | null }): Promise<{ total: number }> {
    return hrisApiClient.post<{ total: number }>(`${this.BASE_PATH}/people/count`, {
      q: params.q ?? null,
      filters: params.filters ?? null,
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
  /** A binary download; the body is passed through as the board sent it. */
  public async export(body: CompanyCalendarExportRequest): Promise<Response> {
    return hrisApiClient.postForBinary(`${this.BASE_PATH}/export?format=${body.format}`, body);
  }

  /** Leave on the same rows and window; what each bar carries is decided by the server. */
  public async absences(params: CompanyCalendarMarksQuery): Promise<CompanyCalendarAbsence[]> {
    return hrisApiClient.post<CompanyCalendarAbsence[]>(`${this.BASE_PATH}/absences`, {
      from: params.from,
      to: params.to,
      userIds: params.userIds,
    });
  }

  /** One person's absence today and their next one, for the profile header (R12). */
  public async currentAndNext(userId: string): Promise<CompanyCalendarAbsenceSummary> {
    return hrisApiClient.get<CompanyCalendarAbsenceSummary>(
      `${this.BASE_PATH}/people/${encodeURIComponent(userId)}/absences/current-and-next`,
    );
  }

}

export const hrisApiCompanyCalendarClient = new HrisApiCompanyCalendarClient();
