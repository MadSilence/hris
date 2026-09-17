"use client";

import React, { FormEvent, useState } from "react";
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
import { acceptInviteAction } from "@/components/modules/invitation/actions/acceptInviteAction";

type Props = {
  token: string;
  firstName: string | null;
  email: string | null;
  companyName: string | null;
};

/**
 * The invited person's screen: set a password, then sign in.
 *
 * The link is looked up on the server before this renders (without using it), so an expired or used
 * link never reaches a form it cannot submit. The password rule is the signup one, imported rather
 * than copied.
 */
export function InviteAcceptContainer({ token, firstName, email, companyName }: Props) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<PasswordValues>({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      setError(null);
      const res = await acceptInviteAction({ token, password: values.password });
      if (res.status === ActionStatus.SUCCESS) setDone(true);
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

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-medium">You Are In</h1>
        <p className="text-md text-muted-foreground">
          Your password is set. Sign in with {email ?? "your email address"} to continue.
        </p>
        <Button asChild>
          <a href="/login">Go to Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center py-12">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-medium">{firstName ? `Welcome, ${firstName}` : "Welcome"}</h1>
          <p className="mx-auto max-w-xl text-md text-muted-foreground">
            {companyName ? `You have been invited to join ${companyName}. ` : "You have been invited. "}
            Set a password to sign in{email ? ` as ${email}` : ""}.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="invite-password" required>Password</RequiredLabel>
            <Input
              id="invite-password"
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
            <RequiredLabel htmlFor="invite-password-repeat" required>Confirm Password</RequiredLabel>
            <Input
              id="invite-password-repeat"
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

          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Saving…" : "Set Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
