"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import AuthScreen from "@/components/modules/auth/components/AuthScreen";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { remindCompanyAddressesAction } from "@/components/modules/companyAddress/actions/companyAddressActions";

type Values = { email: string };

export const FIND_COMPANY_SENT_MESSAGE =
  "If that email can sign in to any company, we have sent it the addresses. Check your inbox.";

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Please enter your email.")
    .email("Enter a valid email address.")
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
            <h1 className="text-4xl font-medium">Check Your Email</h1>
            <p className="text-md text-muted-foreground" role="status">{FIND_COMPANY_SENT_MESSAGE}</p>
          </div>
          <Button asChild variant="outline" className="h-11 w-full bg-transparent">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen className="flex-1">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-medium">Find Your Company</h1>
          <p className="text-md text-muted-foreground">
            Enter the email address you sign in with, and we will email you the addresses of your companies.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="find-company-email">Email Address</Label>
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
              <p className="text-sm text-destructive" role="alert">{formik.errors.email}</p>
            )}
          </div>

          <FormError message={error} />

          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Sending…" : "Email Me My Addresses"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline-offset-4 hover:underline">Back to Sign In</Link>
          </p>
        </form>
      </div>
    </AuthScreen>
  );
}
