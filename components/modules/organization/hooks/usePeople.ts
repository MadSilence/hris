import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { User } from "@/models/user/User";
import { Filter } from "@/components/models/filters";

export const USERS_QUERY_KEY = "USERS";

export type UsePeopleArgs = {
  cursor?: string | null;
  limit?: number;
  quickSearch?: string | null;
  sortField?: "first_name" | "last_name" | "email" | "status" | "created_at" | "updated_at";
  sortDir?: "asc" | "desc";
  enabled?: boolean;
  filters?: Filter[];
};

type UsersListResponse = {
  items: User[];
  nextCursor?: string | null;
};

function buildPath({
  cursor,
  limit,
  quickSearch,
  sortField,
  sortDir,
  filters
}: UsePeopleArgs) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  if (quickSearch) params.set("q", quickSearch);
  if (sortField && sortDir) {
    params.set("sortField", sortField);
    params.set("sortDir", sortDir);
  }
  const qs = params.toString();
  return `/users${qs ? `?${qs}` : ""}`;
}

export function usePeople(args: UsePeopleArgs = {}) {
  const { internalApiClient } = useAppDataContext();
  const limit = args.limit ?? 100;

  const key = [USERS_QUERY_KEY, {
    cursor: args.cursor, limit,
    q: args.quickSearch, sortField: args.sortField, sortDir: args.sortDir,
    filters: args.filters ?? []
  }];

  return useQuery<UsersListResponse>({
    queryKey: key,
    queryFn: async () => {
      if (args.filters && args.filters.length > 0) {
        const res = await internalApiClient.post<UsersListResponse>("/users/search", {
          limit, cursor: args.cursor ?? null, q: args.quickSearch,
          sortField: args.sortField, sortDir: args.sortDir, filters: args.filters
        });
        return { items: res.items ?? [], nextCursor: res.nextCursor ?? null };
      }
      // без фильтров можно остаться на GET /users
      const path = buildPath({ ...args, limit });
      const res = await internalApiClient.get<UsersListResponse | User[]>(path);
      if (Array.isArray(res)) return { items: res, nextCursor: null };
      return { items: res.items ?? [], nextCursor: res.nextCursor ?? null };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    enabled: args.enabled ?? true,
  });
}
