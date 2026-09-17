"use client";

import * as React from "react";

import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { setDisplayPreferences, type DisplayDateFormat } from "@/lib/date";

/**
 * Applies the signed-in person's own preferences to the one place a date becomes text.
 *
 * <p>It renders nothing and provides no context. That is deliberate: `formatDisplayDate` is called
 * from table cells, mappers and plain functions, and a context would mean threading a hook through
 * sixty call sites to change a format. The preference is pushed into `lib/date` instead, which is
 * the module that already owns the answer — every caller keeps working and none of them changes.
 *
 * <p>Until the settings arrive the defaults apply, which is exactly what every date did before
 * anybody could choose: the browser's own locale and zone. So the first paint is never wrong, only
 * possibly not yet personal.
 */
export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useUserSettings();

  const timeZone = data?.timeZone ?? null;
  const dateFormat = (data?.dateFormat ?? "SYSTEM") as DisplayDateFormat;

  React.useEffect(() => {
    setDisplayPreferences({ timeZone, dateFormat });
  }, [timeZone, dateFormat]);

  return <>{children}</>;
};

export default UserSettingsProvider;
