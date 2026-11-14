"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { NodRing } from "@/components/desact/nod";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import {
  PersonalInfoAttributesRow,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/PersonalInfoAttributesRow/PersonalInfoAttributesRow";
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";
import { AuthBack } from "@/components/modules/auth/layout";
import { withStepUp } from "@/components/modules/mfa/stepUp";
import { SIGN_IN_OVERVIEW_QK, SetPasswordDialog } from "@/components/modules/identity/components/SignInMethodsSection";
import type { SignInOverviewDTO } from "@/api/modules/identity/services";
import { completeWelcomeAction, updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { WELCOME_QK, useUserSettings, useWelcome } from "@/components/modules/firstRun/hooks";
import type { Attribute } from "@/models/attribute/Attribute";
import { toLanguage } from "@/i18n/locales";
import { cn } from "@/lib/cn";
import { LanguageSelect, TimeZoneSelect } from "./PersonalPreferencesForm";
import { PhotoStep } from "./PhotoStep";
import { SkipButton, StepBars, WelcomeFrame, type FirstRunCompany } from "./FirstRunPieces";

const ATTR_PREFIX = "attr:";

type Provider = "GOOGLE" | "MICROSOFT";
const PROVIDER_LABEL: Record<Provider, string> = { GOOGLE: "Google", MICROSOFT: "Microsoft" };
const PROVIDER_MARK: Record<Provider, string> = {
  GOOGLE: "/brand/providers/google.png",
  MICROSOFT: "/brand/providers/microsoft.png",
};

/** What `/welcome` was opened with after a Connect's round trip (`?provider=…`, `&inUse=1`). */
export type WelcomeReturn =
  | { kind: "connected" }
  | { kind: "failed"; provider: Provider }
  | { kind: "inUse"; provider: Provider }
  | null;

type Step = "hello" | "connect" | "photo" | "about" | "prefs";

/**
 * Everybody's first screen after the login (first-run-welcome W0–W4): a greeting, then a few optional steps —
 * connect Google or Microsoft, a photo, their own blank fields, the time zone and their language.
 *
 * <h2>Every step skippable, and skipping is an answer</h2>
 *
 * Nothing here is a gate. *Skip* moves on without saving; on the last step it leaves, and the welcome does not come
 * back tomorrow to ask again — finished or skipped write the same timestamp. It is reachable afterwards from the user
 * menu (`?again`), on the person's terms rather than ours.
 *
 * <h2>Which steps</h2>
 *
 * W1 only when the company offers Google or Microsoft (not under required SSO — the backend's `offered` is empty then)
 * and the person has connected neither; it also offers a password to somebody who has none. W3 only when the person
 * may fill some of their own blank fields — decided on the server (`WelcomeService`), usually nobody with the roles as
 * they ship.
 */
export const WelcomeContainer: React.FC<{ company: FirstRunCompany; returned?: WelcomeReturn }> = ({
  company,
  returned = null,
}) => {
  const queryClient = useQueryClient();
  const t = useTranslations("firstRun");
  const { userId } = useCurrentUser();
  const { internalApiClient } = useAppDataContext();
  const welcome = useWelcome();
  const groups = useAttributeGroups();
  const settings = useUserSettings();
  const overview = useQuery<SignInOverviewDTO>({
    queryKey: SIGN_IN_OVERVIEW_QK,
    queryFn: () => internalApiClient.get<SignInOverviewDTO>("/me/sign-in"),
  });

  // Back from the provider, the person lands on W1's answer (W1a / W1b), not on the greeting again.
  const [step, setStep] = React.useState<Step>(returned ? "connect" : "hello");
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  const [seeded, setSeeded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    // The round trip's answer is read once; a reload should not say "Connected" again.
    if (returned) window.history.replaceState(null, "", "/welcome");
  }, [returned]);

  React.useEffect(() => {
    if (!welcome.data || seeded) return;
    setValues(welcome.data.values ?? {});
    setSeeded(true);
  }, [welcome.data, seeded]);

  const editable = React.useMemo<Attribute[]>(() => {
    const wanted = new Set(
      (welcome.data?.fields ?? [])
        .map((f) => f.id)
        .filter((id): id is string => Boolean(id) && id.startsWith(ATTR_PREFIX))
        .map((id) => id.slice(ATTR_PREFIX.length)),
    );
    if (!wanted.size) return [];

    // The catalogue comes from `/groups`, which every employee may read — the same list the profile
    // renders from, so a field looks and validates identically in both places.
    return (groups.data ?? [])
      .flatMap((group) => group.attributes)
      .filter((attribute) => wanted.has(attribute.id));
  }, [welcome.data, groups.data]);

  const refreshWelcome = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: WELCOME_QK });
  }, [queryClient]);

  const leave = React.useCallback(async () => {
    const res = await completeWelcomeAction();
    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return false;
    }
    // A real navigation, not a router push: the gate that sent us here is a server layout, and it is
    // only re-evaluated on a request — and a new language is read there too.
    window.location.assign("/dashboard");
    return true;
  }, []);

  if (welcome.error) return <ErrorState error={welcome.error} />;

  // Nothing is drawn until the answer is here: a greeting with no name, rewritten a moment later, is a guess.
  if (!welcome.data || groups.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <NodRing size="md" label="" className="text-tertiary" />
      </div>
    );
  }

  const data = overview.data;
  const connectable = (data?.offered ?? []).filter((p) => !data?.accounts.some((a) => a.provider === p));
  // W1 when the company offers a provider and none is connected yet — or when this page is the answer to one.
  const hasConnect = returned !== null || (connectable.length > 0 && (data?.accounts.length ?? 0) === 0);
  const hasAbout = editable.length > 0;
  const order: Step[] = ["hello", ...(hasConnect ? ["connect" as const] : []), "photo", ...(hasAbout ? ["about" as const] : []), "prefs"];
  const profileSteps: Step[] = order.filter((s) => s === "photo" || s === "about" || s === "prefs");

  const go = (direction: 1 | -1) => {
    const at = order.indexOf(step);
    const next = order[at + direction];
    if (next) setStep(next);
  };

  const firstName = welcome.data.firstName ?? "";
  const fullName = `${welcome.data.firstName ?? ""} ${welcome.data.lastName ?? ""}`.trim();

  const saveAbout = async () => {
    setBusy(true);
    if (userId) {
      const payload: Record<string, unknown> = {};
      for (const attribute of editable) payload[attribute.id] = values[`${ATTR_PREFIX}${attribute.id}`];
      const res = await updateUserAttributesAction({ userId, values: payload });
      if (res.status !== ActionStatus.SUCCESS) {
        setBusy(false);
        showActionError(res);
        return;
      }
    }
    setBusy(false);
    go(1);
  };

  const stepBars = profileSteps.includes(step) ? (
    <StepBars
      current={profileSteps.indexOf(step) + 1}
      total={profileSteps.length}
      name={step === "prefs" ? t("welcome.steps.preferences") : t("welcome.steps.profile")}
    />
  ) : null;

  const back = step === "photo" || step === "about" || step === "prefs" ? <AuthBack onClick={() => go(-1)} /> : undefined;

  return (
    <WelcomeFrame company={company} back={back} wide={step === "photo"}>
      {step === "hello" && (
        <>
          <div className="flex flex-col gap-6">
            <h1 className="fr-greeting">
              {firstName ? t("welcome.hi", { name: firstName }) : t("welcome.hiNoName")}
              <span>{t("welcome.glad")}</span>
            </h1>
            <p className="text-auth-lead text-secondary">{t("welcome.lead")}</p>
          </div>
          <Button type="button" size="lg" className="w-full md:w-auto md:self-start" onClick={() => go(1)}>
            {t("welcome.start")}
          </Button>
        </>
      )}

      {step === "connect" && (
        <ConnectStep
          company={company}
          overview={data ?? null}
          connectable={connectable}
          returned={returned}
          onNextAction={() => go(1)}
          onRefreshAction={() => queryClient.invalidateQueries({ queryKey: SIGN_IN_OVERVIEW_QK })}
          post={(provider) =>
            withStepUp(() =>
              internalApiClient.post<{ redirectUrl: string }>("/auth/provider/person", {
                purpose: "CONNECT",
                provider,
                returnTo: "/welcome",
              }),
            )}
        />
      )}

      {step === "photo" && (
        <>
          <div className="flex flex-col gap-4">
            {stepBars}
            <h1 className="text-auth-title text-primary">{t("photo.title")}</h1>
            <p className="text-auth-lead text-secondary">{t("photo.lead")}</p>
          </div>
          <PhotoStep
            userId={userId ?? ""}
            fullName={fullName || firstName}
            avatarUrl={welcome.data.avatarUrl ?? null}
            onRefreshAction={refreshWelcome}
            onContinueAction={() => go(1)}
            onSkipAction={() => go(1)}
          />
        </>
      )}

      {step === "about" && (
        <>
          <div className="flex flex-col gap-4">
            {stepBars}
            <h1 className="text-auth-title text-primary">{t("welcome.about.title")}</h1>
            <p className="text-auth-lead text-secondary">{t("welcome.about.lead")}</p>
          </div>
          <div className="divide-y divide-divider">
            {editable.map((attribute) => (
              <PersonalInfoAttributesRow
                key={attribute.id}
                attribute={attribute}
                rawValue={values[`${ATTR_PREFIX}${attribute.id}`]}
                isEdit
                wasFilled={Boolean(welcome.data?.values?.[`${ATTR_PREFIX}${attribute.id}`])}
                onChange={(v) => setValues((current) => ({ ...current, [`${ATTR_PREFIX}${attribute.id}`]: v }))}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <ContinueButton onClick={saveAbout} busy={busy} />
            <SkipButton onClick={() => go(1)} disabled={busy} />
          </div>
        </>
      )}

      {step === "prefs" && (
        <PreferencesStep
          company={company}
          stepBars={stepBars}
          settings={settings.data}
          loading={settings.isLoading}
          onLeaveAction={leave}
        />
      )}
    </WelcomeFrame>
  );
};

function ContinueButton({ onClick, busy }: { onClick: () => void; busy?: boolean }) {
  const tCommon = useTranslations("common");
  return (
    <Button type="button" size="lg" className="w-full" onClick={onClick} loading={busy} loadingLabel={tCommon("actions.saving")}>
      {tCommon("actions.continue")}
    </Button>
  );
}

/**
 * W1 — "Log in faster next time": the providers the company offers, as their own white buttons (never the accent).
 * The round trip asks "confirm it is you" first when the login is not fresh, and comes back to `/welcome`.
 */
function ConnectStep({
  company,
  overview,
  connectable,
  returned,
  onNextAction,
  onRefreshAction,
  post,
}: {
  company: FirstRunCompany;
  overview: SignInOverviewDTO | null;
  connectable: Provider[];
  returned: WelcomeReturn;
  onNextAction: () => void;
  onRefreshAction: () => Promise<unknown>;
  post: (provider: Provider) => Promise<{ redirectUrl: string }>;
}) {
  const t = useTranslations("firstRun");
  const [busy, setBusy] = React.useState<Provider | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [settingPassword, setSettingPassword] = React.useState(false);
  const [passwordSet, setPasswordSet] = React.useState(false);

  const connect = async (provider: Provider) => {
    setBusy(provider);
    setError(null);
    try {
      const res = await post(provider);
      window.location.assign(res.redirectUrl);
    } catch (e) {
      setError(messageForError(e));
      setBusy(null);
    }
  };

  const connected = returned?.kind === "connected";
  const account = overview?.accounts[0];
  const declined =
    returned?.kind === "inUse"
      ? t("welcome.connect.inUse", { provider: PROVIDER_LABEL[returned.provider], company: company.name })
      : returned?.kind === "failed"
        ? t("welcome.connect.failed", { provider: PROVIDER_LABEL[returned.provider] })
        : null;

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-auth-title text-primary">{t("welcome.connect.title")}</h1>
        <p className="text-auth-lead text-secondary">
          {connectable.length === 1
            ? t("welcome.connect.leadOne", { provider: PROVIDER_LABEL[connectable[0]] })
            : t("welcome.connect.lead")}
        </p>
      </div>

      {connected || passwordSet ? (
        <>
          <InlineAlert tone="approved">
            {passwordSet
              ? t("welcome.connect.passwordSet")
              : account?.email
                ? t("welcome.connect.connected", { account: account.email })
                : t("welcome.connect.connectedNoAccount")}
          </InlineAlert>
          <ContinueButton onClick={onNextAction} />
        </>
      ) : (
        <>
          {declined && <InlineAlert tone="declined">{declined}</InlineAlert>}
          <div className="flex flex-col gap-3">
            {connectable.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => void connect(provider)}
                aria-busy={busy === provider || undefined}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-3 rounded-control border border-field bg-card px-4.5",
                  "text-card-title font-medium text-primary hover:border-strong hover:bg-subtle active:bg-mist",
                  "aria-[busy=true]:pointer-events-none",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a 20 px brand file, not a photo */}
                <img src={PROVIDER_MARK[provider]} alt="" width={20} height={20} className="block flex-none" />
                {busy === provider
                  ? t("welcome.connect.busy", { provider: PROVIDER_LABEL[provider] })
                  : t("welcome.connect.button", { provider: PROVIDER_LABEL[provider] })}
              </button>
            ))}
            {overview && !overview.hasPassword && (
              <Button type="button" variant="secondary" size="lg" className="w-full" onClick={() => setSettingPassword(true)}>
                {t("welcome.connect.setPassword")}
              </Button>
            )}
          </div>
          <FormError message={error} />
          <SkipButton onClick={onNextAction} disabled={busy !== null} />
        </>
      )}

      <SetPasswordDialog
        open={settingPassword}
        onClose={() => setSettingPassword(false)}
        onDone={async () => {
          await onRefreshAction();
          setPasswordSet(true);
        }}
      />
    </>
  );
}

