"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { forgotPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";
import { FieldError } from "@/components/desact/field-error";

type Values = { email: string };

const buildSchema = (t: ReturnType<typeof useTranslations<"auth">>) => yup.object({
  email: yup
    .string()
    .trim()
    .required(t("login.validation.emailRequired"))
    .email(t("login.validation.emailInvalid"))
    .nonNullable(),
});

/**
 * Asking for a link to set a new password.
 *
 * **The answer never says whether the address has an account.** The backend replies the same either
 * way, and so does this screen: the confirmation below is shown for every accepted request. Only a
 * request that never got an answer — the API unreachable, a failure on its side — is reported as a
 * failure, because claiming a link was sent when nothing was asked would be a lie of a different kind.
 */
export function ForgotPasswordContainer() {
  const t = useTranslations("auth");
  const schema = useMemo(() => buildSchema(t), [t]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<Values>({
    initialValues: { email: "" },
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      setError(null);
      const res = await forgotPasswordAction({ email: values.email.trim() });
      if (res.status === ActionStatus.SUCCESS) setSent(true);
      else setError(res.errorMessage ?? null);
    },
  });

  const busy = formik.isSubmitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), true);
    if (Object.keys(errors).length > 0) return;
    await formik.submitForm();
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-page-title">{t("passwordReset.forgot.sentTitle")}</h1>
        <p className="text-body text-tertiary" role="status">{t("passwordReset.forgot.sentBody")}</p>
        <Button asChild variant="secondary">
          <Link href="/login">{t("passwordReset.backToSignIn")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-page-title">{t("passwordReset.forgot.title")}</h1>
          <p className="text-body text-tertiary">
            {t("passwordReset.forgot.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="forgot-email" required>{t("login.emailLabel")}</RequiredLabel>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={(e) => formik.setFieldValue("email", e.currentTarget.value)}
              disabled={busy}
              aria-invalid={Boolean(formik.errors.email)}
            />
            {formik.errors.email && (
              <FieldError>{formik.errors.email}</FieldError>
            )}
          </div>

          <FormError message={error} />

          <Button type="submit" disabled={busy} size="lg" className="w-full">
            {busy ? t("passwordReset.forgot.sending") : t("passwordReset.forgot.send")}
          </Button>

          <p className="text-center text-body text-tertiary">
            <Link href="/login" className="text-accent-text underline-offset-4 hover:underline">{t("passwordReset.backToSignIn")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
