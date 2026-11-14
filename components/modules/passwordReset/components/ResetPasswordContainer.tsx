"use client";

import React, { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { Button, buttonVariants } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { AuthHeading, AuthSplit, CodeInput, type AuthBrand } from "@/components/modules/auth/layout";
import { PasswordField } from "@/components/modules/auth/components/PasswordField";
import { resetPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";

/**
 * "Set a password" from the emailed link (sign-in-password F3, F4, F6, F7). One title for everybody — somebody who
 * never had a password included — one field with the eye. F4 says the reset disconnects the person's own Google or
 * Microsoft account (S4); F6 asks for the code of a locked account with a factor (M5). The link is used only on
 * submit, so a mail scanner opening it burns nothing.
 */
const MIN_LENGTH = 12;
const PROVIDER_LABEL = { GOOGLE: "Google", MICROSOFT: "Microsoft" } as const;

type Props = {
  brand: AuthBrand;
  token: string;
  email: string | null;
  codeRequired: boolean;
  connectedProviders: Array<keyof typeof PROVIDER_LABEL>;
};

export function ResetPasswordContainer({ brand, token, email, codeRequired, connectedProviders }: Props) {
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ password?: string; code?: string }>({});
  const [refusal, setRefusal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!password) next.password = t("fields.newPasswordRequired");
    else if (password.length < MIN_LENGTH) next.password = t("fields.passwordTooShort");
    if (codeRequired && code.length < 6) next.code = t("fields.codeRequired");
    setErrors(next);
    if (next.password || next.code) return;

    setBusy(true);
    setRefusal(null);
    const res = await resetPasswordAction({ token, password, code: codeRequired ? code : undefined });
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) {
      setDone(true);
      return;
    }
    if (res.fieldErrors?.code || res.code === "AUTH00008" || res.code === "AUTH00006") setErrors({ code: t("reset.wrongCode") });
    else if (res.fieldErrors?.password || res.code === "AUTH00021") setErrors({ password: res.errorMessage ?? undefined });
    else setRefusal(res.errorMessage ?? null);
  };

  if (done) {
    return (
      <AuthSplit brand={brand}>
        <AuthHeading icon={CheckmarkCircle02Icon} tone="accent" title={t("reset.doneTitle")} lead={t("reset.doneBody")} />
        <a href="/login?passwordChanged=1" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("reset.logIn")}</a>
      </AuthSplit>
    );
  }

  const provider = connectedProviders[0];

  return (
    <AuthSplit brand={brand}>
      <AuthHeading
        title={t("reset.title")}
        lead={email ? t.rich("reset.lead", { email, b: (c) => <b className="font-medium text-primary [overflow-wrap:anywhere]">{c}</b> }) : undefined}
      />
      {provider && (
        <InlineAlert tone="pending">
          {t("reset.disconnects", { provider: PROVIDER_LABEL[provider] })}
          <br />
          {t("reset.disconnectsHint")}
        </InlineAlert>
      )}
      {codeRequired && (
        <InlineAlert tone="pending">
          {t("reset.locked")}
          <br />
          {t("reset.lockedHint")}
        </InlineAlert>
      )}
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <PasswordField
          id="reset-password"
          label={t("fields.newPassword")}
          value={password}
          onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: undefined })); }}
          error={errors.password}
          hint={t("fields.passwordHint")}
          autoComplete="new-password"
          autoFocus
        />
        {codeRequired && (
          <div className="flex flex-col gap-2">
            <span className="text-label text-primary">{t("fields.appCode")}</span>
            <CodeInput
              label={t("fields.appCode")}
              value={code}
              onChange={(v) => { setCode(v); setErrors((x) => ({ ...x, code: undefined })); }}
              invalid={Boolean(errors.code)}
            />
            <FieldError>{errors.code}</FieldError>
          </div>
        )}
        <FormError message={refusal} />
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("busy.saving")}>
          {t("reset.submit")}
        </Button>
      </form>
    </AuthSplit>
  );
}
