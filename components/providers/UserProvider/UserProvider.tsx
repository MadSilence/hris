"use client";

import { PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import type { User } from "@/models/user/User";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

type Props = PropsWithChildren<{ userId: string; initialUser: User }>;

export function UserProvider({ children, userId, initialUser }: Props) {
  return (
    <SWRConfig
      key={userId}
      value={{
        provider: () => new Map(),
        fetcher,
        fallback: { [`/api/users/${userId}`]: initialUser },
        dedupingInterval: 30_000,
        revalidateOnFocus: false,
        revalidateIfStale: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
