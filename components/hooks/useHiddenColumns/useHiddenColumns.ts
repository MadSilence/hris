"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UserSettingsDTO } from "@/api/modules/firstRun/dto/UserSettingsDTO";
import { USER_SETTINGS_QK, useUserSettings } from "@/components/modules/firstRun/hooks";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";

/**
 * The columns a person hid in one table, remembered in their own settings (documents-tab T22–T23). The change shows at
 * once and is saved behind it; a refusal puts it back and says so. `defaultHidden` is what a person who never chose
 * sees hidden (documents DT10: Size is off until someone turns it on).
 */
const NONE: string[] = [];

export const useHiddenColumns = (table: string, defaultHidden: string[] = NONE) => {
  const { data } = useUserSettings();
  const queryClient = useQueryClient();
  const hidden = React.useMemo(() => data?.hiddenColumns?.[table] ?? defaultHidden, [data?.hiddenColumns, table, defaultHidden]);

  const setHidden = React.useCallback(
    async (next: string[]) => {
      const before = queryClient.getQueryData<UserSettingsDTO>(USER_SETTINGS_QK);
      if (before) {
        queryClient.setQueryData<UserSettingsDTO>(USER_SETTINGS_QK, {
          ...before,
          hiddenColumns: { ...(before.hiddenColumns ?? {}), [table]: next },
        });
      }
      const result = await updateUserSettingsAction({ hiddenColumns: { [table]: next } });
      if (result.status !== ActionStatus.SUCCESS) {
        if (before) queryClient.setQueryData(USER_SETTINGS_QK, before);
        showActionError(result);
      }
    },
    [queryClient, table],
  );

  return { hidden, setHidden };
};
