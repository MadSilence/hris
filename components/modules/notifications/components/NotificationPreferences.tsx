"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Switch } from "@/components/desact/switch";
import { Label } from "@/components/desact/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { Skeleton } from "@/components/desact/skeleton";
import type { NotificationChannel, NotificationPreference } from "@/models/notifications";
import { Illustration } from "@/components/illustrations";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { USER_SETTINGS_QK, useUserSettings } from "@/components/modules/firstRun/hooks";
import {
  useNotificationPreferences,
  useSetNotificationPreference,
} from "@/components/modules/notifications/hooks/useNotificationPreferences";

const rowHint = (pref: NotificationPreference) => {
  if (pref.mandatory) return "preferences.mandatory" as const;
  if (!pref.canManage) return "preferences.managed" as const;
  if (pref.emailLocked) return "preferences.emailLocked" as const;
  if (pref.emailAvailable && !pref.enabled) return "preferences.emailFollowsInbox" as const;
  return null;
};

/** The hours a digest may go at (EM5): the morning, or the end of the working day. */
const DIGEST_HOURS = [7, 8, 9, 10, 17] as const;

const PreferenceRow: FC<{
  pref: NotificationPreference;
  onToggle: (category: string, enabled: boolean, channel: NotificationChannel) => void;
  pending: boolean;
}> = ({ pref, onToggle, pending }) => {
  const t = useTranslations("notifications");
  const inboxLocked = pref.mandatory || !pref.canManage;
  // Email is a copy of an inbox line, never on its own: with the inbox off there is nothing to email.
  const emailLocked = pref.emailLocked || !pref.canManage || !pref.enabled;
  const hint = rowHint(pref);

  return (
    <div className="grid grid-cols-[1fr_96px_96px] items-start gap-4 rounded-card border border-divider p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-primary">{pref.label}</p>
          {inboxLocked && <Icon icon={SquareLock02Icon} size="sm" className="text-tertiary" />}
        </div>
        {hint && <p className="mt-0.5 text-body text-tertiary">{t(hint)}</p>}
      </div>
      <div className="flex justify-center">
        <Switch
          className="mt-0.5"
          checked={pref.enabled}
          disabled={inboxLocked || pending}
          onCheckedChange={(v) => onToggle(pref.category, v, "IN_APP")}
          aria-label={t("preferences.toggle", { label: pref.label })}
        />
      </div>
      <div className="flex justify-center">
        {pref.emailAvailable ? (
          <Switch
            className="mt-0.5"
            checked={pref.enabled && pref.emailEnabled}
            disabled={emailLocked || pending}
            onCheckedChange={(v) => onToggle(pref.category, v, "EMAIL")}
            aria-label={t("preferences.toggleEmail", { label: pref.label })}
          />
        ) : (
          <span className="mt-0.5 text-body text-tertiary" title={t("preferences.emailNone")}>—</span>
        )}
      </div>
    </div>
  );
};

/** The hour of the daily email (EMAIL_NOTIFICATIONS_DESIGN.md § 6.3) — the person's own choice, in their own zone. */
const DigestHour: FC = () => {
  const t = useTranslations("notifications");
  const settings = useUserSettings();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const change = async (value: string) => {
    setSaving(true);
    const result = await updateUserSettingsAction({ digestHour: Number(value) });
    setSaving(false);
    if (result.status === ActionStatus.ERROR) {
      showActionError(result);
      return;
    }
    queryClient.setQueryData(USER_SETTINGS_QK, result.data);
  };

  const label = (hour: number) => t("preferences.digest.at", { hour: `${String(hour).padStart(2, "0")}:00` });

  return (
    <div className="flex items-start justify-between gap-4 rounded-card border border-divider p-4">
      <div className="min-w-0">
        <Label htmlFor="digest-hour" className="font-medium text-primary">{t("preferences.digest.label")}</Label>
        <p className="mt-0.5 text-body text-tertiary">{t("preferences.digest.description")}</p>
      </div>
      {settings.isLoading ? (
        <Skeleton className="h-9 w-32" />
      ) : (
        <Select
          value={String(settings.data?.digestHour ?? 8)}
          onValueChange={(v) => void change(v)}
          disabled={saving}
        >
          <SelectTrigger id="digest-hour" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIGEST_HOURS.map((h) => (
              <SelectItem key={h} value={String(h)}>{label(h)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export const NotificationPreferences: FC = () => {
  const t = useTranslations("notifications");
  const { data: preferences, isLoading } = useNotificationPreferences();
  const setPreference = useSetNotificationPreference();

  const pendingCategory = setPreference.isPending
    ? (setPreference.variables?.category ?? null)
    : null;

  const handleToggle = (category: string, enabled: boolean, channel: NotificationChannel) => {
    setPreference.mutate({ category, enabled, channel });
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto px-8 pb-8">
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 shimmer rounded-control border border-divider bg-subtle" />
          ))}
        </div>
      ) : !preferences || preferences.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-divider px-4 py-16 text-center">
          <Illustration scene="notifications" />
          <p className="text-body text-tertiary">{t("preferences.empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_96px_96px] gap-4 px-4 text-label text-tertiary">
            <span>{t("preferences.columns.category")}</span>
            <span className="text-center">{t("preferences.columns.inApp")}</span>
            <span className="text-center">{t("preferences.columns.email")}</span>
          </div>
          {preferences.map((pref) => (
            <PreferenceRow
              key={pref.category}
              pref={pref}
              onToggle={handleToggle}
              pending={pendingCategory === pref.category}
            />
          ))}
          <div className="mt-4">
            <DigestHour />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;
