"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deleteDocumentCategoryAction,
  saveDocumentCategoryAction,
  type SaveDocumentCategoryInput,
} from "@/components/modules/settings/modules/documentCategories/actions/documentCategoryActions";

const CATEGORIES_KEY = ["DOCUMENT_CATEGORIES"];

export const useSaveDocumentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveDocumentCategoryInput) => {
      const result = await saveDocumentCategoryAction(payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to save category");
      }
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useDeleteDocumentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDocumentCategoryAction(id);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to delete category");
      }
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};
