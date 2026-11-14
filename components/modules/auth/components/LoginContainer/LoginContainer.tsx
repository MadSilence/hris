"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { InlineAlert } from "@/components/desact/alert";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { AuthBack, AuthHeading, AuthOr, AuthSplit, CodeInput, ProviderButton, type AuthBrand } from "@/components/modules/auth/layout";
import { ResendLine } from "@/components/modules/auth/components/ResendLine";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { PasswordField } from "@/components/modules/auth/components/PasswordField";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import { messageForError } from "@/lib/errors/errorMessages";
import { isEmail } from "@/lib/email";
import { APP_HOME } from "@/lib/companyAddress";
import type { PublicSso } from "@/api/modules/sso/ssoService";

/*
 * The company's login (sign-in-company-login C1–C9). Which ways in it shows follows the company's settings in Login &
 * SSO — the server enforces the same, a hidden button is not the control:
 *
 *   C1  the password form alone (Google and Microsoft switched off, no SSO)
 *   C2  Google and Microsoft first, "or", the form — every company's default
 *   C3  the company's own SSO (secondary), Google and Microsoft, "or", the form — SSO optional
 *   C4  the company's own SSO, "or", the form — SSO optional, the buttons off
 *   C5  SSO required: one sentence and the company's button as the accent; the System Owner's way in quiet at the foot
 *
 * A second step does not open here: the browser goes to its own route (D), the challenge already in its cookie.
 */

export type SharedProvider = "GOOGLE" | "MICROSOFT";

type Props = {
  brand: Extract<AuthBrand, { kind: "company" }>;
  sso: PublicSso | null;
  /** Google / Microsoft on this company's login: configured on the installation and on in the company. */
  providers: SharedProvider[];
  returnTo?: string;
  notice?: "passwordChanged" | "loggedOut" | "codeOtherBrowser" | "codeExpired" | null;
  /** A provider sent the person back refused: one sentence, the reason in the journal. */
  failure?: { kind: "sso" } | { kind: "provider"; provider: SharedProvider } | null;
  changeCompanyHref: string;
  /** Prefilled after a password change (C8). */
  email?: string;
};

const PROVIDER_LABEL: Record<SharedProvider, string> = { GOOGLE: "Google", MICROSOFT: "Microsoft" };

/** The company's own provider by name; Entra reads as "your company account", so it is not confused with Microsoft. */
function useCompanySsoLabel(sso: PublicSso | null) {
  const t = useTranslations("auth");
  if (!sso || sso.mode === "OFF") return null;
  if (sso.provider === "ENTRA") return { button: t("company.logInWithCompanyAccount"), name: "Microsoft" };
  // The company's own Workspace or Microsoft 365 through our application (§ 11.4): one button per provider, and it is
  // this one — a round trip through the shared application, not the company's own.
  if (sso.provider === "GOOGLE_WORKSPACE") return { button: t("company.continueWith", { provider: "Google" }), name: "Google", shared: "GOOGLE" as const };
  if (sso.provider === "MICROSOFT_365") return { button: t("company.continueWith", { provider: "Microsoft" }), name: "Microsoft", shared: "MICROSOFT" as const };
  const name = sso.provider === "OKTA" ? "Okta" : t("company.singleSignOn");
  return { button: t("company.logInWith", { provider: name }), name };
}

export function secondStepHref(mfa: "CHALLENGE" | "ENROL", returnTo: string) {
  const next = returnTo && returnTo !== APP_HOME ? `?next=${encodeURIComponent(returnTo)}` : "";
  return `${mfa === "ENROL" ? "/login/set-up-two-step" : "/login/second-step"}${next}`;
}

