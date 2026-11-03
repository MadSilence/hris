"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { ReviewForm, ReviewFormSummary } from "@/models/reviews";
import { reviewQueryKeys } from "./reviewQueryKeys";

export const useReviewForms = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReviewFormSummary[]>({
    queryKey: reviewQueryKeys.forms,
    queryFn: () => internalApiClient.get<ReviewFormSummary[]>("/reviews/forms"),
    enabled,
  });
};

export const useReviewForm = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReviewForm>({
    queryKey: reviewQueryKeys.form(id ?? ""),
    queryFn: () => internalApiClient.get<ReviewForm>(`/reviews/forms/${id}`),
    enabled: Boolean(id),
  });
};

export const useInvalidateReviewForms = () => {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.forms }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.formRoot }),
  ]);
};
