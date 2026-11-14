"use client";

import React, { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail01Icon } from "@hugeicons/core-free-icons";

import { Button, buttonVariants } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { AuthBack, AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import { ResendLine } from "@/components/modules/auth/components/ResendLine";
import { remindCompanyAddressesAction } from "@/components/modules/companyAddress/actions/companyAddressActions";
import { isEmail } from "@/lib/email";

/**
 * "Find your company" (sign-in-root A3, A4). A4 reads the same whatever exists: no email arrives when the address can
 * log in nowhere, and the screen never says which (COMPANY_ADDRESSES.md § 5). Resend uses the same limit.
 */
export function FindCompanyContainer() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const send = async (address: string) => {
    const res = await remindCompanyAddressesAction({ email: address });
    return res.status === ActionStatus.SUCCESS ? null : (res.errorMessage ?? null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const address = email.trim();
    if (!address) return setFieldError(t("fields.emailRequired"));
    if (!isEmail(address)) return setFieldError(t("fields.emailInvalid"));
    setBusy(true);
    setError(null);
    const refused = await send(address);
    setBusy(false);
    if (refused) setError(refused);
    else setSentTo(address);
  };

  if (sentTo) {
    return (
      <AuthSplit brand={{ kind: "noddo" }} back={<AuthBack onClick={() => setSentTo(null)} />}>
        <AuthHeading
          icon={Mail01Icon}
          tone="accent"
          title={t("root.find.sentTitle")}
          lead={t.rich("root.find.sentBody", { email: sentTo, b: (c) => <b className="font-medium text-primary [overflow-wrap:anywhere]">{c}</b> })}
        />
        <ResendLine onResend={() => send(sentTo)} />
        <a href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("root.find.backToLogin")}</a>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit brand={{ kind: "noddo" }} back={<AuthBack href="/login" />}>
      <AuthHeading title={t("root.find.title")} lead={t("root.find.lead")} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="find-company-email">{t("fields.workEmail")}</Label>
          <Input
            id="find-company-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
              setFieldError(null);
            }}
            aria-invalid={Boolean(fieldError)}
            className="h-11"
            autoFocus
          />
          <FieldError>{fieldError}</FieldError>
        </div>
        <FormError message={error} />
        <Button size="lg" type="submit" className="w-full" loading={busy} loadingLabel={t("busy.sending")}>
          {t("root.find.submit")}
        </Button>
      </form>
    </AuthSplit>
  );
}
