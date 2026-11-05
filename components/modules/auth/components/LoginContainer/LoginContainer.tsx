"use client";

import * as React from "react";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import LoginForm, { LoginFormValues } from "@/components/modules/auth/components/LoginForm/LoginForm";
import { MfaSignInStep } from "@/components/modules/auth/components/MfaSignInStep";
import { messageForError } from "@/lib/errors/errorMessages";
import { APP_HOME } from "@/lib/companyAddress";
import type { PublicSso } from "@/api/modules/sso/ssoService";
import { Button } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { useTranslations } from "next-intl";

type LoginContainerProps = {
  /** Set when the person arrives here straight after changing their password, which signed them out. */
  passwordChanged?: boolean;
  headline?: string;
  subheadline?: string;
  changeCompanyHref?: string;
  /** Where signing in goes — a path on this host the server has already checked. */
  returnTo?: string;
  /** The company's identity provider, when it has one (ENTERPRISE_ACCESS_DESIGN.md § 4.6). */
  sso?: PublicSso;
  /** Single sign-on asked for our second step: show it straight away. */
  initialMfa?: "CHALLENGE" | "ENROL";
  /** The IdP's answer was refused — one sentence, the reason in the journal. */
  ssoFailed?: boolean;
};

/** The providers named by brand; any other is called "single sign-on", which is words (`login.ssoGenericProvider`). */
const PROVIDER_NAME: Record<string, string> = { OKTA: "Okta", ENTRA: "Microsoft" };

const LoginContainer: React.FC<LoginContainerProps> = ({
  passwordChanged = false,
  headline,
  subheadline,
  changeCompanyHref,
  returnTo = APP_HOME,
  sso,
  initialMfa,
  ssoFailed = false,
}) => {
  const t = useTranslations("auth");
  const loginAction = useLoginAction();
  // A correct password that needs a second step: the challenge is a cookie; this says which step it is.
  const [mfa, setMfa] = React.useState<"CHALLENGE" | "ENROL" | null>(initialMfa ?? null);
  // Under Required the password form is the System Owners' break-glass (A2): behind a link, not gone.
  const [showPassword, setShowPassword] = React.useState(sso?.mode !== "REQUIRED");
  const ssoOn = sso && sso.mode !== "OFF";
  const ssoHref = `/api/auth/sso/start?next=${encodeURIComponent(returnTo)}`;

  const handleSubmit = React.useCallback(
    async (values: LoginFormValues) => {
      let res: Awaited<ReturnType<typeof loginAction.mutateAsync>>;
      try {
        res = await loginAction.mutateAsync(values);
      } catch {
        // A refusal is already on screen — `loginAction.error` feeds `apiError` below. Rethrowing
        // left the form's submit handler with a rejected promise nobody awaited, which Next's dev
        // overlay reports as a runtime error on every wrong password.
        return;
      }

      if (res.ok && res.next === "mfa" && res.mfa) {
        setMfa(res.mfa);
        return;
      }

      if (res.ok) {
        // A full navigation, not router.push, on purpose.
        //
        // The root layout is what reads the session cookie and paints the company's brand
        // (workspaceAccent). A client-side push keeps the layout that rendered for the *logged-out*
        // login page — no cookie, no brand — so the app came up in the default accent and only
        // corrected itself whenever something later forced a hard load. Signing in changes identity;
        // re-rendering everything from the server is the honest response, and it costs one load.
        window.location.assign(returnTo);
        return;
      }

      // The client throws for every failing status, so reaching here means a 2xx that was not a
      // sign-in. There is no code to look up and nothing specific to say.
      throw new Error(`Login answered ${res.status} without a session`);
    },
    [loginAction, returnTo],
  );

  if (mfa) {
    return (
      <MfaSignInStep
        mode={mfa}
        returnTo={returnTo}
        onRestart={() => {
          loginAction.reset();
          setMfa(null);
        }}
      />
    );
  }

  // SSO is a secondary button (SPEC § 2), even when it is the only way in: the accent is the company's
  // primary action inside the product, and signing in through somebody else's page is not one.
  const ssoButton = ssoOn ? (
    <Button asChild variant="secondary" size="lg" className="w-full">
      <a href={ssoHref}>
        {t("login.ssoButton", { provider: PROVIDER_NAME[sso?.provider ?? "OTHER"] ?? t("login.ssoGenericProvider") })}
      </a>
    </Button>
  ) : null;

  if (ssoOn && !showPassword) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-page-title">{headline}</h1>
          {subheadline && <p className="text-body text-secondary">{subheadline}</p>}
        </div>
        {ssoFailed && (
          <InlineAlert tone="declined">{t("login.ssoFailed")}</InlineAlert>
        )}
        {ssoButton}
        <Button type="button" variant="link" className="mx-auto flex" onClick={() => setShowPassword(true)}>
          {t("login.passwordFallback")}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
    {ssoButton && (
      <div className="space-y-3">
        {ssoFailed && (
          <InlineAlert tone="declined">{t("login.ssoFailed")}</InlineAlert>
        )}
      </div>
    )}
    <LoginForm
      onSubmitAction={handleSubmit}
      isLoading={loginAction.isPending}
      /*
        The dictionary, not the exception's own text. This read `error.message` directly, which is
        the backend's English on a good day \u2014 and on a bad one is a sentence written for whoever has
        to debug it: the login screen showed "Cannot reach the API at http://localhost:8081 \u2014 is the
        backend running?" to anybody who tried to sign in while the API was down. The refusal for a
        wrong password (`AUTH00001`) went the same way, in the server's wording rather than ours.
      */
      apiError={loginAction.error ? messageForError(loginAction.error) : undefined}
      notice={passwordChanged ? t("login.passwordChanged") : undefined}
      headline={headline}
      subheadline={subheadline}
      changeCompanyHref={changeCompanyHref}
    />
    {ssoButton && (
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-hint text-tertiary">
          <span className="h-px flex-1 bg-divider" />
          {t("login.or")}
          <span className="h-px flex-1 bg-divider" />
        </div>
        {ssoButton}
      </div>
    )}
    </div>
  );
};

export default LoginContainer;
