"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { FieldDTO } from "@/models/user/fields";
import { localizeField } from "@/models/user/fieldLabels";

export const USER_FIELDS_QK = ["USER_FIELDS"];

export const useUserFields = () => {
  const { internalApiClient } = useAppDataContext();
  const tAccess = useTranslations("access");
  const tCommon = useTranslations("common");
  const tOrg = useTranslations("organization");
  // The cache keeps the backend's answer; every reader gets the product's own words in its language.
  const select = useCallback(
    (fields: FieldDTO[]) => fields.map((f) => localizeField(f, tAccess, tCommon, tOrg)),
    [tAccess, tCommon, tOrg],
  );

  return useQuery<FieldDTO[]>({
    queryKey: USER_FIELDS_QK,
    queryFn: () => internalApiClient.get<FieldDTO[]>("/users/fields"),
    staleTime: 5 * 60 * 1000,
    select,
  });
};

