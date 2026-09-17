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
    // The list is held fresh for five minutes, so after a refusal — E00409 above all, someone else
    // saved first — reopening the dialog would start from the same stale version and be refused
    // again. The open dialog keeps the row it was opened with; only a reopen picks up the refetch.
    onError: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
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
