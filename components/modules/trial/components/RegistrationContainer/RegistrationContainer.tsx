"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Mail01Icon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Icon } from "@/components/desact/icon";
import { Avatar, AvatarFallback } from "@/components/desact/avatar";
import { FieldError } from "@/components/desact/field-error";
import { InlineAlert } from "@/components/desact/alert";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ApiError } from "@/components/clients/exceptions";
import { AuthBack, AuthFirstExperience, AuthHeading, AuthOr, CodeInput, ProviderButton } from "@/components/modules/auth/layout";
import { PasswordField } from "@/components/modules/auth/components/PasswordField";
import { ResendLine } from "@/components/modules/auth/components/ResendLine";
import { PASSWORD_MIN_LENGTH } from "@/components/modules/auth/password/passwordRules";
import { useTrialService } from "@/components/modules/trial/hooks/useTrialService";
import { messageForError } from "@/lib/errors/errorMessages";
import { isEmail } from "@/lib/email";
import type { ProviderDraft } from "@/api/modules/auth/services/hrisAuthSessionService";

/*
 * Registering a company (sign-in-registration B1 → B2 → B2a). Email first and nothing else: names, the company and a
 * password come after the address is proved by a six-digit code typed in this browser (B2). Google and Microsoft land
 * on B3: the provider proved the person, so it asks only for the company, and no password (S7). On success the browser goes to the new company's own address, which opens
 * the owner's session there and leads to /setup.
 */

type Step =
  | { kind: "email" }
  | { kind: "code"; email: string }
  | { kind: "details"; email: string }
  | { kind: "provider"; draft: ProviderDraft };

const CODE_WRONG = "AUTH00022";
const CODE_EXPIRED = "AUTH00023";
const DRAFT_EXPIRED = "AUTH00025";
const PASSWORD_TOO_COMMON = "AUTH00021";

export type Provider = "GOOGLE" | "MICROSOFT";

function EmailStep({ providers, failedProvider, onSent }: {
  providers: Provider[];
  failedProvider: Provider | null;
  onSent: (email: string) => void;
}) {
  const t = useTranslations("auth");
  const service = useTrialService();
  const [email, setEmail] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const address = email.trim();
    if (!address) return setFieldError(t("fields.emailRequired"));
    if (!isEmail(address)) return setFieldError(t("fields.emailInvalid"));
    setBusy(true);
    setError(null);
    try {
      await service.sendCode(address);
      onSent(address);
    } catch (err) {
      setError(messageForError(err));
      setBusy(false);
    }
  };

  const label = (p: Provider) => (p === "GOOGLE" ? "Google" : "Microsoft");
  return (
    <>
      <h1 className="text-auth-display text-primary">{t.rich("registration.title", { em: (c) => <em>{c}</em> })}</h1>
      {failedProvider && <InlineAlert tone="declined">{t("registration.providerFailed", { provider: label(failedProvider) })}</InlineAlert>}
      {providers.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {providers.map((p) => (
              <ProviderButton key={p} provider={p} href={`/api/auth/provider/start?purpose=SIGNUP&provider=${p}`}
                              label={t("company.continueWith", { provider: label(p) })} />
            ))}
          </div>
          <AuthOr />
        </>
      )}
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="trial-email" className="text-label text-primary">{t("registration.businessEmail")}</label>
          <Input
            id="trial-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.currentTarget.value); setFieldError(null); }}
            aria-invalid={Boolean(fieldError)}
            className="h-11"
            autoFocus
          />
          <FieldError>{fieldError}</FieldError>
        </div>
        <FormError message={error} />
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("busy.sending")}>
          {t("registration.continueWithEmail")}
        </Button>
      </form>
      {/* The Terms and the Privacy policy have no pages yet (GO_TO_MARKET_DESIGN.md G15–G17): plain words until they do. */}
      <p className="text-hint text-tertiary">{t.rich("registration.terms", { terms: (c) => <span>{c}</span>, privacy: (c) => <span>{c}</span> })}</p>
      <p className="text-body text-secondary">
        {t.rich("registration.haveAccount", { link: (c) => <a href="/login" className="text-accent-text underline-offset-4 hover:underline">{c}</a> })}
      </p>
    </>
  );
}

