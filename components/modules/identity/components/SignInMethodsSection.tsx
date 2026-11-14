"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { PasswordField } from "@/components/modules/auth/components/PasswordField";
import { PASSWORD_MIN_LENGTH } from "@/components/modules/auth/password/passwordRules";
import { withStepUp, withStepUpAction } from "@/components/modules/mfa/stepUp";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useImpersonationContext } from "@/components/providers/ImpersonationProvider";
import type { SignInOverviewDTO } from "@/api/modules/identity/services";
import { messageForError } from "@/lib/errors/errorMessages";
import { useDateFormatter } from "@/lib/date";
import { disconnectAccountAction, removePasswordAction, setFirstPasswordAction } from "../actions/personalSignInActions";

export const SIGN_IN_OVERVIEW_QK = ["ME", "SIGN_IN"] as const;

type Provider = "GOOGLE" | "MICROSOFT";
const LABEL: Record<Provider, string> = { GOOGLE: "Google", MICROSOFT: "Microsoft" };

/** What the page was opened with after a provider's round trip (`?provider=…`, `&inUse=1`). */
export type ProviderReturn = "connected" | "confirmed" | "failed" | "inUse" | null;

/**
 * *My Preferences → Ways to log in* (SOCIAL_SIGN_IN_DESIGN.md § 5.5, § 6.1): the password — set it when there is none,
 * remove it while another way in remains — and Google and Microsoft, connected or not. Every change asks "confirm it is
 * you" first; the last way in cannot go, and Java says so in one sentence.
 */
export function SignInMethodsSection({ returned = null }: { returned?: ProviderReturn }) {
  const t = useTranslations("settings");
  const formatDate = useDateFormatter();
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();
  // L5: somebody acting as this person sees none of their ways in (live walk of 2026-11-13: the list showed).
  const { isImpersonating } = useImpersonationContext();
  const overview = useQuery<SignInOverviewDTO>({
    queryKey: SIGN_IN_OVERVIEW_QK,
    queryFn: () => internalApiClient.get<SignInOverviewDTO>("/me/sign-in"),
    enabled: !isImpersonating,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [setting, setSetting] = React.useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: SIGN_IN_OVERVIEW_QK });

  const run = async (key: string, action: () => Promise<{ status: ActionStatus; errorMessage?: string }>) => {
    setBusy(key);
    setError(null);
    const res = await action();
    setBusy(null);
    if (res.status === ActionStatus.SUCCESS) await refresh();
    else setError(res.errorMessage ?? null);
  };

  const connect = async (provider: Provider) => {
    setBusy(provider);
    setError(null);
    try {
      const res = await withStepUp(() => internalApiClient.post<{ redirectUrl: string }>("/auth/provider/person",
        { purpose: "CONNECT", provider, returnTo: "/preferences" }));
      window.location.assign(res.redirectUrl);
    } catch (e) {
      setError(messageForError(e));
      setBusy(null);
    }
  };

  if (isImpersonating) return <p className="text-body text-tertiary">{t("signIn.hiddenWhileActing")}</p>;
  if (!overview.data) return null;
  const data = overview.data;
  const providers = Array.from(new Set<Provider>([...data.offered, ...data.accounts.map((a) => a.provider)]));

  return (
    <div className="space-y-4">
      {returned === "connected" && <InlineAlert tone="approved">{t("signIn.connected")}</InlineAlert>}
      {returned === "failed" && <InlineAlert tone="declined">{t("signIn.failed")}</InlineAlert>}
      {returned === "inUse" && <InlineAlert tone="declined">{t("signIn.inUse")}</InlineAlert>}

      <div className="flex items-center justify-between gap-4 border-b border-divider pb-4">
        <div className="min-w-0">
          <p className="text-body font-medium text-primary">{t("signIn.password")}</p>
          <p className="text-body text-tertiary">
            {data.hasPassword ? (data.passwordRemovable ? t("signIn.passwordSet") : t("signIn.passwordOnly")) : t("signIn.noPassword")}
          </p>
        </div>
        {data.hasPassword ? (
          data.passwordRemovable && (
            <Button type="button" variant="secondary" size="sm" disabled={busy !== null}
                    onClick={() => run("password", () => withStepUpAction(() => removePasswordAction()))}>
              {t("signIn.removePassword")}
            </Button>
          )
        ) : (
          <Button type="button" variant="secondary" size="sm" disabled={busy !== null} onClick={() => setSetting(true)}>
            {t("signIn.setPassword")}
          </Button>
        )}
      </div>

      {providers.map((provider) => {
        const account = data.accounts.find((a) => a.provider === provider);
        const offered = data.offered.includes(provider);
        return (
          <div key={provider} className="flex items-center justify-between gap-4 border-b border-divider pb-4">
            <div className="flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- a fixed brand mark, served as is */}
              <img src={`/brand/providers/${provider.toLowerCase()}.png`} alt="" width={20} height={20} className="shrink-0" />
              <div className="min-w-0">
                <p className="text-body font-medium text-primary">{LABEL[provider]}</p>
                <p className="text-body text-tertiary [overflow-wrap:anywhere]">
                  {account
                    ? account.lastUsedAt
                      ? t("signIn.accountLineUsed", { email: account.email ?? "", connected: formatDate(account.connectedAt), used: formatDate(account.lastUsedAt) })
                      : t("signIn.accountLine", { email: account.email ?? "", connected: formatDate(account.connectedAt) })
                    : t("signIn.notConnected")}
                </p>
                {account && !offered && <p className="text-body text-tertiary">{t("signIn.notOffered")}</p>}
              </div>
            </div>
            {account ? (
              <Button type="button" variant="secondary" size="sm" disabled={busy !== null}
                      onClick={() => run(provider, () => withStepUpAction(() => disconnectAccountAction(provider)))}>
                {t("signIn.disconnect")}
              </Button>
            ) : offered && (
              <Button type="button" variant="secondary" size="sm" disabled={busy !== null} onClick={() => connect(provider)}>
                {busy === provider ? t("signIn.connecting") : t("signIn.connect")}
              </Button>
            )}
          </div>
        );
      })}

      <FormError message={error} />
      <SetPasswordDialog open={setting} onClose={() => setSetting(false)} onDone={refresh} />
    </div>
  );
}

/** *Set a password* — no current one to ask for; step-up stands in for it (§ 5.5). Also the welcome's W1. */
export function SetPasswordDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => Promise<unknown> }) {
  const t = useTranslations("settings");
  const tAuth = useTranslations("auth");
  const [password, setPassword] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPassword("");
      setFieldError(undefined);
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!password) return setFieldError(tAuth("fields.newPasswordRequired"));
    if (password.length < PASSWORD_MIN_LENGTH) return setFieldError(tAuth("fields.passwordTooShort"));
    setBusy(true);
    setError(null);
    const res = await withStepUpAction(() => setFirstPasswordAction(password));
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) {
      await onDone();
      onClose();
    } else {
      setError(res.errorMessage ?? null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("signIn.setPasswordTitle")}</DialogTitle>
            <DialogDescription>{t("signIn.setPasswordLead")}</DialogDescription>
          </DialogHeader>
          <PasswordField id="set-password" label={tAuth("fields.password")} value={password}
                         onChange={(v) => { setPassword(v); setFieldError(undefined); }}
                         error={fieldError} hint={tAuth("fields.passwordHint")} autoComplete="new-password" />
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>{t("signIn.cancel")}</Button>
            <Button type="submit" loading={busy}>{t("signIn.setPassword")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
