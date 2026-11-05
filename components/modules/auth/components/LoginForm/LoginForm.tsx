"use client";

import { FormEvent, useCallback, useMemo } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { InlineAlert } from "@/components/desact/alert";
import { useTranslations } from "next-intl";
import { DEFAULT_LOGIN_HEADLINE_KEY, DEFAULT_LOGIN_SUBHEADLINE_KEY } from "@/models/company/loginPageDefaults";

export type LoginFormValues = {
  email: string;
  password: string;
};

export interface LoginFormProps {
  onSubmitAction: (values: LoginFormValues) => void | Promise<void>;
  isLoading?: boolean;
  apiError?: string;
  /** Something the person should know before signing in — e.g. that their password was just changed. */
  notice?: string;
  /** The company's own words, decided on the server; the shipped ones when it chose none. */
  headline?: string;
  subheadline?: string;
  /** Where "sign in to your company" lives, for somebody at the wrong address. */
  changeCompanyHref?: string;
}

type AuthTranslator = ReturnType<typeof useTranslations<"auth">>;

const buildSchema = (t: AuthTranslator) => yup.object({
  email: yup
    .string()
    .trim()
    .required(t("login.validation.emailRequired"))
    .email(t("login.validation.emailInvalid"))
    .nonNullable(),

  password: yup
    .string()
    .required(t("login.validation.passwordRequired"))
    .min(8, t("login.validation.passwordTooShort"))
    .nonNullable(),
});

function sanitize(values: LoginFormValues): LoginFormValues {
  return {
    email: values.email.trim(),
    password: values.password,
  };
}


export default function LoginForm({
  onSubmitAction,
  isLoading = false,
  apiError,
  notice,
  headline,
  subheadline,
  changeCompanyHref,
}: LoginFormProps) {
  const t = useTranslations("auth");
  const schema = useMemo(() => buildSchema(t), [t]);
  const handleFormSubmission = useCallback(
    async (values: LoginFormValues) => {
      await onSubmitAction(sanitize(values));
    },
    [onSubmitAction],
  );

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const busy = isLoading || formik.isSubmitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (busy) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-page-title">{headline ?? t(DEFAULT_LOGIN_HEADLINE_KEY)}</h1>

          <p className="text-body text-secondary">
            {subheadline ?? t(DEFAULT_LOGIN_SUBHEADLINE_KEY)}
          </p>
        </div>

        {notice && <InlineAlert tone="approved">{notice}</InlineAlert>}

        {/*
          `method="post"`: a click that lands before the page hydrates submits natively, and the browser's
          default GET put the email and the password into the address bar, the history and the server's
          access log (found on the i18n walk of 2026-11-05). Every form holding a secret says post.
        */}
        <form method="post" onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-email">{t("login.emailLabel")}</Label>

            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={(e) =>
                formik.setFieldValue("email", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.email}
            />

            <FieldError>{formik.errors.email}</FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">{t("login.passwordLabel")}</Label>

            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={(e) =>
                formik.setFieldValue("password", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.password}
            />

            <FieldError>{formik.errors.password}</FieldError>
          </div>

          <FormError message={apiError} />

          <Button type="submit" size="lg" loading={busy} className="w-full">
            {busy ? t("login.submitting") : t("login.submit")}
          </Button>

        </form>

        <div className="space-y-2 text-center text-body text-tertiary">
          <p>
            <Link href="/forgot-password" className="text-accent-text underline-offset-4 hover:underline">
              {t("login.forgotPassword")}
            </Link>
          </p>

          {changeCompanyHref ? (
            <p>
              {t.rich("login.notYourCompany", {
                link: (chunks) => (
                  <a href={changeCompanyHref} className="text-accent-text underline-offset-4 hover:underline">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
