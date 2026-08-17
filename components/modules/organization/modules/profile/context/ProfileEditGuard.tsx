"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ProfileEditGuardValue = {
  /** True while some section of the profile holds an unsaved draft. */
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
};

const ProfileEditGuardContext = createContext<ProfileEditGuardValue>({
  isDirty: false,
  setDirty: () => {},
});

/**
 * Lets the tab bar know that a tab below it has unsaved changes. The App Router has no
 * navigation-blocking hook, so the only way to catch an in-app tab switch is for the component that
 * renders the links to ask before following them — which means the dirty flag has to live above
 * both the tabs and the tab content.
 */
export function ProfileEditGuardProvider({ children }: { children: React.ReactNode }) {
  const [dirtySections, setDirtySections] = useState(0);

  // Counted rather than a boolean: sections mount and unmount independently, and a leaving section
  // resetting the flag must not clear another section's pending draft.
  const setDirty = useCallback((dirty: boolean) => {
    setDirtySections((count) => {
      const next = dirty ? 1 : 0;
      return next === count ? count : next;
    });
  }, []);

  const value = useMemo(
    () => ({ isDirty: dirtySections > 0, setDirty }),
    [dirtySections, setDirty]
  );

  return (
    <ProfileEditGuardContext.Provider value={value}>
      {children}
    </ProfileEditGuardContext.Provider>
  );
}

export const useProfileEditGuard = () => useContext(ProfileEditGuardContext);
