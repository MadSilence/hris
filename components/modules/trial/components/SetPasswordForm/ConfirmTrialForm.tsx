"use client";

import React, { FormEvent, useCallback } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";

export type PasswordValues = {
  password: string;
  confirmPassword: string;
};

export interface SetPasswordFormProps {
  onSubmitAction: (values: PasswordValues) => void | Promise<void>;
  isLoading?: boolean;
  apiError?: string;
  isSuccess: boolean;
  /** Known once the company exists; the success screen sends the person there. */
  signInAddress?: SignInAddress;
}

export enum PasswordMessages {
  Required = "Please enter a password.",
  TooShort = "Use at least 8 characters.",
  Weak = "Use upper & lower case letters, a number and a symbol.",
  ConfirmRequired = "Please confirm your password.",
  Mismatch = "Passwords don’t match.",
}

export function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}

/** The password rule every set-a-password screen uses — signup and invitation alike. */
export const passwordSchema = yup.object({
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

function ConfirmHeader() {
  return (
    <div className="space-y-3 text-center">
      <h1 className="text-greeting">Set your password</h1>

      <p className="mx-auto max-w-xl text-body text-tertiary">
        Create a strong password for your noddo account.
      </p>
    </div>
  );
}

/** Where the new company signs in: the link, and the address as a person reads it. */
export type SignInAddress = {
  href: string;
  label: string;
};

function ConfirmSuccessBlock({ signInAddress }: { signInAddress?: SignInAddress }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-greeting">Password set</h1>

      <p className="text-body text-tertiary">
        Your password has been created. You can now sign in and continue setting
        up your company.
      </p>

      {signInAddress ? (
        <p className="text-body text-tertiary">
          Your company signs in at{" "}
          <strong className="font-medium text-primary">{signInAddress.label}</strong>
          {" "}— keep that address.
        </p>
      ) : null}

      <p className="text-body text-tertiary">
        Head over to your company&apos;s{" "}
        <a href={signInAddress?.href ?? "/login"} className="text-accent-text underline-offset-4 hover:underline">
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
  signInAddress,
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
    validationSchema: passwordSchema,
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
    return <ConfirmSuccessBlock signInAddress={signInAddress}/>;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center py-12">
      <div className="w-full space-y-8">
        <ConfirmHeader/>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="confirm-password" required>Password</RequiredLabel>

            <Input
              id="confirm-password"
              name="password"
              type="password"
              autoComplete="new-password"
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

          <div className="space-y-2">
            <RequiredLabel htmlFor="confirm-password-repeat" required>Confirm password</RequiredLabel>

            <Input
              id="confirm-password-repeat"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={(e) =>
                formik.setFieldValue("confirmPassword", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.confirmPassword}
            />

            <FieldError>{formik.errors.confirmPassword}</FieldError>
          </div>

          <p className="text-body text-tertiary">
            Use at least 8 characters with upper &amp; lower case letters, a
            number, and a symbol.
          </p>

          <FormError message={apiError} />

          <Button size="lg" type="submit" disabled={busy} className="w-full">
            {busy ? "Saving…" : "Set password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
