"use client";

import React, { createContext, useContext } from "react";
import useSWR from "swr";
import type { User } from "@/models/user/User";

export type CurrentUserIdentity = {
  id: string;
  impersonating?: boolean;
  actorId?: string;
  subjectId?: string;
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

  impersonating: boolean;
  actorId?: string;
  subjectId?: string;

  error: unknown;
  isLoading: boolean;
  isValidating: boolean;

  refreshIdentity: () => Promise<CurrentUserIdentity | undefined>;
  refreshUser: () => Promise<User | undefined>;
  setIdentity: (identity: CurrentUserIdentity) => void;
  clearCurrentUserCache: () => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: identity,
    error: identityError,
    isLoading: isIdentityLoading,
    isValidating: isIdentityValidating,
    mutate: mutateIdentity,
  } = useSWR<CurrentUserIdentity>("/api/users/me", fetcher, {
    dedupingInterval: 0,
    revalidateOnFocus: false,
  });

  const userId = identity?.id;

  const {
    data: user,
    error: userError,
    isLoading: isUserLoading,
    isValidating: isUserValidating,
    mutate: mutateUser,
  } = useSWR<User>(userId ? `/api/users/${userId}` : null, fetcher, {
    dedupingInterval: 0,
    revalidateOnFocus: false,
  });

  const refreshIdentity = async () => {
    return mutateIdentity();
  };

  const refreshUser = async () => {
    await mutateIdentity();
    return mutateUser();
  };

  const setIdentity = (nextIdentity: CurrentUserIdentity) => {
    mutateIdentity(nextIdentity, false);
  };

  const clearCurrentUserCache = () => {
    mutateIdentity(undefined, false);
    mutateUser(undefined, false);
  };

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        userId,

        impersonating: Boolean(identity?.impersonating),
        actorId: identity?.actorId,
        subjectId: identity?.subjectId,

        error: identityError ?? userError,
        isLoading: isIdentityLoading || Boolean(userId && isUserLoading),
        isValidating: isIdentityValidating || isUserValidating,

        refreshIdentity,
        refreshUser,
        setIdentity,
        clearCurrentUserCache,
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
