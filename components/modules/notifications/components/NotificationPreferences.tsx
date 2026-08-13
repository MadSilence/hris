"use client";

import { FC } from "react";
import { BellOff, Lock } from "lucide-react";

import { Switch } from "@/public/desact/src/components/ui/switch";
import type { NotificationPreference } from "@/models/notifications";
import {
  useNotificationPreferences,
  useSetNotificationPreference,
} from "@/components/modules/notifications/hooks/useNotificationPreferences";

const rowHint = (pref: NotificationPreference): string | null => {
  if (pref.mandatory) return "Always on — required notifications can't be turned off.";
  if (!pref.canManage) return "Managed by your organization — you can't opt out of this category.";
  return null;
};

const PreferenceRow: FC<{
  pref: NotificationPreference;
  onToggle: (category: string, enabled: boolean) => void;
  pending: boolean;
}> = ({ pref, onToggle, pending }) => {
  const locked = pref.mandatory || !pref.canManage;
  const hint = rowHint(pref);

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-brown-200 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-brown-900">{pref.label}</p>
          {locked && <Lock className="h-3.5 w-3.5 text-brown-400" />}
        </div>
        {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      </div>
      <Switch
        className="mt-0.5"
        checked={pref.enabled}
        disabled={locked || pending}
        onCheckedChange={(v) => onToggle(pref.category, v)}
        aria-label={`Toggle ${pref.label}`}
      />
    </div>
  );
};

export const NotificationPreferences: FC = () => {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const setPreference = useSetNotificationPreference();

  const pendingCategory = setPreference.isPending
    ? (setPreference.variables?.category ?? null)
    : null;

  const handleToggle = (category: string, enabled: boolean) => {
    setPreference.mutate({ category, enabled });
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto px-8 pb-8">
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-brown-200 bg-brown-50" />
          ))}
        </div>
      ) : !preferences || preferences.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-brown-200 px-4 py-16 text-center">
          <BellOff className="h-8 w-8 text-brown-300" />
          <p className="text-sm text-muted-foreground">No configurable categories yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {preferences.map((pref) => (
            <PreferenceRow
              key={pref.category}
              pref={pref}
              onToggle={handleToggle}
              pending={pendingCategory === pref.category}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;
