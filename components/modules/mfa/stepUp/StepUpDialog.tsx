"use client";

import * as React from "react";
import { FieldError } from "@/components/desact/field-error";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useMfaStatus } from "@/components/modules/mfa/hooks";
import { stepUpAction } from "@/components/modules/mfa/actions";
import { CodeField } from "@/components/modules/mfa/components";
import { registerStepUpDialog } from "./stepUp";
import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { SignInOverviewDTO } from "@/api/modules/identity/services";
import { messageForError } from "@/lib/errors/errorMessages";

/** The same key the preferences section reads, so a change there is seen here. */
const SIGN_IN_OVERVIEW_QK = ["ME", "SIGN_IN"] as const;

/**
 * "Confirm it is you" (MFA_DESIGN.md § 3.5) — one dialog for every sensitive operation, mounted once in the
 * app shell. A person with a factor answers a code or a backup code; one without, the password. On success
 * the operation that asked is replayed by whoever called `requestStepUp`.
 */
export const StepUpDialog: React.FC = () => {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const resolver = React.useRef<((proved: boolean) => void) | null>(null);
  const status = useMfaStatus(open);
  const { internalApiClient } = useAppDataContext();
  const ways = useQuery<SignInOverviewDTO>({
    queryKey: SIGN_IN_OVERVIEW_QK,
    queryFn: () => internalApiClient.get<SignInOverviewDTO>("/me/sign-in"),
    enabled: open,
  });
  const [value, setValue] = React.useState("");
  const [backup, setBackup] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    registerStepUpDialog((resolve) => {
      resolver.current = resolve;
      setValue("");
      setBackup(false);
      setError(null);
      setOpen(true);
    });
    return () => registerStepUpDialog(null);
  }, []);

  const finish = (proved: boolean) => {
    setOpen(false);
    resolver.current?.(proved);
    resolver.current = null;
  };

  const enrolled = status.data?.enrolled ?? false;
  // Without a factor, a fresh sign-in at Google or Microsoft proves it too (SOCIAL_SIGN_IN_DESIGN.md § 5.5). It leaves
  // the page, so the operation is not replayed: the person comes back and does it again.
  const hasPassword = ways.data?.hasPassword ?? true;
  const providers = enrolled ? [] : (ways.data?.accounts ?? [])
    .map((a) => a.provider).filter((p) => ways.data?.offered.includes(p));

  const confirmWith = async (provider: "GOOGLE" | "MICROSOFT") => {
    setBusy(true);
    setError(null);
    try {
      const res = await internalApiClient.post<{ redirectUrl: string }>("/auth/provider/person",
        { purpose: "REAUTH", provider, returnTo: `${window.location.pathname}${window.location.search}` });
      window.location.assign(res.redirectUrl);
    } catch (e) {
      setError(messageForError(e));
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setTried(true);
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    const body = enrolled ? (backup ? { backupCode: value.trim() } : { code: value.trim() }) : { password: value };
    const res = await stepUpAction(body);
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) finish(true);
    else setError(res.errorMessage ?? null);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && finish(false)}>
      <DialogContent className="sm:max-w-md">
        <form method="post" onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("stepUp.title")}</DialogTitle>
            <DialogDescription>
              {enrolled
                ? t("stepUp.needsCode")
                : hasPassword ? t("stepUp.needsPassword") : t("stepUp.needsProvider")}
            </DialogDescription>
          </DialogHeader>
          {status.isLoading ? null : enrolled ? (
            <>
              <div>
                <CodeField id="step-up-code" value={value} onChange={setValue} backup={backup} disabled={busy} autoFocus />
                <FieldError>{tried && !value.trim() ? tCommon("validation.enterCode") : null}</FieldError>
              </div>
              <button type="button" className="text-body text-secondary underline" onClick={() => { setBackup((v) => !v); setValue(""); }}>
                {backup ? t("mfaSignIn.challenge.useApp") : t("mfaSignIn.challenge.useBackup")}
              </button>
            </>
          ) : !hasPassword ? null : (
            <div className="space-y-2">
              <RequiredLabel htmlFor="step-up-password" required>{t("login.passwordLabel")}</RequiredLabel>
              <Input
                id="step-up-password"
                type="password"
                autoComplete="current-password"
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
                disabled={busy}
                autoFocus
              />
              <FieldError>{tried && !value.trim() ? tCommon("validation.enterPassword") : null}</FieldError>
            </div>
          )}
          {providers.length > 0 && (
            <div className="flex flex-col gap-2">
              {providers.map((p) => (
                <Button key={p} type="button" variant="secondary" disabled={busy} onClick={() => confirmWith(p)}>
                  {t("stepUp.confirmWith", { provider: p === "GOOGLE" ? "Google" : "Microsoft" })}
                </Button>
              ))}
            </div>
          )}
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => finish(false)} disabled={busy}>{tCommon("actions.cancel")}</Button>
            {(enrolled || hasPassword) && (
              <Button type="submit" disabled={busy}>{busy ? t("emailChange.confirming") : tCommon("actions.confirm")}</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
