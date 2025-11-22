"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";

export const PEOPLE_SEARCH_QK = "PEOPLE_SEARCH";

export const usePeopleSearch = (params: UsersSearchRequest) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<UsersSearchResponseDTO>({
    queryKey: [PEOPLE_SEARCH_QK, params],
    queryFn: () => internalApiClient.post<UsersSearchResponseDTO>("/users/search", params),
    placeholderData: keepPreviousData,
  });
};
