"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showSuccess } from "@/lib/errors/errorToast";
import type { MfaRequirement, SecuritySettingsDTO } from "@/api/modules/mfa/dto";
import { SECURITY_SETTINGS_QK, useSecuritySettings } from "@/components/modules/mfa/hooks";
import { updateSecuritySettingsAction } from "@/components/modules/mfa/actions";
import { withStepUpAction } from "@/components/modules/mfa/stepUp";

const REQUIREMENT: Record<MfaRequirement, string> = {
  NOBODY: "Nobody required",
  PRIVILEGED: "Administrators",
  EVERYONE: "Everyone",
};

const REMEMBER = [0, 7, 14, 30];
/** Idle timeouts a company is likely to want, in minutes. */
const IDLE: { minutes: number; label: string }[] = [
  { minutes: 60, label: "1 hour" },
  { minutes: 8 * 60, label: "8 hours" },
  { minutes: 24 * 60, label: "1 day" },
  { minutes: 7 * 24 * 60, label: "7 days" },
  { minutes: 14 * 24 * 60, label: "14 days" },
  { minutes: 30 * 24 * 60, label: "30 days" },
];

/**
 * Settings → Login & SSO → Sign-in Security (MFA_DESIGN.md § 4, R1.6): who must use two-step sign-in, how
 * long a device is remembered, and how long a session may go unused. Changed by a System Owner only, after
 * "confirm it is you"; the screen says how many people a stricter level covers before anyone chooses it.
 */
export const SecuritySettingsForm: React.FC = () => {
  const settings = useSecuritySettings();
  const queryClient = useQueryClient();
  const [draft, setDraft] = React.useState<Partial<SecuritySettingsDTO>>({});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (settings.isLoading) return <Skeleton className="h-48 w-full max-w-xl" />;
  if (settings.error) return <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />;
  const s = { ...settings.data!, ...draft };
  const dirty = Object.keys(draft).length > 0;

  const save = async () => {
    setBusy(true);
    setError(null);
    const res = await withStepUpAction(() =>
      updateSecuritySettingsAction({
        mfaRequired: s.mfaRequired,
        mfaRememberDays: s.mfaRememberDays,
        sessionIdleMinutes: s.sessionIdleMinutes,
      }),
    );
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) {
      setDraft({});
      queryClient.setQueryData(SECURITY_SETTINGS_QK, res.data);
      showSuccess("Sign-in security saved.");
    } else {
      setError(res.errorMessage ?? null);
    }
  };

  const idleOptions = IDLE.some((o) => o.minutes === s.sessionIdleMinutes)
    ? IDLE
    : [...IDLE, { minutes: s.sessionIdleMinutes, label: `${s.sessionIdleMinutes} minutes` }];

  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="security-mfa-required">Two-step sign-in required for</Label>
        <Select value={s.mfaRequired} onValueChange={(v) => setDraft((d) => ({ ...d, mfaRequired: v as MfaRequirement }))}>
          <SelectTrigger id="security-mfa-required"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(REQUIREMENT) as MfaRequirement[]).map((r) => (
              <SelectItem key={r} value={r}>{REQUIREMENT[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-hint text-tertiary">
          Administrators are System Owners and everyone who can manage settings, block people or act as somebody
          else — {s.privilegedCount} {s.privilegedCount === 1 ? "person" : "people"} today.
          {settings.data!.requiredWithoutFactor > 0 &&
            ` ${settings.data!.requiredWithoutFactor} of those the current setting requires have not set it up yet.`}
          {" "}Raising the level signs out the people it now covers who have not set it up; they do so at their next sign-in.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="security-remember">Remember a device for</Label>
        <Select value={String(s.mfaRememberDays)} onValueChange={(v) => setDraft((d) => ({ ...d, mfaRememberDays: Number(v) }))}>
          <SelectTrigger id="security-remember"><SelectValue /></SelectTrigger>
          <SelectContent>
            {REMEMBER.map((d) => (
              <SelectItem key={d} value={String(d)}>{d === 0 ? "Never — always ask for the code" : `${d} days`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-hint text-tertiary">System Owners are always asked for the code.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="security-idle">Sign out after being unused for</Label>
        <Select value={String(s.sessionIdleMinutes)} onValueChange={(v) => setDraft((d) => ({ ...d, sessionIdleMinutes: Number(v) }))}>
          <SelectTrigger id="security-idle"><SelectValue /></SelectTrigger>
          <SelectContent>
            {idleOptions.map((o) => (
              <SelectItem key={o.minutes} value={String(o.minutes)}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-hint text-tertiary">However active, a session ends after 30 days.</p>
      </div>

      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="button" onClick={save} disabled={!dirty || busy}>{busy ? "Saving…" : "Save"}</Button>
        {dirty && (
          <Button type="button" variant="secondary" onClick={() => setDraft({})} disabled={busy}>Cancel</Button>
        )}
      </div>
    </div>
  );
};
