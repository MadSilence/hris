"use client";

import styles from "./TrialForm.module.css";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as yup from "yup";
import { useFormik } from "formik";
import React, { useCallback } from "react";
import { InputAddon, InputGroup } from "@/components/ui/InputGroup/InputGroup";

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

export default function TrialForm({onSubmit, submitting, apiError, isSuccess}: TrialFormProps) {
  const handleFormSubmission = useCallback(
    (values: TrialValues) => onSubmit(values),
    [onSubmit]
  );

  const formik = useFormik<TrialValues>({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      companyName: "",
      consent: false,
    },
    validationSchema: trialValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const busy = submitting ?? formik.isSubmitting;

  const handleCompanyChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const normalized = normalizeSubdomain(e.target.value);
    formik.setFieldValue("companyName", normalized, false);
  };

  return (
    <div className={styles.centerWrap}>
      <Card className={styles.card}>
        {!isSuccess && <div className={styles.form}>
          <div className={styles.titleBlock}>
            <span className={styles.kicker}>Start your free trial</span>
            <h1 className={styles.title}>Get started for free</h1>
            <p className={styles.subtitle}>
              Try SixSoftware for 14 days for free. No credit card, setup or cancellation required.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className={styles.fields} noValidate>
            <Input
              name="email"
              type="email"
              placeholder="Business email*"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              disabled={busy}
              required
            />

            <div className={styles.row2}>
              <Input
                name="firstName"
                placeholder="First name*"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.firstName}
                disabled={busy}
                required
              />
              <Input
                name="lastName"
                placeholder="Last name*"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.lastName}
                disabled={busy}
                required
              />
            </div>

            <div className={styles.subdomainRow}>
              <InputGroup>
                <Input
                  name="companyName"
                  placeholder="Company Name*"
                  value={formik.values.companyName}
                  onChange={handleCompanyChange}
                  onBlur={formik.handleBlur}
                  disabled={busy}
                  required
                  error={formik.errors.companyName}
                  groupPosition="left"
                  aria-describedby="subdomain-suffix"
                />
                <InputAddon>
                  <span id="subdomain-suffix">.app.sixsoftware.com</span>
                </InputAddon>
              </InputGroup>
            </div>

            <p className={styles.hint}>
              *For the best experience possible, we ask that you provide all of the required contact details above.
            </p>

            <label className={styles.legal}>
              <input
                type="checkbox"
                name="consent"
                checked={formik.values.consent}
                onChange={formik.handleChange}
                disabled={busy}
                style={{marginRight: 8}}
              />
              By submitting this form I confirm that I have read the privacy policy and agree to the
              processing of my personal data by SixSoftware for the stated purposes. In case of consent,
              I can revoke my consent at any time. Furthermore, by sending the form I agree to the
              general terms and conditions.
            </label>

            {apiError && (
              <p className={styles.apiError} role="alert">
                {apiError}
              </p>
            )}

            <Button type="submit" variant="primary" fullWidth disabled={busy}>
              {busy ? "Starting your trial…" : "Start your free trial"}
            </Button>

            <p className={styles.loginBack}>
              You already have an account? <a href="/app/login">Login here</a>
            </p>
          </form>
        </div>}
        {isSuccess &&
          <div className={styles.successBlock}>
            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.subtitle}>
              We’ve sent a verification link to your email address.
              Please open the email and confirm your account before continuing.
            </p>
            <p className={styles.hint}>
              Didn’t receive it? Be sure to check your spam or promotions folder.
            </p>
          </div>
        }
      </Card>
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

export const trialValidationSchema = yup.object({
  email: yup.string().email(TrialMessages.InvalidEmail).required(TrialMessages.EmailRequired),
  firstName: yup.string().required(TrialMessages.FirstRequired),
  lastName: yup.string().required(TrialMessages.LastRequired),
  companyName: yup
    .string()
    .matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, TrialMessages.SubdomainInvalid)
    .required(TrialMessages.CompanyRequired),
  consent: yup.boolean().oneOf([true], TrialMessages.ConsentRequired),
});
