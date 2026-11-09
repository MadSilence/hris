"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  buildPasswordSchema,
  type PasswordValues,
} from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";
import { acceptInviteAction } from "@/components/modules/invitation/actions/acceptInviteAction";
import { FieldError } from "@/components/desact/field-error";

type Props = {
  token: string;
  firstName: string | null;
  email: string | null;
  companyName: string | null;
};

/**
 * The invited person's screen: set a password, then sign in.
 *
 * The link is looked up on the server before this renders (without using it), so an expired or used
 * link never reaches a form it cannot submit. The password rule is the signup one, imported rather
 * than copied.
 */
export function InviteAcceptContainer({ token, firstName, email, companyName }: Props) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const passwordSchema = useMemo(() => buildPasswordSchema(t), [t]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<PasswordValues>({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      setError(null);
      const res = await acceptInviteAction({ token, password: values.password });
      if (res.status === ActionStatus.SUCCESS) setDone(true);
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

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-page-title">{t("invitation.done.title")}</h1>
        <p className="text-body text-tertiary">
          {email ? t("invitation.done.bodyWithEmail", { email }) : t("invitation.done.body")}
        </p>
        <Button asChild>
          <a href="/login">{t("invitation.done.goToSignIn")}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-page-title">{firstName ? t("invitation.welcomeName", { name: firstName }) : t("invitation.welcome")}</h1>
          <p className="text-body text-secondary">
            {t("invitation.intro", {
              hasCompany: companyName ? "yes" : "no",
              company: companyName ?? "",
              hasEmail: email ? "yes" : "no",
              email: email ?? "",
            })}
          </p>
        </div>

        <form method="post" onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="invite-password" required>{t("login.passwordLabel")}</RequiredLabel>
            <Input
              id="invite-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={(e) => formik.setFieldValue("password", e.currentTarget.value)}
              disabled={busy}
              aria-invalid={Boolean(formik.errors.password)}
            />
            {formik.errors.password && (
              <FieldError>{formik.errors.password}</FieldError>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="invite-password-repeat" required>{t("password.confirmLabel")}</RequiredLabel>
            <Input
              id="invite-password-repeat"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={(e) => formik.setFieldValue("confirmPassword", e.currentTarget.value)}
              disabled={busy}
              aria-invalid={Boolean(formik.errors.confirmPassword)}
            />
            {formik.errors.confirmPassword && (
              <FieldError>{formik.errors.confirmPassword}</FieldError>
            )}
          </div>

          <p className="text-body text-tertiary">
            {t("password.rule")}
          </p>

          <FormError message={error} />

          <Button type="submit" disabled={busy} loading={busy} loadingLabel={tCommon("actions.saving")} size="lg" className="w-full">
            {t("password.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
