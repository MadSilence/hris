"use client";

import { FormEvent, useCallback } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { InlineAlert } from "@/components/desact/alert";
import { DEFAULT_LOGIN_HEADLINE, DEFAULT_LOGIN_SUBHEADLINE } from "@/models/company/loginPageDefaults";

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

export enum LoginFormMessages {
  EmailRequired = "Please enter your email.",
  InvalidEmail = "Enter a valid email address.",
  PasswordRequired = "Please enter your password.",
  PasswordTooShort = "Password must be at least 8 characters.",
}

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required(LoginFormMessages.EmailRequired)
    .email(LoginFormMessages.InvalidEmail)
    .nonNullable(),

  password: yup
    .string()
    .required(LoginFormMessages.PasswordRequired)
    .min(8, LoginFormMessages.PasswordTooShort)
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
  headline = DEFAULT_LOGIN_HEADLINE,
  subheadline = DEFAULT_LOGIN_SUBHEADLINE,
  changeCompanyHref,
}: LoginFormProps) {
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
          <h1 className="text-page-title">{headline}</h1>

          <p className="text-body text-secondary">
            {subheadline}
          </p>
        </div>

        {notice && <InlineAlert tone="approved">{notice}</InlineAlert>}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email address</Label>

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
            <Label htmlFor="login-password">Password</Label>

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
            {busy ? "Signing in…" : "Sign in"}
          </Button>

        </form>

        <div className="space-y-2 text-center text-body text-tertiary">
          <p>
            <Link href="/forgot-password" className="text-accent-text underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </p>

          {changeCompanyHref ? (
            <p>
              Not your company?{" "}
              <a href={changeCompanyHref} className="text-accent-text underline-offset-4 hover:underline">
                Sign in to another one
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
