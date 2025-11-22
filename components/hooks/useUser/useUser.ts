"use client";

import useSWR from "swr";
import type { User } from "@/models/user/User";

export function useUser(userId: string) {
  return useSWR<User>(`/api/users/${userId}`);
}
