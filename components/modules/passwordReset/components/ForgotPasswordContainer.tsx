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
import { AuthBack, AuthHeading, AuthSplit, type AuthBrand } from "@/components/modules/auth/layout";
import { ResendLine } from "@/components/modules/auth/components/ResendLine";
import { forgotPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";
import { isEmail } from "@/lib/email";

/** Asks for a reset link for `address`; null when it went, else the refusal to show. */
export async function sendPasswordResetLink(address: string): Promise<string | null> {
  const res = await forgotPasswordAction({ email: address });
  return res.status === ActionStatus.SUCCESS ? null : (res.errorMessage ?? null);
}

/**
 * F2, "Check your email" — after F1, and straight from the login's alert from the third wrong password in a row
 * (sign-in-company-login-no-lock, U2). The caller frames it and gives the way back.
 */
export function ForgotPasswordSent({ email }: { email: string }) {
  const t = useTranslations("auth");
  return (
    <>
      <AuthHeading
        icon={Mail01Icon}
        tone="accent"
        title={t("forgot.sentTitle")}
        lead={t.rich("forgot.sentBody", { email, b: (c) => <b className="font-medium text-primary [overflow-wrap:anywhere]">{c}</b> })}
      />
      <ResendLine onResend={() => sendPasswordResetLink(email)} />
      <a href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("forgot.backToLogin")}</a>
    </>
  );
}

/**
 * "Forgot your password?" (sign-in-password F1, F2). F2 reads the same whatever exists — no email arrives when the
 * address has no account here — and resending shares the limit of the first ask and of the login code.
 */
export function ForgotPasswordContainer({ brand }: { brand: AuthBrand }) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const send = sendPasswordResetLink;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
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
      <AuthSplit brand={brand} back={<AuthBack onClick={() => setSentTo(null)} />}>
        <ForgotPasswordSent email={sentTo} />
      </AuthSplit>
    );
  }

  return (
    <AuthSplit brand={brand} back={<AuthBack href="/login" />}>
      <AuthHeading title={t("forgot.title")} lead={t("forgot.lead")} />
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="forgot-email">{t("fields.email")}</Label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.currentTarget.value); setFieldError(null); }}
            aria-invalid={Boolean(fieldError)}
            className="h-11"
            autoFocus
          />
          <FieldError>{fieldError}</FieldError>
        </div>
        <FormError message={error} />
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("busy.sending")}>
          {t("forgot.submit")}
        </Button>
      </form>
    </AuthSplit>
  );
}
