"use client";

import { FormEvent, useCallback } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
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

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

type ApiErrorProps = {
  message?: string;
};

function ApiErrorMessage({ message }: ApiErrorProps) {
  if (!message) return null;

  return (
    <p
      className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
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
          <h1 className="text-4xl font-medium">{headline}</h1>

          <p className="text-md text-[var(--color-text-tertiary)]">
            {subheadline}
          </p>
        </div>

        {notice && (
          <p
            className="rounded-md border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700"
            role="status"
          >
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <RequiredLabel htmlFor="login-email" required>Email Address</RequiredLabel>

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

            <FieldError message={formik.errors.email}/>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <RequiredLabel htmlFor="login-password" required>Password</RequiredLabel>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

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

            <FieldError message={formik.errors.password}/>
          </div>

          <ApiErrorMessage message={apiError}/>

          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Signing in…" : "Sign in"}
          </Button>

          {changeCompanyHref ? (
            <p className="text-center text-sm text-muted-foreground">
              Not your company?{" "}
              <a href={changeCompanyHref} className="underline underline-offset-4">
                Sign in to another one
              </a>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
