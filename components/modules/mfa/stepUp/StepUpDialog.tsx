"use client";

import * as React from "react";
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
  const [value, setValue] = React.useState("");
  const [backup, setBackup] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !value.trim()) return;
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
                : t("stepUp.needsPassword")}
            </DialogDescription>
          </DialogHeader>
          {status.isLoading ? null : enrolled ? (
            <>
              <CodeField id="step-up-code" value={value} onChange={setValue} backup={backup} disabled={busy} autoFocus />
              <button type="button" className="text-body text-secondary underline" onClick={() => { setBackup((v) => !v); setValue(""); }}>
                {backup ? t("mfaSignIn.challenge.useApp") : t("mfaSignIn.challenge.useBackup")}
              </button>
            </>
          ) : (
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
            </div>
          )}
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => finish(false)} disabled={busy}>{tCommon("actions.cancel")}</Button>
            <Button type="submit" disabled={busy || !value.trim()}>{busy ? t("emailChange.confirming") : tCommon("actions.confirm")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
