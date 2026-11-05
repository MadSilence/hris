"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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

const REQUIREMENT = {
  NOBODY: "mfa.security.requirement.nobody",
  PRIVILEGED: "mfa.security.requirement.privileged",
  EVERYONE: "mfa.security.requirement.everyone",
} as const satisfies Record<MfaRequirement, string>;

const REMEMBER = [0, 7, 14, 30];
/** Idle timeouts a company is likely to want, in minutes; named in hours or days. */
const IDLE: { minutes: number; unit: "hours" | "days" | "minutes"; count: number }[] = [
  { minutes: 60, unit: "hours", count: 1 },
  { minutes: 8 * 60, unit: "hours", count: 8 },
  { minutes: 24 * 60, unit: "days", count: 1 },
  { minutes: 7 * 24 * 60, unit: "days", count: 7 },
  { minutes: 14 * 24 * 60, unit: "days", count: 14 },
  { minutes: 30 * 24 * 60, unit: "days", count: 30 },
];
const UNIT_KEY = { hours: "time.hours", days: "time.days", minutes: "time.minutes" } as const;

/**
 * Settings → Login & SSO → Sign-in Security (MFA_DESIGN.md § 4, R1.6): who must use two-step sign-in, how
 * long a device is remembered, and how long a session may go unused. Changed by a System Owner only, after
 * "confirm it is you"; the screen says how many people a stricter level covers before anyone chooses it.
 */
export const SecuritySettingsForm: React.FC = () => {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
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
    // Nothing changed: nothing to send (and no step-up to ask for).
    if (!dirty) return;
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
      showSuccess(t("mfa.security.saved"));
    } else {
      setError(res.errorMessage ?? null);
    }
  };

  const idleOptions = IDLE.some((o) => o.minutes === s.sessionIdleMinutes)
    ? IDLE
    : [...IDLE, { minutes: s.sessionIdleMinutes, unit: "minutes" as const, count: s.sessionIdleMinutes }];

  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="security-mfa-required">{t("mfa.security.requiredFor")}</Label>
        <Select value={s.mfaRequired} onValueChange={(v) => setDraft((d) => ({ ...d, mfaRequired: v as MfaRequirement }))}>
          <SelectTrigger id="security-mfa-required"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(REQUIREMENT) as MfaRequirement[]).map((r) => (
              <SelectItem key={r} value={r}>{t(REQUIREMENT[r])}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-hint text-tertiary">
          {t("mfa.security.privilegedHint", { count: s.privilegedCount })}
          {settings.data!.requiredWithoutFactor > 0 && (
            <>{" "}{t("mfa.security.withoutFactor", { count: settings.data!.requiredWithoutFactor })}</>
          )}
          {" "}{t("mfa.security.raiseHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="security-remember">{t("mfa.security.rememberFor")}</Label>
        <Select value={String(s.mfaRememberDays)} onValueChange={(v) => setDraft((d) => ({ ...d, mfaRememberDays: Number(v) }))}>
          <SelectTrigger id="security-remember"><SelectValue /></SelectTrigger>
          <SelectContent>
            {REMEMBER.map((d) => (
              <SelectItem key={d} value={String(d)}>{d === 0 ? t("mfa.security.rememberNever") : tCommon("time.days", { count: d })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-hint text-tertiary">{t("mfa.security.ownersAlwaysAsked")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="security-idle">{t("mfa.security.idleFor")}</Label>
        <Select value={String(s.sessionIdleMinutes)} onValueChange={(v) => setDraft((d) => ({ ...d, sessionIdleMinutes: Number(v) }))}>
          <SelectTrigger id="security-idle"><SelectValue /></SelectTrigger>
          <SelectContent>
            {idleOptions.map((o) => (
              <SelectItem key={o.minutes} value={String(o.minutes)}>{tCommon(UNIT_KEY[o.unit], { count: o.count })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-hint text-tertiary">{t("mfa.security.absoluteLimit")}</p>
      </div>

      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="button" onClick={save} disabled={busy}>{busy ? tCommon("actions.saving") : tCommon("actions.save")}</Button>
        {dirty && (
          <Button type="button" variant="secondary" onClick={() => setDraft({})} disabled={busy}>{tCommon("actions.cancel")}</Button>
        )}
      </div>
    </div>
  );
};
