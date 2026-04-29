"use client";

import React, { FormEvent, useCallback } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";

export type PasswordValues = {
  password: string;
  confirmPassword: string;
};

export interface SetPasswordFormProps {
  onSubmitAction: (values: PasswordValues) => void | Promise<void>;
  isLoading?: boolean;
  apiError?: string;
  isSuccess: boolean;
}

export enum PasswordMessages {
  Required = "Please enter a password.",
  TooShort = "Use at least 8 characters.",
  Weak = "Use upper & lower case letters, a number and a symbol.",
  ConfirmRequired = "Please confirm your password.",
  Mismatch = "Passwords don’t match.",
}

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}

const schema = yup.object({
  password: yup
    .string()
    .required(PasswordMessages.Required)
    .min(8, PasswordMessages.TooShort)
    .test("strong-password", PasswordMessages.Weak, (value) =>
      isStrongPassword(value ?? ""),
    )
    .nonNullable(),

  confirmPassword: yup
    .string()
    .required(PasswordMessages.ConfirmRequired)
    .oneOf([yup.ref("password")], PasswordMessages.Mismatch)
    .nonNullable(),
});

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

function ConfirmHeader() {
  return (
    <div className="space-y-3 text-center">
      <h1 className="text-4xl font-medium">Set your password</h1>

      <p className="mx-auto max-w-xl text-md text-[var(--color-text-tertiary)]">
        Create a strong password for your SixSoftware account.
      </p>
    </div>
  );
}

function ConfirmSuccessBlock() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-medium">Password set</h1>

      <p className="text-md text-[var(--color-text-tertiary)]">
        Your password has been created. You can now sign in and continue setting
        up your company.
      </p>

      <p className="text-sm text-[var(--color-text-tertiary)]">
        Head over to the{" "}
        <a href="/login" className="underline underline-offset-4">
          login page
        </a>{" "}
        to get started.
      </p>
    </div>
  );
}

export default function ConfirmTrialForm({
  onSubmitAction,
  isLoading = false,
  apiError,
  isSuccess,
}: SetPasswordFormProps) {
  const handleFormSubmission = useCallback(
    async (values: PasswordValues) => {
      await onSubmitAction(values);
    },
    [onSubmitAction],
  );

  const formik = useFormik<PasswordValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
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

  if (isSuccess) {
    return <ConfirmSuccessBlock/>;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center py-12">
      <div className="w-full space-y-8">
        <ConfirmHeader/>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Password</Label>

            <Input
              id="confirm-password"
              name="password"
              type="password"
              placeholder="Password*"
              autoComplete="new-password"
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

          <div className="space-y-2">
            <Label htmlFor="confirm-password-repeat">Confirm password</Label>

            <Input
              id="confirm-password-repeat"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password*"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={(e) =>
                formik.setFieldValue("confirmPassword", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.confirmPassword}
            />

            <FieldError message={formik.errors.confirmPassword}/>
          </div>

          <p className="text-sm text-[var(--color-text-tertiary)]">
            Use at least 8 characters with upper &amp; lower case letters, a
            number, and a symbol.
          </p>

          <ApiErrorMessage message={apiError}/>

          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Saving…" : "Set password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
