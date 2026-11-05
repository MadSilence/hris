"use client";

import { FormEvent, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Label } from "@/components/desact/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { normalizeCompanyAddress } from "@/lib/companyAddress";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";

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
  /**
   * The company address as a person reads it, for an address already normalised from the name. Shown
   * while the name is typed, so the address is not a surprise in the confirmation email. The backend has
   * the last word: a race with another registration can still suffix it.
   */
  companyAddressPreview?: (subdomain: string) => string;
}

type AuthTranslator = ReturnType<typeof useTranslations<"auth">>;

const buildSchema = (t: AuthTranslator) => yup.object({
  email: yup
    .string()
    .trim()
    .required(t("trial.validation.emailRequired"))
    .email(t("login.validation.emailInvalid"))
    .nonNullable(),

  firstName: yup
    .string()
    .trim()
    .required(t("trial.validation.firstNameRequired"))
    .nonNullable(),

  lastName: yup
    .string()
    .trim()
    .required(t("trial.validation.lastNameRequired"))
    .nonNullable(),

  companyName: yup
    .string()
    .trim()
    .required(t("trial.validation.companyRequired"))
    .test(
      "valid-company-name",
      t("trial.validation.companyInvalid"),
      (value) => !!value && isValidCompanyName(value),
    )
    .nonNullable(),

  consent: yup
    .boolean()
    .oneOf([true], t("trial.validation.consentRequired"))
    .required(t("trial.validation.consentRequired")),
});

function isValidCompanyName(value: string) {
  return /^[a-zA-Z0-9\s-]+$/.test(value);
}

function sanitize(values: TrialValues): TrialValues {
  return {
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    companyName: values.companyName.trim(),
    consent: values.consent,
  };
}

function TrialHeader() {
  const t = useTranslations("auth");
  return (
    <div className="space-y-3 text-center">

      <h1 className="text-greeting">{t("trial.start.title")}</h1>

      <p className="mx-auto max-w-xl text-body text-tertiary">
        {t("trial.start.description")}
      </p>
    </div>
  );
}

function TrialSuccessBlock() {
  const t = useTranslations("auth");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-greeting">{t("trial.start.successTitle")}</h1>

      <p className="text-body text-tertiary">
        {t("trial.start.successBody")}
      </p>

      <p className="text-body text-tertiary">
        {t("trial.start.successHint")}
      </p>
    </div>
  );
}

export default function TrialForm({
  onSubmitAction,
  isLoading = false,
  apiError,
  isSuccess,
  companyAddressPreview,
}: TrialFormProps) {
  const t = useTranslations("auth");
  const schema = useMemo(() => buildSchema(t), [t]);
  const consentText = t("trial.start.consent");

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
            <RequiredLabel htmlFor="trial-email" required>{t("trial.start.businessEmail")}</RequiredLabel>

            <Input
              id="trial-email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={(e) =>
                formik.setFieldValue("email", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.email}
            />

            <FieldError>{formik.errors.email}</FieldError>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <RequiredLabel htmlFor="trial-first-name" required>{t("trial.start.firstName")}</RequiredLabel>

              <Input
                id="trial-first-name"
                name="firstName"
                value={formik.values.firstName}
                onChange={(e) =>
                  formik.setFieldValue("firstName", e.currentTarget.value)
                }
                disabled={busy}
                required
                aria-invalid={!!formik.errors.firstName}
              />

              <FieldError>{formik.errors.firstName}</FieldError>
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="trial-last-name" required>{t("trial.start.lastName")}</RequiredLabel>

              <Input
                id="trial-last-name"
                name="lastName"
                value={formik.values.lastName}
                onChange={(e) =>
                  formik.setFieldValue("lastName", e.currentTarget.value)
                }
                disabled={busy}
                required
                aria-invalid={!!formik.errors.lastName}
              />

              <FieldError>{formik.errors.lastName}</FieldError>
            </div>
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="trial-company-name" required>{t("trial.start.companyName")}</RequiredLabel>

            <Input
              id="trial-company-name"
              name="companyName"
              value={formik.values.companyName}
              onChange={(e) =>
                formik.setFieldValue("companyName", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.companyName}
            />

            {companyAddressPreview && normalizeCompanyAddress(formik.values.companyName) ? (
              <p className="text-body text-tertiary" aria-live="polite">
                {t.rich("trial.start.addressPreview", {
                  address: companyAddressPreview(normalizeCompanyAddress(formik.values.companyName)),
                  b: (chunks) => <span className="font-medium text-primary">{chunks}</span>,
                })}
              </p>
            ) : null}

            <FieldError>{formik.errors.companyName}</FieldError>
          </div>

          <p className="text-body text-tertiary">
            {t("trial.start.requiredNote")}
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
                className="cursor-pointer text-body font-normal leading-relaxed text-tertiary"
              >
                {consentText}
              </Label>
            </div>

            <FieldError>{formik.errors.consent}</FieldError>
          </div>

          <FormError message={apiError} />

          <div className="flex flex-col gap-4">
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? t("trial.start.submitting") : t("trial.start.submit")}
            </Button>

            <p className="text-center text-body text-tertiary">
              {t.rich("trial.start.haveAccount", {
                link: (chunks) => (
                  <a href="/login" className="text-accent-text underline-offset-4 hover:underline">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
