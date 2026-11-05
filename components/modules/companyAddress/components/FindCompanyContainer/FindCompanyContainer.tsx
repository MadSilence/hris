"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import AuthScreen from "@/components/modules/auth/components/AuthScreen";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { remindCompanyAddressesAction } from "@/components/modules/companyAddress/actions/companyAddressActions";
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
 * "Forgot company address?"
 *
 * **The answer never says whether the email holds an account anywhere** — the backend replies the same
 * for none, one or many, and so does this screen. The addresses go to the inbox. Only a request that
 * never got an answer is reported as a failure, as on "Forgot password".
 */
export function FindCompanyContainer() {
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
      const res = await remindCompanyAddressesAction({ email: values.email.trim() });
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
      <AuthScreen className="flex-1">
        <div className="w-full space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-greeting">{t("passwordReset.forgot.sentTitle")}</h1>
            <p className="text-body text-tertiary" role="status">{t("companyAddress.find.sentBody")}</p>
          </div>
          <Button size="lg" asChild variant="secondary" className="w-full">
            <Link href="/login">{t("passwordReset.backToSignIn")}</Link>
          </Button>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen className="flex-1">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-greeting">{t("companyAddress.find.title")}</h1>
          <p className="text-body text-tertiary">
            {t("companyAddress.find.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="find-company-email">{t("login.emailLabel")}</Label>
            <Input
              id="find-company-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={(e) => formik.setFieldValue("email", e.currentTarget.value)}
              disabled={busy}
              className="h-11"
              aria-invalid={Boolean(formik.errors.email)}
            />
            {formik.errors.email && (
              <FieldError>{formik.errors.email}</FieldError>
            )}
          </div>

          <FormError message={error} />

          <Button size="lg" type="submit" disabled={busy} className="w-full">
            {busy ? t("passwordReset.forgot.sending") : t("companyAddress.find.submit")}
          </Button>

          <p className="text-center text-body text-tertiary">
            <Link href="/login" className="text-accent-text underline-offset-4 hover:underline">{t("passwordReset.backToSignIn")}</Link>
          </p>
        </form>
      </div>
    </AuthScreen>
  );
}
