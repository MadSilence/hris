"use client";

import styles from "./ConfirmTrialForm.module.css";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as yup from "yup";
import { useFormik } from "formik";
import React, { useCallback } from "react";

export type PasswordValues = {
  password: string;
  confirmPassword: string;
};

export interface SetPasswordFormProps {
  onSubmit: (values: PasswordValues) => void | Promise<void>;
  submitting?: boolean;
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

const passwordValidationSchema = yup.object({
  password: yup
    .string()
    .required(PasswordMessages.Required)
    .min(8, PasswordMessages.TooShort)
    .matches(/[a-z]/, PasswordMessages.Weak)
    .matches(/[A-Z]/, PasswordMessages.Weak)
    .matches(/[0-9]/, PasswordMessages.Weak)
    .matches(/[^A-Za-z0-9]/, PasswordMessages.Weak),
  confirmPassword: yup
    .string()
    .required(PasswordMessages.ConfirmRequired)
    .oneOf([yup.ref("password")], PasswordMessages.Mismatch),
});

export default function ConfirmTrialForm({
                                          onSubmit,
                                          submitting,
                                          apiError,
                                          isSuccess,
                                        }: SetPasswordFormProps) {
  const handleFormSubmission = useCallback(
    (values: PasswordValues) => onSubmit(values),
    [onSubmit]
  );

  const formik = useFormik<PasswordValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: passwordValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const busy = submitting ?? formik.isSubmitting;

  return (
    <div className={styles.centerWrap}>
      <Card className={styles.card}>
        {!isSuccess && (
          <div className={styles.form}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>Set your password</h1>
              <p className={styles.subtitle}>
                Create a strong password for your SixSoftware account.
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className={styles.fields} noValidate>
              <Input
                name="password"
                type="password"
                placeholder="Password*"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.password}
                disabled={busy}
                required
                autoComplete="new-password"
              />

              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password*"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.confirmPassword}
                disabled={busy}
                required
                autoComplete="new-password"
              />

              <p className={styles.hint}>
                Use at least 8 characters with upper &amp; lower case letters, a number, and a symbol.
              </p>

              {apiError && (
                <p className={styles.apiError} role="alert">
                  {apiError}
                </p>
              )}

              <Button type="submit" variant="primary" fullWidth disabled={busy}>
                {busy ? "Saving…" : "Set password"}
              </Button>
            </form>
          </div>
        )}

        {isSuccess && (
          <div className={styles.successBlock}>
            <h1 className={styles.title}>Password set</h1>
            <p className={styles.subtitle}>
              Your password has been created. You can now sign in and continue setting up your company.
            </p>
            <p className={styles.hint}>
              Head over to the <a href="/login">login page</a> to get started.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
