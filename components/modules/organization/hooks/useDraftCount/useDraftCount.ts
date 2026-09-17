"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";

export const DRAFT_COUNT_QK = ["PEOPLE_DRAFT_COUNT"];

/**
 * How many people exist that nobody has started yet.
 *
 * The Drafts segment is not drawn at all when this is zero — the rule every count-carrying toggle
 * in `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5 follows — which is why the toolbar needs
 * the number and not a boolean. The backend answers 0 for a reader who cannot reach drafts, so the
 * segment simply never appears for them.
 */
export const useDraftCount = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<{ count: number }>({
    queryKey: DRAFT_COUNT_QK,
    queryFn: () => internalApiClient.get<{ count: number }>("/users/drafts/count"),
    staleTime: 60 * 1000,
  });
};
