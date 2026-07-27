import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { UsersSearchItemDTO, UsersSearchResponseDTO } from "@/models/user/fields";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";

// Backend caps limit at 100 (default 50).
const PAGE_SIZE = 100;

export const useRoleUsers = (roleId: string, q: string | null) => {
  const { internalApiClient } = useAppDataContext();

  const query = useInfiniteQuery<UsersSearchResponseDTO>({
    queryKey: rolesQueryKeys.roleUsers(roleId, q),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const search = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (q) search.set("q", q);
      if (pageParam) search.set("cursor", String(pageParam));

      return internalApiClient.get<UsersSearchResponseDTO>(
        `/roles/${roleId}/users?${search.toString()}`,
      );
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const items: UsersSearchItemDTO[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];

  return { ...query, items };
};
