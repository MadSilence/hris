import { internalApiClient } from "@/components/clients/apiClient";
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
  filters?: FilterDTO[];
  /** One group of a grouped board. `id: null` is the "no value" group. */
  group?: { by: CompanyCalendarGrouping; id: string | null } | null;
};

export type CompanyCalendarGroupsQuery = {
  q?: string;
  filters?: FilterDTO[];
  groupBy: CompanyCalendarGrouping;
};

export type CompanyCalendarMarksQuery = {
  from: string;
  to: string;
  userIds: string[];
};

/**
 * Rows and marks are two calls on purpose: they change for different reasons, and one combined
 * response tied the roster's paging to the date window — so moving the month silently dropped every
 * page the reader had already scrolled past.
 */
export class CompanyCalendarService {
  /** POST for a read: it carries filter rows, which do not belong in a query string. */
  public async people(params: CompanyCalendarPeopleQuery): Promise<CompanyCalendarPeoplePage> {
    return internalApiClient.post<CompanyCalendarPeoplePage>("/calendar/company/people", {
      cursor: params.cursor ?? null,
      limit: params.limit ?? null,
      q: params.q ?? null,
      filters: params.filters?.length ? params.filters : null,
      groupBy: params.group?.by ?? null,
      groupId: params.group?.id ?? null,
    });
  }

  /** The headers of a grouped board, each with its count — same search and filters as the rows. */
  public async groups(params: CompanyCalendarGroupsQuery): Promise<CompanyCalendarGroup[]> {
    return internalApiClient.post<CompanyCalendarGroup[]>("/calendar/company/groups", {
      q: params.q ?? null,
      filters: params.filters?.length ? params.filters : null,
      groupBy: params.groupBy,
    });
  }

  /** A read with a body: the id list is as long as the reader has scrolled. */
  public async marks(params: CompanyCalendarMarksQuery): Promise<CompanyCalendarMark[]> {
    return internalApiClient.post<CompanyCalendarMark[]>("/calendar/company/marks", {
      from: params.from,
      to: params.to,
      userIds: params.userIds,
    });
  }
}

export const companyCalendarService = new CompanyCalendarService();
