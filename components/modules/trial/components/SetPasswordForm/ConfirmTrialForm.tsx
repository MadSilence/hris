"use client";

import React, { FormEvent, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";

export type PasswordValues = {
  password: string;
  confirmPassword: string;
};

export interface SetPasswordFormProps {
  onSubmitAction: (values: PasswordValues) => void | Promise<void>;
  isLoading?: boolean;
  apiError?: string;
  isSuccess: boolean;
  /** Known once the company exists; the success screen sends the person there. */
  signInAddress?: SignInAddress;
}

/** The `auth` translator, for the schemas built outside a component. */
export type AuthTranslator = ReturnType<typeof useTranslations<"auth">>;

export function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}

/** The password rule every set-a-password screen uses — signup and invitation alike. */
export const buildPasswordSchema = (t: AuthTranslator) => yup.object({
  password: yup
    .string()
    .required(t("password.validation.required"))
    .min(8, t("password.validation.tooShort"))
    .test("strong-password", t("password.validation.weak"), (value) =>
      isStrongPassword(value ?? ""),
    )
    .nonNullable(),

  confirmPassword: yup
    .string()
    .required(t("password.validation.confirmRequired"))
    .oneOf([yup.ref("password")], t("password.validation.mismatch"))
    .nonNullable(),
});

function ConfirmHeader() {
  const t = useTranslations("auth");
  return (
    <div className="space-y-3 text-center">
      <h1 className="text-greeting">{t("trial.setPassword.title")}</h1>

      <p className="mx-auto max-w-xl text-body text-tertiary">
        {t("trial.setPassword.description")}
      </p>
    </div>
  );
}

/** Where the new company signs in: the link, and the address as a person reads it. */
export type SignInAddress = {
  href: string;
  label: string;
};

function ConfirmSuccessBlock({ signInAddress }: { signInAddress?: SignInAddress }) {
  const t = useTranslations("auth");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-greeting">{t("trial.setPassword.successTitle")}</h1>

      <p className="text-body text-tertiary">
        {t("trial.setPassword.successBody")}
      </p>

      {signInAddress ? (
        <p className="text-body text-tertiary">
          {t.rich("trial.setPassword.signsInAt", {
            address: signInAddress.label,
            b: (chunks) => <strong className="font-medium text-primary">{chunks}</strong>,
          })}
        </p>
      ) : null}

      <p className="text-body text-tertiary">
        {t.rich("trial.setPassword.goToLogin", {
          link: (chunks) => (
            <a href={signInAddress?.href ?? "/login"} className="text-accent-text underline-offset-4 hover:underline">
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  );
}

export default function ConfirmTrialForm({
  onSubmitAction,
  isLoading = false,
  apiError,
  isSuccess,
  signInAddress,
}: SetPasswordFormProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const passwordSchema = useMemo(() => buildPasswordSchema(t), [t]);
  const handleFormSubmission = useCallback(
    async (values: PasswordValues) => {
      await onSubmitAction(values);
    },
    [onSubmitAction],
  );

  const formik = useFormik<PasswordValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
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
    return <ConfirmSuccessBlock signInAddress={signInAddress}/>;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center py-12">
      <div className="w-full space-y-8">
        <ConfirmHeader/>

        <form method="post" onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="confirm-password" required>{t("login.passwordLabel")}</RequiredLabel>

            <Input
              id="confirm-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={(e) =>
                formik.setFieldValue("password", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.password}
            />

            <FieldError>{formik.errors.password}</FieldError>
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="confirm-password-repeat" required>{t("password.confirmLabel")}</RequiredLabel>

            <Input
              id="confirm-password-repeat"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={(e) =>
                formik.setFieldValue("confirmPassword", e.currentTarget.value)
              }
              disabled={busy}
              required
              aria-invalid={!!formik.errors.confirmPassword}
            />

            <FieldError>{formik.errors.confirmPassword}</FieldError>
          </div>

          <p className="text-body text-tertiary">
            {t("password.rule")}
          </p>

          <FormError message={apiError} />

          <Button size="lg" type="submit" disabled={busy} className="w-full">
            {busy ? tCommon("actions.saving") : t("password.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
