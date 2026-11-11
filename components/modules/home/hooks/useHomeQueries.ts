"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { USER_SETTINGS_QK } from "@/components/modules/firstRun/hooks";
import type { UserSettingsDTO } from "@/api/modules/firstRun/dto";
import type { UpdateUserSettingsRequest } from "@/api/modules/firstRun/dto";
import type { AutomationsWeek, Celebrations, WhosOut, WhosOutAudience, WhosOutRange } from "@/models/home";
import type { UserPublicHoliday } from "@/models/publicHolidays/userHoliday";

export const homeQueryKeys = {
  root: ["HOME"] as const,
  whosOut: (range: WhosOutRange, audience: WhosOutAudience) => ["HOME", "WHOS_OUT", range, audience] as const,
  celebrations: (upcoming: boolean) => ["HOME", "CELEBRATIONS", upcoming] as const,
  holidays: (userId: string) => ["HOME", "HOLIDAYS", userId] as const,
  automationsWeek: ["HOME", "AUTOMATIONS_WEEK"] as const,
};

/** Home's Automations widget: the last seven days, today's failures and the next step (the home redesign, Q-6). */
export const useAutomationsWeek = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationsWeek>({
    queryKey: homeQueryKeys.automationsWeek,
    queryFn: () => internalApiClient.get<AutomationsWeek>("/automations/runs/week"),
    enabled,
    staleTime: 60_000,
  });
};

/** Each widget has its own query, so it loads and fails on its own. `enabled` is false for a widget not drawn. */
export const useWhosOut = (range: WhosOutRange, audience: WhosOutAudience, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<WhosOut>({
    queryKey: homeQueryKeys.whosOut(range, audience),
    queryFn: () => internalApiClient.get<WhosOut>(`/home/whos-out?range=${range}&audience=${audience}`),
    enabled,
    staleTime: 60_000,
  });
};

export const useCelebrations = (upcoming: boolean, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Celebrations>({
    queryKey: homeQueryKeys.celebrations(upcoming),
    queryFn: () => internalApiClient.get<Celebrations>(`/home/celebrations?upcoming=${upcoming}`),
    enabled,
    staleTime: 5 * 60_000,
  });
};

/**
 * The reader's own public holidays, every year at once — the list is short, and the next three may cross
 * the new year. The profile's calendar reads the same endpoint a year at a time.
 */
export const useMyPublicHolidays = (userId: string | undefined) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<UserPublicHoliday[]>({
    queryKey: homeQueryKeys.holidays(userId ?? ""),
    queryFn: () => internalApiClient.get<UserPublicHoliday[]>(`/users/${userId}/public-holidays`),
    enabled: Boolean(userId),
    staleTime: 60 * 60_000,
  });
};

/**
 * Saves the reader's own Home preferences — the arrangement with its sizes, the header, the deck's skip order — with
 * their other preferences. The cache is written with the answer, so the page shows the new state without a second read.
 */
export const useSaveHomeSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: Pick<UpdateUserSettingsRequest, "homeLayout" | "homeHeader" | "homeSkipped">) => {
      const result = await updateUserSettingsAction(request);
      if (result.status === ActionStatus.ERROR || !result.data) {
        throw new Error(result.errorMessage || "Failed to save your home");
      }
      return result.data;
    },
    onSuccess: (settings: UserSettingsDTO) => {
      queryClient.setQueryData(USER_SETTINGS_QK, settings);
    },
  });
};
