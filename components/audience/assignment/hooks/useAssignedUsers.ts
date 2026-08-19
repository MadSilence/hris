import { useInfiniteQuery } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  assignedUsersAction,
  type AssignmentActionResult,
} from "@/components/audience/assignment/actions/assignmentActions";
import type { AssignedUser, AssignedUsersPage } from "@/models/assignedUser";

const PAGE_SIZE = 100;

export const assignedUsersQueryKey = (basePath: string, id: string) =>
  ["assignedUsers", basePath, id] as const;

function unwrap<T>(result: AssignmentActionResult<T>): T {
  if (result.status === ActionStatus.ERROR || result.data === undefined) {
    throw new Error(result.errorMessage ?? "Failed to load assigned users");
  }
  return result.data;
}

export const useAssignedUsers = (
  basePath: string,
  id: string,
  q: string,
  includeSubNodes = false,
) => {
  const query = useInfiniteQuery<AssignedUsersPage>({
    queryKey: [...assignedUsersQueryKey(basePath, id), q, includeSubNodes],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await assignedUsersAction(basePath, id, {
          q: q || null,
          cursor: pageParam as string | null,
          limit: PAGE_SIZE,
          includeSubNodes,
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(id),
  });

  const items: AssignedUser[] = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return { ...query, items, total };
};