/** C10: the code from the email, typed in the browser that asked; the second step still follows. */
export function LoginCodeStep({ email, returnTo }: { email: string; returnTo: string }) {
  const t = useTranslations("auth");
  const auth = useAuthService();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const verify = async (value: string = code) => {
    if (busy) return;
    if (value.length < 6) return setError(t("fields.codeRequired"));
    setBusy(true);
    setError(null);
    try {
      const res = await auth.loginCodeVerify(email, value, returnTo);
      window.location.assign(res.next);
    } catch (err) {
      setError(messageForError(err));
      setBusy(false);
    }
  };

  return (
    <>
      <AuthHeading
        icon={Mail01Icon}
        tone="accent"
        title={t("company.codeTitle")}
        lead={t.rich("company.codeLead", { email, b: (c) => <b className="font-medium text-primary [overflow-wrap:anywhere]">{c}</b> })}
      />
      <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void verify(); }}>
        <div className="flex flex-col gap-2">
          <CodeInput label={t("fields.code")} value={code} onChange={(v) => { setCode(v); setError(null); }}
                     onComplete={(v) => void verify(v)} invalid={Boolean(error)} disabled={busy} autoFocus />
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("busy.loggingIn")}>
          {t("company.submit")}
        </Button>
      </form>
      <ResendLine onResend={async () => {
        try {
          await auth.loginCodeSend(email);
          return null;
        } catch (err) {
          return messageForError(err);
        }
      }} />
    </>
  );
}

export function LoginForm({
  returnTo = APP_HOME,
  initialEmail = "",
  showForgot = true,
  onCodeSent,
}: {
  returnTo?: string;
  initialEmail?: string;
  showForgot?: boolean;
  /** "Email me a login code" under the Email field (C10); absent where a code is not allowed (C6). */
  onCodeSent?: (email: string) => void;
}) {
  const auth = useAuthService();
  const [sendingCode, setSendingCode] = React.useState(false);
  const t = useTranslations("auth");
  const loginAction = useLoginAction();
  const [email, setEmail] = React.useState(initialEmail);
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!email.trim()) next.email = t("fields.emailRequired");
    else if (!isEmail(email)) next.email = t("fields.emailInvalid");
    if (!password) next.password = t("fields.passwordRequired");
    setErrors(next);
    if (next.email || next.password) return;

    setBusy(true);
    setRefusal(null);
    try {
      const res = await loginAction.mutateAsync({ email: email.trim(), password });
      if (res.ok && res.next === "mfa" && res.mfa) {
        window.location.assign(secondStepHref(res.mfa, returnTo));
        return;
      }
      // A full navigation, not router.push: signing in changes identity, and the layout that reads the session
      // cookie and paints the company's brand must render again from the server.
      window.location.assign(returnTo);
    } catch (error) {
      setRefusal(messageForError(error));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">{t("fields.email")}</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            setErrors((v) => ({ ...v, email: undefined }));
          }}
          aria-invalid={Boolean(errors.email)}
          className="h-11"
          autoFocus={!initialEmail}
        />
        <FieldError>{errors.email}</FieldError>
        {onCodeSent && (
          <button
            type="button"
            className="-mt-0.5 mb-2 self-start text-label text-accent-text underline-offset-4 hover:underline focus-visible:underline"
            onClick={async () => {
              if (sendingCode) return;
              if (!email.trim()) return setErrors((v) => ({ ...v, email: t("fields.emailRequired") }));
              if (!isEmail(email)) return setErrors((v) => ({ ...v, email: t("fields.emailInvalid") }));
              setSendingCode(true);
              setRefusal(null);
              try {
                await auth.loginCodeSend(email.trim());
                onCodeSent(email.trim());
              } catch (err) {
                setRefusal(messageForError(err));
                setSendingCode(false);
              }
            }}
          >
            {sendingCode ? t("company.sendingCode") : t("company.emailCode")}
          </button>
        )}
      </div>
      <PasswordField
        id="login-password"
        label={t("fields.password")}
        value={password}
        onChange={(v) => {
          setPassword(v);
          setErrors((x) => ({ ...x, password: undefined }));
        }}
        error={errors.password}
        autoFocus={Boolean(initialEmail)}
        aside={showForgot ? (
          <Link href="/login/forgot" className="text-label text-accent-text underline-offset-4 hover:underline">
            {t("company.forgotPassword")}
          </Link>
        ) : null}
      />
      {refusal && <InlineAlert tone="declined">{refusal}</InlineAlert>}
      <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("busy.loggingIn")}>
        {t("company.submit")}
      </Button>
    </form>
  );
}