function CodeStep({ email, onVerified }: { email: string; onVerified: () => void }) {
  const t = useTranslations("auth");
  const service = useTrialService();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const verify = async (value: string = code) => {
    if (busy) return;
    if (value.length < 6) return setError(t("fields.codeRequired"));
    setBusy(true);
    setError(null);
    try {
      await service.verifyCode(email, value);
      onVerified();
    } catch (err) {
      if (err instanceof ApiError && (err.code === CODE_WRONG || err.code === CODE_EXPIRED)) setError(messageForError(err));
      else setError(messageForError(err));
      setBusy(false);
    }
  };

  return (
    <>
      <AuthHeading
        icon={Mail01Icon}
        tone="accent"
        title={t("registration.codeTitle")}
        lead={t.rich("registration.codeLead", { email, b: (c) => <b className="font-medium text-primary [overflow-wrap:anywhere]">{c}</b> })}
      />
      <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void verify(); }}>
        <div className="flex flex-col gap-2">
          <CodeInput label={t("fields.code")} value={code} onChange={(v) => { setCode(v); setError(null); }}
                     onComplete={(v) => void verify(v)} invalid={Boolean(error)} disabled={busy} autoFocus />
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("registration.checking")}>
          {t("registration.continue")}
        </Button>
      </form>
      <ResendLine onResend={async () => {
        try {
          await service.sendCode(email);
          return null;
        } catch (err) {
          return messageForError(err);
        }
      }} />
    </>
  );
}

function DetailsStep({ email, onExpired }: { email: string; onExpired: () => void }) {
  const t = useTranslations("auth");
  const service = useTrialService();
  const [values, setValues] = React.useState({ firstName: "", lastName: "", companyName: "", password: "" });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof values, string>>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const set = (name: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!values.firstName.trim()) next.firstName = t("registration.firstNameRequired");
    if (!values.lastName.trim()) next.lastName = t("registration.lastNameRequired");
    if (!values.companyName.trim()) next.companyName = t("registration.companyRequired");
    else if (!/^[a-zA-Z0-9\s-]+$/.test(values.companyName.trim())) next.companyName = t("registration.companyInvalid");
    if (!values.password) next.password = t("fields.newPasswordRequired");
    else if (values.password.length < PASSWORD_MIN_LENGTH) next.password = t("fields.passwordTooShort");
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setBusy(true);
    setError(null);
    try {
      const { next: to } = await service.complete({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        companyName: values.companyName.trim(),
        password: values.password,
      });
      window.location.assign(to);
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.code === DRAFT_EXPIRED) return onExpired();
      if (err instanceof ApiError && err.code === PASSWORD_TOO_COMMON) return setErrors({ password: messageForError(err) });
      setError(messageForError(err));
    }
  };

  const field = (name: "firstName" | "lastName" | "companyName", autoComplete: string) => (
    <div className="flex flex-col gap-2">
      <RequiredLabel htmlFor={`trial-${name}`} required>{t(`registration.${name}`)}</RequiredLabel>
      <Input id={`trial-${name}`} autoComplete={autoComplete} value={values[name]} onChange={(e) => set(name)(e.currentTarget.value)}
             aria-invalid={Boolean(errors[name])} className="h-11" />
      <FieldError>{errors[name]}</FieldError>
    </div>
  );

  return (
    <>
      <AuthHeading title={t("registration.detailsTitle")} />
      <p className="flex items-center gap-2 text-body text-secondary">
        <Icon icon={CheckmarkCircle02Icon} size="sm" className="text-status-approved-icon" />
        <span>{t.rich("registration.confirmed", { email, b: (c) => <b className="font-medium text-primary [overflow-wrap:anywhere]">{c}</b> })}</span>
      </p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("firstName", "given-name")}
          {field("lastName", "family-name")}
        </div>
        {field("companyName", "organization")}
        <PasswordField id="trial-password" label={t("fields.password")} value={values.password} onChange={set("password")}
                       error={errors.password} hint={t("fields.passwordHint")} autoComplete="new-password" required />
        <FormError message={error} />
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("registration.creating")}>
          {t("registration.create")}
        </Button>
      </form>
    </>
  );
}

