import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { companyCalendarService } from "@/components/modules/calendar/services/companyCalendarService";
import type { FilterDTO } from "@/models/user/fields";

export const COMPANY_CALENDAR_PEOPLE_QUERY_KEY = "company-calendar-people";
export const COMPANY_CALENDAR_MARKS_QUERY_KEY = "company-calendar-marks";

const PAGE_SIZE = 25;

/**
 * The board's rows.
 *
 * **No dates in the key.** People and marks used to share one response and therefore one query key,
 * so moving the window started a fresh infinite query at page one: a reader who had scrolled to a
 * hundred rows was silently looking at twenty-five again after a single arrow click, and
 * `keepPreviousData` kept the old rows on screen through the fetch so nothing announced it.
 */
export const useCompanyCalendarPeople = ({ q, filters }: { q?: string; filters?: FilterDTO[] }) =>
  useInfiniteQuery({
    queryKey: [COMPANY_CALENDAR_PEOPLE_QUERY_KEY, q ?? "", JSON.stringify(filters ?? [])],
    queryFn: ({ pageParam }) =>
      companyCalendarService.people({ cursor: pageParam, q, filters, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
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
