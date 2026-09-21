"use client";

import useSWR from "swr";
import type { User } from "@/models/user/User";
import { internalApiClient } from "@/components/clients/apiClient";

/**
 * One person, by id.
 *
 * The fetcher is the hook's own. It used to rely on the one `UserProvider` supplies, which exists only
 * on a person's profile — everywhere else (the people filter, the policy wizard's approver field) the
 * hook had no fetcher, requested nothing, and the picker drew "Unknown" forever. The key stays
 * `/api/users/{id}` so the profile's `fallback` still seeds it.
 */
export function useUser(userId: string) {
  return useSWR<User>(userId ? `/api/users/${userId}` : null, () => internalApiClient.get<User>(`/users/${userId}`));
}
