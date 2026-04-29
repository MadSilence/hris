"use client";

import { FormEvent, useCallback, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Label } from "@/public/desact/src/components/ui/label";

import { InputAddon, InputGroup, } from "@/components/ui/InputGroup/InputGroup";

export type TrialValues = {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  consent: boolean;
};

export interface TrialFormProps {
  onSubmitAction: (values: TrialValues) => void | Promise<void>;
  isLoading?: boolean;
  apiError?: string;
  isSuccess: boolean;
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

function normalizeSubdomain(raw: string) {
  const lower = raw.toLowerCase();

  return lower
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function isValidSubdomain(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value);
}

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required(TrialMessages.EmailRequired)
    .email(TrialMessages.InvalidEmail)
    .nonNullable(),

  firstName: yup
    .string()
    .trim()
    .required(TrialMessages.FirstRequired)
    .nonNullable(),

  lastName: yup
    .string()
    .trim()
    .required(TrialMessages.LastRequired)
    .nonNullable(),

  companyName: yup
    .string()
    .trim()
    .required(TrialMessages.CompanyRequired)
    .test(
      "valid-subdomain",
      TrialMessages.SubdomainInvalid,
      (value) => !!value && isValidSubdomain(value),
    )
    .nonNullable(),

  consent: yup
    .boolean()
    .oneOf([true], TrialMessages.ConsentRequired)
    .required(TrialMessages.ConsentRequired),
});

function sanitize(values: TrialValues): TrialValues {
  return {
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    companyName: normalizeSubdomain(values.companyName),
    consent: values.consent,
  };
}

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

type ApiErrorProps = {
  message?: string;
};

function ApiErrorMessage({ message }: ApiErrorProps) {
  if (!message) return null;

  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </p>
  );
}

function TrialHeader() {
  return (
    <div className="space-y-3 text-center">

      <h1 className="text-4xl font-medium">Get started for free</h1>

      <p className="mx-auto max-w-xl text-md text-[var(--color-text-tertiary)]">
        Try SixSoftware for 14 days for free. No credit card, setup or
        cancellation required.
      </p>
    </div>
  );
}

function TrialSuccessBlock() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-medium">Check your inbox</h1>

      <p className="text-md text-[var(--color-text-tertiary)]">
        We’ve sent a verification link to your email address. Please open the
        email and confirm your account before continuing.
      </p>

      <p className="text-sm text-[var(--color-text-tertiary)]">
        Didn’t receive it? Be sure to check your spam or promotions folder.
      </p>
    </div>
  );
}

export default function TrialForm({
  onSubmitAction,
  isLoading = false,
  apiError,
  isSuccess,
}: TrialFormProps) {
  const consentText = useMemo(
    () =>
      "By submitting this form I confirm that I have read the privacy policy and agree to the processing of my personal data by SixSoftware for the stated purposes. In case of consent, I can revoke my consent at any time. Furthermore, by sending the form I agree to the general terms and conditions.",
    [],
  );

  const handleFormSubmission = useCallback(
    async (values: TrialValues) => {
      await onSubmitAction(sanitize(values));
    },
    [onSubmitAction],
  );

  const formik = useFormik<TrialValues>({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      companyName: "",
      consent: false,
    },
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const busy = isLoading || formik.isSubmitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (busy) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  if (isSuccess) {
    return <TrialSuccessBlock/>;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center py-12">
      <div className="w-full space-y-8">
        <TrialHeader/>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="trial-email">Business email</Label>

            <Input
              id="trial-email"
              name="email"
              type="email"
              placeholder="Business email*"
              value={formik.values.email}
              onChange={(e) =>
                formik.setFieldValue("email", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.email}
            />

            <FieldError message={formik.errors.email}/>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trial-first-name">First name</Label>

              <Input
                id="trial-first-name"
                name="firstName"
                placeholder="First name*"
                value={formik.values.firstName}
                onChange={(e) =>
                  formik.setFieldValue("firstName", e.currentTarget.value)
                }
                disabled={busy}
                required
                aria-invalid={!!formik.errors.firstName}
              />

              <FieldError message={formik.errors.firstName}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial-last-name">Last name</Label>

              <Input
                id="trial-last-name"
                name="lastName"
                placeholder="Last name*"
                value={formik.values.lastName}
                onChange={(e) =>
                  formik.setFieldValue("lastName", e.currentTarget.value)
                }
                disabled={busy}
                required
                aria-invalid={!!formik.errors.lastName}
              />

              <FieldError message={formik.errors.lastName}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trial-company-name">Company name</Label>

            <InputGroup>
              <Input
                id="trial-company-name"
                name="companyName"
                placeholder="Company name*"
                value={formik.values.companyName}
                onChange={(e) =>
                  formik.setFieldValue(
                    "companyName",
                    normalizeSubdomain(e.currentTarget.value),
                  )
                }
                disabled={busy}
                required
                aria-invalid={!!formik.errors.companyName}
                aria-describedby="subdomain-suffix"
              />

              <InputAddon>
                <span id="subdomain-suffix">.app.sixsoftware.com</span>
              </InputAddon>
            </InputGroup>

            <FieldError message={formik.errors.companyName}/>
          </div>

          <p className="text-sm text-[var(--color-text-tertiary)]">
            *For the best experience possible, we ask that you provide all of
            the required contact details above.
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="trial-consent"
                checked={formik.values.consent}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("consent", !!checked)
                }
                disabled={busy}
                className="mt-1"
              />

              <Label
                htmlFor="trial-consent"
                className="cursor-pointer text-sm font-normal leading-relaxed text-[var(--color-text-tertiary)]"
              >
                {consentText}
              </Label>
            </div>

            <FieldError message={formik.errors.consent}/>
          </div>

          <ApiErrorMessage message={apiError}/>

          <div className="flex flex-col gap-4">
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Starting your trial…" : "Start your free trial"}
            </Button>

            <p className="text-center text-sm text-[var(--color-text-tertiary)]">
              You already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
