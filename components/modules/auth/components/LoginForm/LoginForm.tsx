"use client";

import styles from "./LoginForm.module.css";
import { Card } from "@/components/ui/Card";
import * as yup from "yup";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCallback } from "react";
import { useFormik } from "formik";

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  submitting?: boolean;
  apiError?: string;
}

export default function LoginForm({ onSubmit, submitting, apiError }: LoginFormProps) {
  const handleFormSubmission = useCallback(
    (formValues: LoginFormValues) => {
      const values = {
        email: formValues.email,
        password: formValues.password,
      };

      return onSubmit(values);
    },
    [onSubmit],
  );

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginFormValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: handleFormSubmission,
  });

  const busy = submitting ?? formik.isSubmitting;

  return (
    <div className={styles.centerWrap}>
      <Card className={styles.card}>
        <div className={styles.form}>
          <h1 className={styles.title}>Welcome to SixSoftware</h1>

          <form onSubmit={formik.handleSubmit} className={styles.fields} noValidate>
            <Input
              name="email"
              type="email"
              placeholder="Email address*"
              required
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={busy}
            />

            <Input
              name="password"
              type="password"
              placeholder="Password*"
              required
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={busy}
            />

            {apiError && (
              <p className={styles.apiError} role="alert">
                {apiError}
              </p>
            )}

            <Button type="submit" variant="primary" fullWidth disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export enum LoginFormMessages {
  EmailRequired = "Please enter your email.",
  InvalidEmail = "Enter a valid email address.",
  PasswordRequired = "Please enter your password.",
  PasswordTooShort = "Password must be at least 8 characters.",
}

export const loginFormValidationSchema = yup.object({
  email: yup
    .string()
    .email(LoginFormMessages.InvalidEmail)
    .required(LoginFormMessages.EmailRequired),
  password: yup
    .string()
    .min(8, LoginFormMessages.PasswordTooShort)
    .required(LoginFormMessages.PasswordRequired),
});

export type LoginFormValues = {
  email: string;
  password: string;
};
