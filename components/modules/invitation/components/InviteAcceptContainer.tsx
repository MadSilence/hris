"use client";

import React, { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { FormError } from "@/components/feedback/FormError";
import { ApiError } from "@/components/clients/exceptions";
import { AuthOr, AuthSplit, ProviderButton, type AuthBrand } from "@/components/modules/auth/layout";
import { PasswordField } from "@/components/modules/auth/components/PasswordField";
import { PASSWORD_MIN_LENGTH } from "@/components/modules/auth/password/passwordRules";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { messageForError } from "@/lib/errors/errorMessages";

/*
 * Joining a company from an invitation (sign-in-invitation G1–G4). The pane says "Welcome to Acme, Anna."; the white
 * side "Join your team", the address the invitation is for, Google and Microsoft first when the company allows them,
 * then a password. Under required company SSO there is no password: one accent button through the company's provider
 * (G4). Joining opens the session — or the second step when the company requires one — and the welcome follows.
 */

export type SharedProvider = "GOOGLE" | "MICROSOFT";
const PROVIDER_LABEL: Record<SharedProvider, string> = { GOOGLE: "Google", MICROSOFT: "Microsoft" };

type Props = {
  brand: Extract<AuthBrand, { kind: "company" }>;
  token: string;
  firstName: string | null;
  email: string | null;
  /** The company's provider when its SSO is required and this person keeps no password (G4). */
  ssoProvider: string | null;
  providers: SharedProvider[];
  /** A provider sent the person back refused (G2) or with an account somebody else here uses (I9). */
  failure?: { provider: SharedProvider; usedElsewhere: boolean } | null;
};

const PASSWORD_TOO_COMMON = "AUTH00021";

export function InviteAcceptContainer({ brand, token, firstName, email, ssoProvider, providers, failure = null }: Props) {
  const t = useTranslations("auth");
  const auth = useAuthService();
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const company = brand.name;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    if (!password) return setFieldError(t("fields.newPasswordRequired"));
    if (password.length < PASSWORD_MIN_LENGTH) return setFieldError(t("fields.passwordTooShort"));
    setBusy(true);
    setError(null);
    try {
      const res = await auth.acceptInvite(token, password);
      // A full navigation: the layout that reads the session cookie must render again from the server.
      window.location.assign(res.next);
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.code === PASSWORD_TOO_COMMON) setFieldError(messageForError(err));
      else setError(messageForError(err));
    }
  };

  const phoneHeading = firstName
    ? t.rich("invite.phoneWelcome", { company, name: firstName, em: (c) => <em className="not-italic text-accent-text">{c}</em> })
    : t("invite.phoneWelcomeNoName", { company });
  const lead = t.rich("invite.lead", { email: email ?? "", b: (c) => <b className="font-medium text-primary [overflow-wrap:anywhere]">{c}</b> });

  return (
    <AuthSplit brand={brand} welcome={{ name: firstName }} long={providers.length > 0}>
      <div className="auth-step-head">
        <h1 className="text-auth-title text-primary">
          <span className="hidden md:inline">{t("invite.title")}</span>
          <span className="md:hidden">{phoneHeading}</span>
        </h1>
        <p className="text-auth-lead text-secondary">
          {lead}
          {ssoProvider && <> {t("invite.requiredLead", { company, provider: ssoProvider })}</>}
        </p>
      </div>

      {failure && (
        <InlineAlert tone="declined">
          {failure.usedElsewhere
            ? t("invite.usedElsewhere", { provider: PROVIDER_LABEL[failure.provider], company })
            : t("invite.providerFailed", { provider: PROVIDER_LABEL[failure.provider] })}
        </InlineAlert>
      )}

      {ssoProvider ? (
        <a href="/api/auth/sso/start?next=%2Fwelcome" className={buttonVariants({ size: "lg", className: "w-full" })}>
          {t("invite.joinWith", { provider: ssoProvider })}
        </a>
      ) : (
        <>
          {providers.length > 0 && (
            <>
              <div className="flex flex-col gap-3">
                {providers.map((p) => (
                  <ProviderButton
                    key={p}
                    provider={p}
                    href={`/api/auth/provider/start?purpose=INVITE&provider=${p}&invite=${encodeURIComponent(token)}`}
                    label={t("company.continueWith", { provider: PROVIDER_LABEL[p] })}
                  />
                ))}
              </div>
              <AuthOr />
            </>
          )}
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <PasswordField
              id="invite-password"
              label={t("fields.createPassword")}
              value={password}
              onChange={(v) => { setPassword(v); setFieldError(null); }}
              error={fieldError}
              hint={t("fields.passwordHint")}
              autoComplete="new-password"
              autoFocus
            />
            <FormError message={error} />
            <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("invite.joining")}>
              {t("invite.join", { company })}
            </Button>
          </form>
        </>
      )}
    </AuthSplit>
  );
}
