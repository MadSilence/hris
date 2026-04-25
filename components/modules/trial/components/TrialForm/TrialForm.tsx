"use client";

import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/public/desact/src/components/ui/form";

import { InputAddon, InputGroup } from "@/components/ui/InputGroup/InputGroup";
import styles from "./TrialForm.module.css";

export type TrialValues = {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  consent: boolean;
};

export interface TrialFormProps {
  onSubmit: (values: TrialValues) => void | Promise<void>;
  submitting?: boolean;
  apiError?: string;
  isSuccess: boolean;
}

function normalizeSubdomain(raw: string) {
  const lower = raw.toLowerCase();
  let s = lower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "-");
  s = s.replace(/-+/g, "-");
  s = s.replace(/^-+/, "").replace(/-+$/, "");
  return s;
}

function isValidSubdomain(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value);
}

type HeaderProps = { className?: string };

function TrialHeader({ className }: HeaderProps) {
  return (
    <div className={className}>
      <span className={styles.kicker}>Start your free trial</span>
      <h1 className={styles.title}>Get started for free</h1>
      <p className={styles.subtitle}>
        Try SixSoftware for 14 days for free. No credit card, setup or cancellation required.
      </p>
    </div>
  );
}

type SuccessBlockProps = { className?: string };

function TrialSuccessBlock({ className }: SuccessBlockProps) {
  return (
    <div className={className}>
      <h1 className={styles.title}>Check your inbox</h1>
      <p className={styles.subtitle}>
        We’ve sent a verification link to your email address. Please open the email and confirm your
        account before continuing.
      </p>
      <p className={styles.hint}>Didn’t receive it? Be sure to check your spam or promotions folder.</p>
    </div>
  );
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

type SubdomainInputProps = {
  value: string;
  disabled: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

function SubdomainInput({ value, disabled, onChange }: SubdomainInputProps) {
  return (
    <div className={styles.subdomainRow}>
      <InputGroup>
        <Input
          name="companyName"
          placeholder="Company Name*"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
          groupPosition="left"
          aria-describedby="subdomain-suffix"
        />
        <InputAddon>
          <span id="subdomain-suffix">.app.sixsoftware.com</span>
        </InputAddon>
      </InputGroup>
    </div>
  );
}

export enum TrialMessages {
  EmailRequired = "Please enter your business email.",
  InvalidEmail = "Enter a valid email address.",
  FirstRequired = "Please enter your first name.",
  LastRequired = "Please enter your last name.",
  CompanyRequired = "Please choose a subdomain.",
  SubdomainInvalid = "Use lowercase letters, numbers and hyphens only. No leading/trailing hyphen.",
  ConsentRequired = "Please accept the privacy terms to continue.",
}

export default function TrialForm({ onSubmit, submitting, apiError, isSuccess }: TrialFormProps) {
  const form = useForm<TrialValues>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      companyName: "",
      consent: false,
    },
    mode: "onSubmit",
  });

  const busy = (submitting ?? false) || form.formState.isSubmitting;

  const submitHandler = useCallback(
    async (values: TrialValues) => {
      await onSubmit(values);
    },
    [onSubmit]
  );

  const handleCompanyChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const normalized = normalizeSubdomain(e.target.value);
    form.setValue("companyName", normalized, { shouldValidate: false, shouldDirty: true });
  };

  const consentText = useMemo(
    () =>
      "By submitting this form I confirm that I have read the privacy policy and agree to the processing of my personal data by SixSoftware for the stated purposes. In case of consent, I can revoke my consent at any time. Furthermore, by sending the form I agree to the general terms and conditions.",
    []
  );

  return (
    <div className={styles.centerWrap}>
      {!isSuccess ? (
        <div className={styles.form}>
          <TrialHeader className={styles.titleBlock}/>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-8 px-8" noValidate>
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: TrialMessages.EmailRequired,
                  validate: (v) =>
                    /^\S+@\S+\.\S+$/.test(v || "") ? true : TrialMessages.InvalidEmail,
                }}
                render={({ field }) => (
                  <FormItem className="gap-0 mb-4">
                    <FormLabel>Business email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Business email*" disabled={busy} {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-0">
                <FormField
                  control={form.control}
                  name="firstName"
                  rules={{ required: TrialMessages.FirstRequired }}
                  render={({ field }) => (
                    <FormItem className="gap-0 mb-4">
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name*" disabled={busy} {...field} />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  rules={{ required: TrialMessages.LastRequired }}
                  render={({ field }) => (
                    <FormItem className="gap-0 mb-4">
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name*" disabled={busy} {...field} />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyName"
                rules={{
                  required: TrialMessages.CompanyRequired,
                  validate: (v) => (isValidSubdomain(v || "") ? true : TrialMessages.SubdomainInvalid),
                }}
                render={({ field }) => (
                  <FormItem className="gap-0 mb-4">
                    <FormLabel>Company name</FormLabel>
                    <FormControl>
                      <SubdomainInput
                        value={field.value ?? ""}
                        disabled={busy}
                        onChange={(e) => {
                          handleCompanyChange(e);
                          field.onChange(normalizeSubdomain(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <p className={styles.hint}>
                *For the best experience possible, we ask that you provide all of the required contact
                details above.
              </p>

              <FormField
                control={form.control}
                name="consent"
                rules={{
                  validate: (v) => (v ? true : TrialMessages.ConsentRequired),
                }}
                render={({ field }) => (
                  <FormItem className="gap-0 mb-4">
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={busy}
                          className="mt-1"
                        />
                      </FormControl>
                      <FormLabel className="text-sm leading-relaxed font-normal cursor-pointer">
                        {consentText}
                      </FormLabel>
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <ApiErrorMessage message={apiError}/>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  variant="default"
                  disabled={busy}
                  className="text-white"
                >
                  {busy ? "Starting your trial…" : "Start your free trial"}
                </Button>

                <p className={styles.loginBack}>
                  You already have an account? <a href="/login">Login here</a>
                </p>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <TrialSuccessBlock className={styles.successBlock}/>
      )}
    </div>
  );
}