export default function LoginContainer({
  brand,
  sso,
  providers,
  returnTo = APP_HOME,
  notice = null,
  failure = null,
  changeCompanyHref,
  email,
}: Props) {
  const t = useTranslations("auth");
  const ssoLabel = useCompanySsoLabel(sso);
  const ssoHref = ssoLabel && "shared" in ssoLabel && ssoLabel.shared
    ? `/api/auth/provider/start?purpose=SIGN_IN&provider=${ssoLabel.shared}&next=${encodeURIComponent(returnTo)}`
    : `/api/auth/sso/start?next=${encodeURIComponent(returnTo)}`;
  const required = sso?.mode === "REQUIRED";
  const [ssoBusy, setSsoBusy] = React.useState(false);
  const [codeFor, setCodeFor] = React.useState<string | null>(null);
  const companyName = brand.name;

  const failureText =
    failure?.kind === "provider"
      ? t("company.providerFailed", { provider: PROVIDER_LABEL[failure.provider] })
      : failure?.kind === "sso"
        ? t("company.ssoFailed", { provider: ssoLabel?.name ?? t("company.singleSignOn") })
        : null;

  const companyButton = (accent: boolean) =>
    ssoLabel && (
      <a
        href={ssoHref}
        onClick={() => setSsoBusy(true)}
        aria-busy={ssoBusy || undefined}
        className={buttonVariants({ size: "lg", variant: accent ? "primary" : "secondary", className: "w-full" })}
      >
        {ssoBusy && accent ? t("busy.takingYouTo", { provider: ssoLabel.name }) : ssoLabel.button}
      </a>
    );

  const foot = (
    <p className="text-body text-secondary">
      {t.rich("company.notYourCompany", {
        link: (chunks) => <a href={changeCompanyHref} className="text-accent-text underline-offset-4 hover:underline">{chunks}</a>,
      })}
    </p>
  );

  if (codeFor) {
    return (
      <AuthSplit brand={brand} back={<AuthBack onClick={() => setCodeFor(null)} />}>
        <LoginCodeStep email={codeFor} returnTo={returnTo} />
      </AuthSplit>
    );
  }

  if (required) {
    return (
      <AuthSplit brand={brand}>
        <AuthHeading
          title={t("company.title", { company: companyName })}
          lead={t("company.requiredLead", { company: companyName, provider: ssoLabel?.name ?? "" })}
        />
        {failureText && <InlineAlert tone="declined">{failureText}</InlineAlert>}
        {companyButton(true)}
        <div className="flex flex-col gap-6">
          {foot}
          <Link href="/login/owner" className="self-start text-hint text-tertiary hover:underline">{t("company.ownerLogin")}</Link>
        </div>
      </AuthSplit>
    );
  }

  const ways = (
    <>
      {companyButton(false)}
      {providers.map((p) => (
        <ProviderButton
          key={p}
          provider={p}
          href={`/api/auth/provider/start?purpose=SIGN_IN&provider=${p}&next=${encodeURIComponent(returnTo)}`}
          label={t("company.continueWith", { provider: PROVIDER_LABEL[p] })}
        />
      ))}
    </>
  );
  const hasWays = Boolean(ssoLabel) || providers.length > 0;

  const noticeText = notice === "passwordChanged" ? t("company.passwordChanged")
    : notice === "loggedOut" ? t("company.loggedOut")
      : notice === "codeOtherBrowser" ? t("company.codeOtherBrowser")
        : notice === "codeExpired" ? t("company.codeExpired") : null;

  return (
    <AuthSplit brand={brand} long={hasWays && providers.length > 0 && Boolean(ssoLabel)}>
      <AuthHeading title={t("company.title", { company: companyName })} />
      {noticeText && <InlineAlert tone="info">{noticeText}</InlineAlert>}
      {failureText && <InlineAlert tone="declined">{failureText}</InlineAlert>}
      {hasWays && (
        <div className="flex flex-col gap-3">
          {ways}
        </div>
      )}
      {hasWays && <AuthOr />}
      <LoginForm returnTo={returnTo} initialEmail={email} onCodeSent={setCodeFor} />
      {foot}
    </AuthSplit>
  );
}