/**
 * W4 — the time zone and the person's own language, preset to what is in effect. *Finish* saves what changed (an
 * unchanged field keeps following the company) and leaves; *Skip* leaves. The date format is not asked here — it
 * stays in My Preferences.
 */
function PreferencesStep({
  company,
  stepBars,
  settings,
  loading,
  onLeaveAction,
}: {
  company: FirstRunCompany;
  stepBars: React.ReactNode;
  settings: ReturnType<typeof useUserSettings>["data"];
  loading: boolean;
  onLeaveAction: () => Promise<boolean>;
}) {
  const t = useTranslations("firstRun");
  const effectiveLanguage = toLanguage(settings?.language) ?? toLanguage(settings?.companyLanguage);
  const [timeZone, setTimeZone] = React.useState<string | null>(null);
  const [language, setLanguage] = React.useState<string | null>(null);
  const [seeded, setSeeded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!settings || seeded) return;
    setTimeZone(settings.timeZone);
    setLanguage(effectiveLanguage);
    setSeeded(true);
  }, [settings, seeded, effectiveLanguage]);

  const finish = async () => {
    setBusy(true);
    const zoneChanged = (settings?.timeZone ?? null) !== timeZone;
    const languageChanged = language !== null && language !== effectiveLanguage;
    if (zoneChanged || languageChanged) {
      const res = await updateUserSettingsAction({
        ...(zoneChanged ? { timeZone: timeZone ?? undefined, clearTimeZone: timeZone === null } : {}),
        ...(languageChanged ? { language } : {}),
      });
      if (res.status !== ActionStatus.SUCCESS) {
        setBusy(false);
        showActionError(res);
        return;
      }
    }
    if (!(await onLeaveAction())) setBusy(false);
  };

  const skip = async () => {
    setBusy(true);
    if (!(await onLeaveAction())) setBusy(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {stepBars}
        <h1 className="text-auth-title text-primary">{t("welcome.preferences.title")}</h1>
        <p className="text-auth-lead text-secondary">
          {company.name ? t("welcome.preferences.lead", { company: company.name }) : t("welcome.preferences.leadNoName")}
        </p>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="welcome-timezone" className="text-label text-primary">{t("preferences.timeZone.label")}</label>
          <TimeZoneSelect
            id="welcome-timezone"
            value={timeZone}
            onChange={setTimeZone}
            companyTimeZone={settings?.companyTimeZone}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="welcome-language" className="text-label text-primary">{t("preferences.language.label")}</label>
          <LanguageSelect id="welcome-language" value={language} onChange={setLanguage} disabled={loading} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="button" size="lg" className="w-full" onClick={finish} loading={busy}>
          {t("welcome.finish")}
        </Button>
        <SkipButton onClick={skip} disabled={busy} />
      </div>
    </>
  );
}
