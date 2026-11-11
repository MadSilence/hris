"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { Switch } from "@/components/desact/switch";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { USER_SETTINGS_QK, useUserSettings } from "@/components/modules/firstRun/hooks";
import { homeQueryKeys } from "@/components/modules/home/hooks";

/**
 * "Show my birthday on Home" on a person's own preferences (DECISIONS.md § "The home redesign"). The person decides,
 * not a role: on by default, and only the day and month are ever shown — never the year. It replaces the company's
 * birthday-field setting that lived under Settings → General → Home.
 */
export const BirthdayOnHomeSection: React.FC = () => {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();
  const settings = useUserSettings();
  const [saving, setSaving] = React.useState(false);

  const toggle = async (on: boolean) => {
    setSaving(true);
    const result = await updateUserSettingsAction({ showBirthdayOnHome: on });
    setSaving(false);
    if (result.status === ActionStatus.ERROR) {
      showActionError(result);
      return;
    }
    queryClient.setQueryData(USER_SETTINGS_QK, result.data);
    void queryClient.invalidateQueries({ queryKey: homeQueryKeys.root });
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-card border border-divider p-4">
      <div className="min-w-0">
        <Label htmlFor="birthday-on-home" className="font-medium text-primary">
          {t("homePreferences.birthday.label")}
        </Label>
        <p className="mt-0.5 text-body text-tertiary">{t("homePreferences.birthday.description")}</p>
      </div>
      {settings.isLoading ? (
        <Skeleton className="h-5 w-9" />
      ) : (
        <Switch
          id="birthday-on-home"
          className="mt-0.5"
          checked={settings.data?.showBirthdayOnHome ?? true}
          disabled={saving}
          onCheckedChange={(on) => void toggle(on)}
        />
      )}
    </div>
  );
};
