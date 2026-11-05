"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { confirmEmailChangeAction } from "@/components/modules/emailChange/actions/emailChangeActions";

type Props = {
  token: string;
  firstName: string | null;
  newEmail: string;
};

/**
 * Confirming a new sign-in address from the emailed link.
 *
 * A button rather than confirming on load: mail scanners open links to check them, and a link that
 * did its work on a GET would be used up by the scanner before the person ever saw it.
 */
export function ConfirmEmailContainer({ token, firstName, newEmail }: Props) {
  const t = useTranslations("auth");
  const email = (chunks: React.ReactNode) => <span className="font-medium text-primary">{chunks}</span>;
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await confirmEmailChangeAction(token);
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) {
      setDone(true);
      return;
    }
    setError(res.errorMessage ?? null);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-page-title">{t("emailChange.doneTitle")}</h1>
        <p className="text-body text-tertiary">
          {t.rich("emailChange.doneBody", { email: newEmail, b: email })}
        </p>
        <Button asChild>
          <a href="/login">{t("login.submit")}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-page-title">{firstName ? t("passwordReset.reset.greeting", { name: firstName }) : t("emailChange.title")}</h1>
      <p className="text-body text-tertiary">
        {t.rich("emailChange.description", { email: newEmail, b: email })}
      </p>
      <FormError message={error} />
      <Button type="button" onClick={confirm} disabled={busy} size="lg" className="w-full">
        {busy ? t("emailChange.confirming") : t("emailChange.confirm")}
      </Button>
    </div>
  );
}
