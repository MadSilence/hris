import * as yup from "yup";
import type { useTranslations } from "next-intl";

/**
 * The one rule for a new password on every screen (DECISIONS.md P-Q1, SIGN_IN_IMPLEMENTATION_DESIGN.md § 7.5): 12 to
 * 72 characters, no composition rule, one field with the eye and no "confirm". The backend's `PasswordPolicy` also
 * refuses a common or breached password and one made of the person's email or the company's name; that answer arrives
 * as AUTH00021 on the field.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

export type AuthTranslator = ReturnType<typeof useTranslations<"auth">>;

/** A new password: present, 12–72 characters. */
export const newPasswordSchema = (t: AuthTranslator) =>
  yup
    .string()
    .required(t("fields.newPasswordRequired"))
    .min(PASSWORD_MIN_LENGTH, t("fields.passwordTooShort"))
    .max(PASSWORD_MAX_LENGTH, t("fields.passwordTooShort"));