/** B3 — back from Google or Microsoft: who they are (read-only, with *Not you?*), names pre-filled, the company. */
function ProviderDetailsStep({ draft, onExpired }: { draft: ProviderDraft; onExpired: () => void }) {
  const t = useTranslations("auth");
  const service = useTrialService();
  const [values, setValues] = React.useState({
    firstName: draft.firstName ?? "",
    lastName: draft.lastName ?? "",
    companyName: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof values, string>>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const providerName = draft.provider === "GOOGLE" ? "Google" : "Microsoft";
  const fullName = [draft.firstName, draft.lastName].filter(Boolean).join(" ");
  const initials = (fullName || draft.email).split(/s+/).map((w) => w.charAt(0)).join("").slice(0, 2).toUpperCase();

  const set = (name: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!values.firstName.trim()) next.firstName = t("registration.firstNameRequired");
    if (!values.lastName.trim()) next.lastName = t("registration.lastNameRequired");
    if (!values.companyName.trim()) next.companyName = t("registration.companyRequired");
    else if (!/^[a-zA-Z0-9s-]+$/.test(values.companyName.trim())) next.companyName = t("registration.companyInvalid");
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setBusy(true);
    setError(null);
    try {
      const { next: to } = await service.completeWithProvider({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        companyName: values.companyName.trim(),
      });
      window.location.assign(to);
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.code === DRAFT_EXPIRED) return onExpired();
      setError(messageForError(err));
    }
  };

  const field = (name: keyof typeof values, autoComplete: string) => (
    <div className="flex flex-col gap-2">
      <RequiredLabel htmlFor={`trial-${name}`} required>{t(`registration.${name}`)}</RequiredLabel>
      <Input id={`trial-${name}`} autoComplete={autoComplete} value={values[name]} onChange={(e) => set(name)(e.currentTarget.value)}
             aria-invalid={Boolean(errors[name])} className="h-11" />
      <FieldError>{errors[name]}</FieldError>
    </div>
  );

  return (
    <>
      <AuthHeading title={t("registration.detailsTitle")} lead={t("registration.continuingWith", { provider: providerName })} />
      <div className="flex items-center gap-3 rounded-control border border-field px-3 py-2.5">
        <Avatar className="size-8"><AvatarFallback name={fullName || draft.email} className="text-label">{initials}</AvatarFallback></Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          {fullName && <span className="text-body font-medium text-primary [overflow-wrap:anywhere]">{fullName}</span>}
          <span className="text-hint text-tertiary [overflow-wrap:anywhere]">{draft.email}</span>
        </div>
        <a href="/api/auth/register/provider-forget" className="shrink-0 text-body text-accent hover:underline">{t("registration.notYou")}</a>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("firstName", "given-name")}
          {field("lastName", "family-name")}
        </div>
        {field("companyName", "organization")}
        <FormError message={error} />
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("registration.creating")}>
          {t("registration.create")}
        </Button>
      </form>
    </>
  );
}

export function ExpiredStep() {
  const t = useTranslations("auth");
  return (
    <>
      <AuthHeading icon={Clock01Icon} title={t("registration.expiredTitle")} lead={t("registration.expiredBody")} />
      <a href="/api/auth/register/provider-forget" className="inline-flex h-11 w-full items-center justify-center rounded-control bg-accent px-4.5 text-card-title font-medium text-on-accent hover:bg-accent-hover">
        {t("registration.startAgain")}
      </a>
    </>
  );
}

export function RegistrationContainer({ providers = [], failedProvider = null, providerDraft = null }: {
  providers?: Provider[];
  failedProvider?: Provider | null;
  /** Back from Google or Microsoft: B3, or B3a when the draft has run out. */
  providerDraft?: ProviderDraft | "expired" | null;
}) {
  const [step, setStep] = React.useState<Step | { kind: "expired" }>(() =>
    providerDraft === "expired" ? { kind: "expired" } : providerDraft ? { kind: "provider", draft: providerDraft } : { kind: "email" });

  const back =
    step.kind === "code" ? <AuthBack onClick={() => setStep({ kind: "email" })} />
      : step.kind === "details" ? <AuthBack onClick={() => setStep({ kind: "code", email: step.email })} />
        : undefined;

  return (
    <AuthFirstExperience back={back} long={step.kind === "details" || step.kind === "provider"}>
      {step.kind === "email" && (
        <EmailStep providers={providers} failedProvider={failedProvider} onSent={(email) => setStep({ kind: "code", email })} />
      )}
      {step.kind === "code" && <CodeStep email={step.email} onVerified={() => setStep({ kind: "details", email: step.email })} />}
      {step.kind === "details" && <DetailsStep email={step.email} onExpired={() => setStep({ kind: "expired" })} />}
      {step.kind === "provider" && <ProviderDetailsStep draft={step.draft} onExpired={() => setStep({ kind: "expired" })} />}
      {step.kind === "expired" && <ExpiredStep />}
    </AuthFirstExperience>
  );
}
