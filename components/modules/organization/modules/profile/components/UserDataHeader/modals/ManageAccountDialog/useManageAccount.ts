"use client";

import { useCallback } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { AccountOverviewDTO, PersonSessionDTO } from "@/api/modules/userAccount/dto";
import type { PersonEmails } from "@/models/email";

/** One page of "Emails sent › Show all"; the first page also feeds the section's last three and its count. */
export const EMAILS_PAGE_SIZE = 20;

export const manageAccountQueryKeys = {
  all: (userId: string) => ["MANAGE_ACCOUNT", userId] as const,
  account: (userId: string) => ["MANAGE_ACCOUNT", userId, "account"] as const,
  sessions: (userId: string) => ["MANAGE_ACCOUNT", userId, "sessions"] as const,
  emails: (userId: string) => ["MANAGE_ACCOUNT", userId, "emails"] as const,
};

/** How the person signs in — PEOPLE.PROFILE BLOCK over them. */
export const useAccountOverview = (userId: string, enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AccountOverviewDTO>({
    queryKey: manageAccountQueryKeys.account(userId),
    queryFn: () => internalApiClient.get<AccountOverviewDTO>(`/users/${encodeURIComponent(userId)}/account`),
    enabled,
  });
};

/** Their live sessions, newest first — PEOPLE.PROFILE BLOCK over them. */
export const usePersonSessions = (userId: string, enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PersonSessionDTO[]>({
    queryKey: manageAccountQueryKeys.sessions(userId),
    queryFn: () => internalApiClient.get<PersonSessionDTO[]>(`/users/${encodeURIComponent(userId)}/sessions`),
    enabled,
  });
};

/** The emails sent to them, a page at a time, newest first — PEOPLE.PROFILE MANAGE over them. */
export const usePersonEmailPages = (userId: string, enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useInfiniteQuery({
    queryKey: manageAccountQueryKeys.emails(userId),
    queryFn: ({ pageParam }) =>
      internalApiClient.get<PersonEmails>(
        `/users/${encodeURIComponent(userId)}/emails?page=${pageParam}&size=${EMAILS_PAGE_SIZE}`,
      ),
    initialPageParam: 0,
    getNextPageParam: (last) => ((last.page + 1) * last.size < last.total ? last.page + 1 : undefined),
    enabled,
  });
};

export const useInvalidateManageAccount = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (userId: string) => queryClient.invalidateQueries({ queryKey: manageAccountQueryKeys.all(userId) }),
    [queryClient],
  );
};
