import { internalApiClient } from "@/components/clients/apiClient";
import type { CompanyCalendarMark, CompanyCalendarPeoplePage } from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";

export type CompanyCalendarPeopleQuery = {
  cursor?: string;
  limit?: number;
  q?: string;
  filters?: FilterDTO[];
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
