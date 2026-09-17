"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  passwordSchema,
  type PasswordValues,
} from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";
import { resetPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";

/** The refusal for a link that was used, expired or never existed. */
const LINK_NOT_VALID = "AUTH00003";

type Props = {
  token: string;
  firstName: string | null;
};

/**
 * Setting a new password from the emailed link.
 *
 * The link is looked up on the server before this renders (without using it), so a used or expired
 * one never reaches a form it cannot submit. It can still go stale between the look-up and the submit,
 * which is why the refusal offers the way to a new link as well as saying so. The password rule is the
 * signup one, imported rather than copied — the same as the invitation screen.
 */
export function ResetPasswordContainer({ token, firstName }: Props) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkExpired, setLinkExpired] = useState(false);

  const formik = useFormik<PasswordValues>({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      setError(null);
      setLinkExpired(false);
      const res = await resetPasswordAction({ token, password: values.password });
      if (res.status === ActionStatus.SUCCESS) {
        setDone(true);
        return;
      }
      setError(res.errorMessage ?? null);
      setLinkExpired(res.code === LINK_NOT_VALID);
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

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-medium">Password Changed</h1>
        <p className="text-md text-muted-foreground">
          Your new password is set. Anywhere you were signed in with the old one has been signed out.
        </p>
        <Button asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center py-12">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-medium">{firstName ? `Hi ${firstName}` : "Set a New Password"}</h1>
          <p className="mx-auto max-w-xl text-md text-muted-foreground">
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="reset-password" required>New Password</RequiredLabel>
            <Input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={(e) => formik.setFieldValue("password", e.currentTarget.value)}
              disabled={busy}
              aria-invalid={Boolean(formik.errors.password)}
            />
            {formik.errors.password && (
              <p className="text-sm text-destructive" role="alert">{formik.errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="reset-password-repeat" required>Confirm Password</RequiredLabel>
            <Input
              id="reset-password-repeat"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={(e) => formik.setFieldValue("confirmPassword", e.currentTarget.value)}
              disabled={busy}
              aria-invalid={Boolean(formik.errors.confirmPassword)}
            />
            {formik.errors.confirmPassword && (
              <p className="text-sm text-destructive" role="alert">{formik.errors.confirmPassword}</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Use at least 8 characters with upper &amp; lower case letters, a number, and a symbol.
          </p>

          <FormError message={error} />

          {linkExpired && (
            <p className="text-center text-sm">
              <Link href="/forgot-password" className="underline underline-offset-4">Request a New Link</Link>
            </p>
          )}

          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Saving…" : "Set Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
