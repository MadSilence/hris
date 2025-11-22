"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { FieldDTO } from "@/models/user/fields";

export const USER_FIELDS_QK = ["USER_FIELDS"];

export const useUserFields = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<FieldDTO[]>({
    queryKey: USER_FIELDS_QK,
    queryFn: () => internalApiClient.get<FieldDTO[]>("/users/routes/usersRoutes/fields"),
    staleTime: 5 * 60 * 1000,
  });
};

