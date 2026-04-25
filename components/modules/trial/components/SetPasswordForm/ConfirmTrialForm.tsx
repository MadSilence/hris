"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/public/desact/src/components/ui/form";

import styles from "./ConfirmTrialForm.module.css";

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

function isStrongPassword(value: string) {
  if (!value) return false;
  if (value.length < 8) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  if (!/[^A-Za-z0-9]/.test(value)) return false;
  return true;
}

type ApiErrorProps = { message?: string };

function ApiErrorMessage({ message }: ApiErrorProps) {
  if (!message) return null;
  return (
    <p className={styles.apiError} role="alert">
      {message}
    </p>
  );
}

type HeaderProps = { className?: string };

function ConfirmHeader({ className }: HeaderProps) {
  return (
    <div className={className}>
      <h1 className={styles.title}>Set your password</h1>
      <p className={styles.subtitle}>Create a strong password for your SixSoftware account.</p>
    </div>
  );
}

type SuccessProps = { className?: string };

function ConfirmSuccessBlock({ className }: SuccessProps) {
  return (
    <div className={className}>
      <h1 className={styles.title}>Password set</h1>
      <p className={styles.subtitle}>
        Your password has been created. You can now sign in and continue setting up your company.
      </p>
      <p className={styles.hint}>
        Head over to the <a href="/login">login page</a> to get started.
      </p>
    </div>
  );
}

export default function ConfirmTrialForm({
  onSubmit,
  submitting,
  apiError,
  isSuccess,
}: SetPasswordFormProps) {
  const form = useForm<PasswordValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const busy = (submitting ?? false) || form.formState.isSubmitting;

  const submitHandler = useCallback(
    async (values: PasswordValues) => {
      await onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <div className={styles.centerWrap}>
      {!isSuccess ? (
        <div className={styles.form}>
          <ConfirmHeader className={styles.titleBlock}/>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-6" noValidate>
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: PasswordMessages.Required,
                  validate: (v) => {
                    if (!v) return PasswordMessages.Required;
                    if (v.length < 8) return PasswordMessages.TooShort;
                    if (!isStrongPassword(v)) return PasswordMessages.Weak;
                    return true;
                  },
                }}
                render={({ field }) => (
                  <FormItem className="gap-0 mb-4">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password*"
                        autoComplete="new-password"
                        disabled={busy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: PasswordMessages.ConfirmRequired,
                  validate: (v) => {
                    if (!v) return PasswordMessages.ConfirmRequired;
                    const password = form.getValues("password");
                    if (v !== password) return PasswordMessages.Mismatch;
                    return true;
                  },
                }}
                render={({ field }) => (
                  <FormItem className="gap-0 mb-4">
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password*"
                        autoComplete="new-password"
                        disabled={busy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <p className={styles.hint}>
                Use at least 8 characters with upper &amp; lower case letters, a number, and a
                symbol.
              </p>

              <ApiErrorMessage message={apiError}/>

              <Button type="submit" variant="default" disabled={busy} className="h-11 w-full">
                {busy ? "Saving…" : "Set password"}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <ConfirmSuccessBlock className={styles.successBlock}/>
      )}
    </div>
  );
}
