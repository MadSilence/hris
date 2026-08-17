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
  });
};
