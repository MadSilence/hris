"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

/**
 * One password field with the eye, and no "Confirm" beside it: the eye is how a person checks what they typed
 * (sign-in-password F3, sign-in-invitation G1, sign-in-registration B2a, the company's login). `aside` sits on the
 * label's row — "Forgot password?" on the login.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  aside,
  autoComplete = "current-password",
  autoFocus = false,
  disabled = false,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  aside?: React.ReactNode;
  autoComplete?: "current-password" | "new-password";
  autoFocus?: boolean;
  disabled?: boolean;
  /** The grey asterisk of every required field (FORMS_AND_FIELDS § 1) — B2a's password is one. */
  required?: boolean;
}) {
  const t = useTranslations("auth");
  const [shown, setShown] = React.useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <RequiredLabel htmlFor={id} required={required}>{label}</RequiredLabel>
        {aside}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="h-11 pr-11"
          autoFocus={autoFocus}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? t("fields.hidePassword") : t("fields.showPassword")}
          aria-pressed={shown}
          className="absolute inset-y-0 right-1 my-auto flex size-9 items-center justify-center rounded-control text-tertiary hover:text-primary"
        >
          <Icon icon={shown ? ViewOffIcon : ViewIcon} size="md" />
        </button>
      </div>
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        hint && <p id={`${id}-hint`} className="text-hint text-tertiary">{hint}</p>
      )}
    </div>
  );
}
