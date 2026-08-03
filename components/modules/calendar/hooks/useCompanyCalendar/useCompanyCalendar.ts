import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { companyCalendarService } from "@/components/modules/calendar/services/companyCalendarService";

type UseCompanyCalendarArgs = {
  from: string;
  to: string;
  q?: string;
};

export const COMPANY_CALENDAR_QUERY_KEY = "company-calendar";

const PAGE_SIZE = 25;

export const useCompanyCalendar = ({ from, to, q }: UseCompanyCalendarArgs) => {
  return useInfiniteQuery({
    queryKey: [COMPANY_CALENDAR_QUERY_KEY, from, to, q ?? ""],
    queryFn: ({ pageParam }) =>
      companyCalendarService.company({ from, to, cursor: pageParam, q, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    enabled: Boolean(from && to),
  });
};
