"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  passwordSchema,
  type PasswordValues,
} from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";
import { resetPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";
import { FieldError } from "@/components/desact/field-error";

/** The refusal for a link that was used, expired or never existed. */
const LINK_NOT_VALID = "AUTH00003";

type Props = {
  token: string;
  firstName: string | null;
  /** Locked with a second factor (M5): a password alone does not open it, so the reset asks for a code. */
  codeRequired?: boolean;
};

/**
 * Setting a new password from the emailed link.
 *
 * The link is looked up on the server before this renders (without using it), so a used or expired
 * one never reaches a form it cannot submit. It can still go stale between the look-up and the submit,
 * which is why the refusal offers the way to a new link as well as saying so. The password rule is the
 * signup one, imported rather than copied — the same as the invitation screen.
 */
export function ResetPasswordContainer({ token, firstName, codeRequired = false }: Props) {
  const [code, setCode] = useState("");
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
      const res = await resetPasswordAction({ token, password: values.password, code: codeRequired ? code.trim() : undefined });
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
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-page-title">Password changed</h1>
        <p className="text-body text-tertiary">
          Your new password is set. Anywhere you were signed in with the old one has been signed out.
        </p>
        <Button asChild>
          <a href="/login">Sign in</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-page-title">{firstName ? `Hi ${firstName}` : "Set a new password"}</h1>
          <p className="text-body text-secondary">
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="reset-password" required>New password</RequiredLabel>
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
              <FieldError>{formik.errors.password}</FieldError>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="reset-password-repeat" required>Confirm password</RequiredLabel>
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
              <FieldError>{formik.errors.confirmPassword}</FieldError>
            )}
          </div>

          <p className="text-body text-tertiary">
            Use at least 8 characters with upper &amp; lower case letters, a number, and a symbol.
          </p>

          {codeRequired && (
            <div className="space-y-2">
              <RequiredLabel htmlFor="reset-password-code" required>Code</RequiredLabel>
              <Input
                id="reset-password-code"
                value={code}
                onChange={(e) => setCode(e.currentTarget.value)}
                autoComplete="one-time-code"
                disabled={busy}
                className="font-mono"
              />
              <p className="text-body text-tertiary">
                Your account is locked after too many failed sign-ins. Enter the code from your authenticator app, or
                one of your backup codes, to unlock it.
              </p>
            </div>
          )}

          <FormError message={error} />

          {linkExpired && (
            <p className="text-center text-body">
              <Link href="/forgot-password" className="text-accent-text underline-offset-4 hover:underline">Request a new link</Link>
            </p>
          )}

          <Button type="submit" disabled={busy} size="lg" className="w-full">
            {busy ? "Saving…" : "Set password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
