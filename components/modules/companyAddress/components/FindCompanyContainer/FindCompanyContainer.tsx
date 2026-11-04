"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import AuthScreen from "@/components/modules/auth/components/AuthScreen";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { remindCompanyAddressesAction } from "@/components/modules/companyAddress/actions/companyAddressActions";
import { FieldError } from "@/components/desact/field-error";

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
            <h1 className="text-greeting">Check your email</h1>
            <p className="text-body text-tertiary" role="status">{FIND_COMPANY_SENT_MESSAGE}</p>
          </div>
          <Button size="lg" asChild variant="secondary" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen className="flex-1">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-greeting">Find your company</h1>
          <p className="text-body text-tertiary">
            Enter the email address you sign in with, and we will email you the addresses of your companies.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="find-company-email">Email address</Label>
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
              <FieldError>{formik.errors.email}</FieldError>
            )}
          </div>

          <FormError message={error} />

          <Button size="lg" type="submit" disabled={busy} className="w-full">
            {busy ? "Sending…" : "Email me my addresses"}
          </Button>

          <p className="text-center text-body text-tertiary">
            <Link href="/login" className="text-accent-text underline-offset-4 hover:underline">Back to sign in</Link>
          </p>
        </form>
      </div>
    </AuthScreen>
  );
}
