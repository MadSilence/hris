"use client";

import { useQuery } from "@tanstack/react-query";
import type { DocumentCategoryDTO } from "@/api/modules/documents/dto";
import { useAppDataContext } from "@/components/providers/AppDataProvider";

/**
 * The company's document categories. Readable by anyone who may see documents — managing them is
 * still a PEOPLE.DOCUMENT_CATEGORIES MANAGE action in settings.
 */
export const useDocumentCategories = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<DocumentCategoryDTO[]>({
    queryKey: ["DOCUMENT_CATEGORIES"],
    queryFn: () => internalApiClient.get<DocumentCategoryDTO[]>("/documents/categories"),
    /**
     * Reference data several components read at once, with an explicit invalidator beside it.
     *
     * Without a `staleTime` the default is 0, so each component that mounts and reads this hook
     * finds the cache stale and refetches — the profile's Time Off tab fetched its policies three
     * times per render for exactly this reason. The role detail page has the same shape: the
     * container and both of its panels read this list. Every mutation invalidates the key, so
     * holding it fresh for five minutes cannot serve a stale answer after a change.
     */
    staleTime: 5 * 60 * 1000,
  });
};
