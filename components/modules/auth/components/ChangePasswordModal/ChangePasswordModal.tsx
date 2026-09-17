"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { clearPermissionsStorage } from "@/components/auth/permissionsStorage";
import {
  passwordSchema,
  type PasswordValues,
} from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";
import { changePasswordAction } from "@/components/modules/auth/actions/changePasswordAction";
import { useLogoutAction } from "@/components/modules/auth/hooks/useLogoutAction";

export type ChangePasswordValues = PasswordValues & { currentPassword: string };

const EMPTY: ChangePasswordValues = { currentPassword: "", password: "", confirmPassword: "" };

/** The refusal for a wrong current password; the backend binds it to `currentPassword`. */
const CURRENT_PASSWORD_WRONG = "AUTH00004";

/** The new password follows the signup rule; the current one only has to be there. */
export const changePasswordSchema = passwordSchema.shape({
  currentPassword: yup.string().required("Please enter your current password.").nonNullable(),
});

/** Wrapped so tests can observe the redirect: jsdom's location is read-only. */
export const passwordChangeNavigation = {
  toLogin() {
    window.location.assign("/login?passwordChanged=1");
  },
};

type Props = {
  open: boolean;
  onCloseAction: () => void;
};

/**
 * The signed-in person changes their own password.
 *
 * **Success signs them out.** The backend ends every session of the person when the password
 * changes, this one included — so rather than leave them on a page whose next request will 401, the
 * browser's cookies are cleared and they land on the sign-in screen with a line saying why. A full
 * navigation, not a router push, for the same reason signing in uses one: identity changed.
 */
export function ChangePasswordModal({ open, onCloseAction }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const logout = useLogoutAction();

  const formik = useFormik<ChangePasswordValues>({
    initialValues: EMPTY,
    validationSchema: changePasswordSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      setError(null);
      const res = await changePasswordAction({
        currentPassword: values.currentPassword,
        newPassword: values.password,
      });

      if (res.status !== ActionStatus.SUCCESS) {
        const onCurrent = res.fieldErrors?.currentPassword
          ?? (res.code === CURRENT_PASSWORD_WRONG ? res.errorMessage : undefined);
        if (onCurrent) helpers.setFieldError("currentPassword", onCurrent);
        else setError(res.errorMessage ?? null);
        return;
      }

      // The session is already dead on the backend; what is left is this browser's cookies. Leave
      // for the sign-in screen even if clearing them fails — staying here would only 401.
      try {
        await logout.mutateAsync();
      } catch {
        // nothing useful to add: the next sign-in replaces the cookies anyway
      } finally {
        clearPermissionsStorage();
        passwordChangeNavigation.toLogin();
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: EMPTY });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const busy = formik.isSubmitting;

  const requestClose = () => {
    if (busy) return;
    if (formik.dirty) {
      setIsDiscardOpen(true);
      return;
    }
    onCloseAction();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), true);
    if (Object.keys(errors).length > 0) return;
    await formik.submitForm();
  };

  const field = (
    name: keyof ChangePasswordValues,
    id: string,
    label: string,
    autoComplete: string,
  ) => (
    <div className="space-y-1.5">
      <RequiredLabel htmlFor={id} required>{label}</RequiredLabel>
      <Input
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        value={formik.values[name]}
        onChange={(e) => formik.setFieldValue(name, e.currentTarget.value)}
        disabled={busy}
        aria-invalid={Boolean(formik.errors[name])}
      />
      {formik.errors[name] && (
        <p role="alert" className="text-xs text-destructive">{formik.errors[name]}</p>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) requestClose(); }}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                You will be signed out everywhere, here included, and sign in again with the new password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {field("currentPassword", "change-password-current", "Current Password", "current-password")}
              {field("password", "change-password-new", "New Password", "new-password")}
              {field("confirmPassword", "change-password-confirm", "Confirm Password", "new-password")}

              <p className="text-xs text-muted-foreground">
                Use at least 8 characters with upper &amp; lower case letters, a number, and a symbol.
              </p>

              <FormError message={error} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Changing…" : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={isDiscardOpen}
        onCancelAction={() => setIsDiscardOpen(false)}
        onConfirmAction={() => {
          setIsDiscardOpen(false);
          onCloseAction();
        }}
      />
    </>
  );
}
