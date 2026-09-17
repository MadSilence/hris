"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { forgotPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";

type Values = { email: string };

export const FORGOT_PASSWORD_SENT_MESSAGE =
  "If an account exists for that address, we have sent a link to set a new password. It works for one hour.";

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Please enter your email.")
    .email("Enter a valid email address.")
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
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-medium">Check Your Email</h1>
        <p className="text-md text-muted-foreground" role="status">{FORGOT_PASSWORD_SENT_MESSAGE}</p>
        <Button asChild variant="outline">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center py-12">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-medium">Forgot Password</h1>
          <p className="text-md text-muted-foreground">
            Enter the email address you sign in with, and we will send you a link to set a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="forgot-email" required>Email Address</RequiredLabel>
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
              <p className="text-sm text-destructive" role="alert">{formik.errors.email}</p>
            )}
          </div>

          <FormError message={error} />

          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Sending…" : "Send Link"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">Back to Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
