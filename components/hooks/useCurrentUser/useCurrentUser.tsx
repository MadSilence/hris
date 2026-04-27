"use client";

import useSWR from "swr";
import type { User } from "@/models/user/User";

const fetcher = async (url: string): Promise<User> => {
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.error("[useCurrentUser] error:", res.status, text);
    throw new Error(`Failed to fetch current user: ${res.status}`);
  }

  return res.json();
};

export function useCurrentUser() {
  return useSWR<User>("/api/me", fetcher);
}
