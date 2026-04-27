"use client";

import React, { createContext, useContext } from "react";
import useSWR from "swr";
import type { User } from "@/models/user/User";

type CurrentUserIdentity = {
  id: string;
};

const fetcher = async <T, >(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
};

type CurrentUserContextValue = {
  user: User | undefined;
  userId: string | undefined;
  error: unknown;
  isLoading: boolean;
  isValidating: boolean;
  refreshUser: () => Promise<User | undefined>;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: identity,
    error: identityError,
    isLoading: isIdentityLoading,
    isValidating: isIdentityValidating,
  } = useSWR<CurrentUserIdentity>("/api/users/me", fetcher, {
    dedupingInterval: 30_000,
    revalidateOnFocus: false,
  });

  const userId = identity?.id;

  const {
    data: user,
    error: userError,
    isLoading: isUserLoading,
    isValidating: isUserValidating,
    mutate,
  } = useSWR<User>(
    userId ? `/api/users/${userId}` : null,
    fetcher,
    {
      dedupingInterval: 30_000,
      revalidateOnFocus: false,
    }
  );

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        userId,
        error: identityError ?? userError,
        isLoading: isIdentityLoading || Boolean(userId && isUserLoading),
        isValidating: isIdentityValidating || isUserValidating,
        refreshUser: () => mutate(),
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used inside CurrentUserProvider");
  }

  return context;
}

export default CurrentUserProvider;
