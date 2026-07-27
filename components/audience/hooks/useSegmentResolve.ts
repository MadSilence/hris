import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { Segment, SegmentResolveResponse, UserRefDTO } from "@/models/segment/Segment";

const PAGE_SIZE = 50;

export const SEGMENT_RESOLVE_QK = "SEGMENT_RESOLVE";

// Read-only resolution of a segment: total count + the matching users (with their current
// roles), page by page. Optional free-text `q` searches name/email on top of the filters.
// Independent of any assignment — safe to call as often as the filters or query change.
export const useSegmentResolve = (segment: Segment, enabled = true, q?: string, include?: string[]) => {
  const { internalApiClient } = useAppDataContext();
  const term = q && q.trim().length >= 2 ? q.trim() : null;
  const inc = include && include.length ? include : null;

  const query = useInfiniteQuery<SegmentResolveResponse>({
    queryKey: [SEGMENT_RESOLVE_QK, segment, term, inc],
    enabled,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      internalApiClient.post<SegmentResolveResponse>("/segments/resolve", {
        segment,
        cursor: pageParam ?? null,
        limit: PAGE_SIZE,
        q: term,
        include: inc,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });

  const items: UserRefDTO[] = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.summary.total ?? 0;

  return { ...query, items, total };
};
