"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/public/desact/src/components/ui/form";

import styles from "./LoginForm.module.css";

export type LoginFormValues = {
  email: string;
  password: string;
};

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  submitting?: boolean;
  apiError?: string;
}

export enum LoginFormMessages {
  EmailRequired = "Please enter your email.",
  InvalidEmail = "Enter a valid email address.",
  PasswordRequired = "Please enter your password.",
  PasswordTooShort = "Password must be at least 8 characters.",
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

export default function LoginForm({ onSubmit, submitting, apiError }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const busy = (submitting ?? false) || form.formState.isSubmitting;

  const submitHandler = useCallback(
    async (values: LoginFormValues) => {
      await onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <div className={styles.centerWrap}>
      <div className={styles.form}>
        <h1 className={styles.title}>Welcome to SixSoftware</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-6" noValidate>
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: LoginFormMessages.EmailRequired,
                validate: (v) =>
                  /^\S+@\S+\.\S+$/.test(v || "") ? true : LoginFormMessages.InvalidEmail,
              }}
              render={({ field }) => (
                <FormItem className="gap-0 mb-4">
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address*"
                      autoComplete="email"
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
              name="password"
              rules={{
                required: LoginFormMessages.PasswordRequired,
                minLength: { value: 8, message: LoginFormMessages.PasswordTooShort },
              }}
              render={({ field }) => (
                <FormItem className="gap-0 mb-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password*"
                      autoComplete="current-password"
                      disabled={busy}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <ApiErrorMessage message={apiError}/>

            <Button type="submit" variant="default" disabled={busy} className="h-11 w-full text-white">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
