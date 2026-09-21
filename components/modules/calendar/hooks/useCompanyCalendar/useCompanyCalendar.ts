import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { companyCalendarService } from "@/components/modules/calendar/services/companyCalendarService";
import type { CompanyCalendarGrouping } from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";

export const COMPANY_CALENDAR_PEOPLE_QUERY_KEY = "company-calendar-people";
export const COMPANY_CALENDAR_GROUPS_QUERY_KEY = "company-calendar-groups";
export const COMPANY_CALENDAR_MARKS_QUERY_KEY = "company-calendar-marks";

const PAGE_SIZE = 25;

/** One group of a grouped board; `id: null` is the "no value" group. */
export type CompanyCalendarGroupRef = { by: CompanyCalendarGrouping; id: string | null };

/** The key segment that tells a flat roster, a named group and the "no value" group apart. */
export const groupKeySegment = (group?: CompanyCalendarGroupRef | null): string =>
  group ? `${group.by}:${group.id ?? "none"}` : "flat";

/**
 * The board's rows — the whole roster, or one group of a grouped board.
 *
 * **No dates in the key.** People and marks used to share one response and therefore one query key,
 * so moving the window started a fresh infinite query at page one: a reader who had scrolled to a
 * hundred rows was silently looking at twenty-five again after a single arrow click, and
 * `keepPreviousData` kept the old rows on screen through the fetch so nothing announced it.
 *
 * A grouped board runs one of these **per group**, and a group that is collapsed, or has not yet
 * scrolled near the screen, passes `enabled: false` and costs nothing. Each group pages on its own,
 * so loading more of one never slots rows into a group above the reader.
 */
export const useCompanyCalendarPeople = ({
  q,
  filters,
  group,
  enabled = true,
}: {
  q?: string;
  filters?: FilterDTO[];
  group?: CompanyCalendarGroupRef | null;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    queryKey: [
      COMPANY_CALENDAR_PEOPLE_QUERY_KEY,
      q ?? "",
      JSON.stringify(filters ?? []),
      groupKeySegment(group),
    ],
    queryFn: ({ pageParam }) =>
      companyCalendarService.people({ cursor: pageParam, q, filters, group, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    // A group's rows must never borrow another group's: placeholder data would draw the previous
    // key's people under this header for the length of a fetch.
    placeholderData: group ? undefined : keepPreviousData,
    enabled,
  });

/**
 * The headers of a grouped board with a count each. Off while the board is flat.
 *
 * Keyed on the search and the filters like the rows, never on the window: which group a person is
 * in does not change when the month does.
 */
export const useCompanyCalendarGroups = ({
  q,
  filters,
  groupBy,
}: {
  q?: string;
  filters?: FilterDTO[];
  groupBy: CompanyCalendarGrouping | null;
}) =>
  useQuery({
    queryKey: [COMPANY_CALENDAR_GROUPS_QUERY_KEY, q ?? "", JSON.stringify(filters ?? []), groupBy ?? ""],
    queryFn: () => companyCalendarService.groups({ q, filters, groupBy: groupBy as CompanyCalendarGrouping }),
    enabled: groupBy !== null,
  });

/**
 * The marks covering the rows currently loaded.
 *
 * Keyed on the window and the row ids, so moving the month refetches marks alone. The ids are joined
 * into the key rather than passed as an array so that loading another page — which appends ids —
 * produces a new key and one refetch, not a cache miss per row.
 */
export const useCompanyCalendarMarks = ({
  from,
  to,
  userIds,
}: {
  from: string;
  to: string;
  userIds: string[];
}) =>
  useQuery({
    queryKey: [COMPANY_CALENDAR_MARKS_QUERY_KEY, from, to, userIds.join(",")],
    queryFn: () => companyCalendarService.marks({ from, to, userIds }),
    enabled: Boolean(from && to) && userIds.length > 0,
    placeholderData: keepPreviousData,
  });
