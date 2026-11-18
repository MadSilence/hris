"use client";

import * as React from "react";

import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { dateStyleOf, setDisplayPreferences } from "@/lib/date";

/**
 * Applies the signed-in person's zone and the company's date order to the one place a date becomes text.
 *
 * <p>It renders nothing and provides no context. That is deliberate: `formatDisplayDate` is called
 * from table cells, mappers and plain functions, and a context would mean threading a hook through
 * sixty call sites to change a format. The answer is pushed into `lib/date` instead, which is
 * the module that already owns it — every caller keeps working and none of them changes. (The hooks in
 * `lib/date` read the company themselves, so a component re-renders when it arrives.)
 *
 * <p>The order is the company's, by its country — nobody chooses it (DECISIONS.md § "The designers' Home fixes,
 * round 1"). Until the company and the settings arrive the defaults apply: the European order and the browser's
 * zone.
 */
export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useUserSettings();
  const { company } = useCompanyData();

  const timeZone = data?.timeZone ?? null;
  const dateStyle = dateStyleOf(company?.dateStyle);

  React.useEffect(() => {
    setDisplayPreferences({ timeZone, dateStyle });
  }, [timeZone, dateStyle]);

  return <>{children}</>;
};

export default UserSettingsProvider;
