"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import AuthScreen from "@/components/modules/auth/components/AuthScreen";
import {
  companyHost,
  companyOrigin,
  normalizeCompanyAddress,
  TYPED_COMPANY_COOKIE,
  type WebAddressConfig,
} from "@/lib/companyAddress";
import { FormError } from "@/components/feedback/FormError";


type Props = {
  web: WebAddressConfig;
  /** The company this browser last signed in to, offered back — never followed on its own. */
  rememberedSubdomain: string | null;
  /** Wraps the browser's navigation so tests can observe it: jsdom's location is read-only. */
  navigate?: (url: string) => void;
};

const defaultNavigate = (url: string) => window.location.assign(url);

/** A year, like the address remembered after a successful sign-in. */
const REMEMBER_TYPED_FOR_SECONDS = 365 * 24 * 60 * 60;

/**
 * Step 1: "Sign in to your company" — the address, the way Slack asks for a workspace URL.
 *
 * **It never asks the backend anything.** Continue goes straight to the address; whether a company is
 * there is something only its login page could say, and it does not say it either
 * (DECISIONS.md § "Company addresses — what the owner settled").
 *
 * **A remembered company is offered, not followed.** Somebody who belongs to two companies would be
 * trapped in the first one by a redirect.
 */
export default function CompanyAddressStep({ web, rememberedSubdomain, navigate = defaultNavigate }: Props) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [chooseAnother, setChooseAnother] = useState(rememberedSubdomain === null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  const address = normalizeCompanyAddress(typed);
  const suffix = `.${web.rootDomain}`;

  const goTo = (subdomain: string) => {
    // Kept on this host for the next visit. The address remembered after a successful sign-in lives on
    // the parent domain and wins when a browser allows it; locally it does not (see rememberedCompany).
    document.cookie = `${TYPED_COMPANY_COOKIE}=${subdomain}; path=/; max-age=${REMEMBER_TYPED_FOR_SECONDS}; samesite=lax`;
    navigate(`${companyOrigin(subdomain, web)}/login`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) {
      setError(t("companyAddress.step.required"));
      return;
    }
    goTo(address);
  };

  const offered = chooseAnother ? null : rememberedSubdomain;

  return (
    <AuthScreen className="flex-1">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-greeting">{t("companyAddress.step.title")}</h1>
          <p className="text-body text-tertiary">
            {offered
              ? t("companyAddress.step.rememberedPrompt")
              : t("companyAddress.step.prompt")}
          </p>
        </div>

        {offered ? (
          <div className="space-y-3">
            <Button size="lg" type="button" className="w-full" onClick={() => goTo(offered)}>
              {t("companyAddress.step.continueTo", { address: companyHost(offered, web) })}
            </Button>
            <Button size="lg" type="button" variant="secondary" className="w-full" onClick={() => setChooseAnother(true)}>
              {t("companyAddress.step.useAnother")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company-address">{t("companyAddress.step.label")}</Label>

              <div className="flex items-center gap-2">
                <Input
                  id="company-address"
                  name="companyAddress"
                  autoComplete="organization"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder={t("companyAddress.step.placeholder")}
                  value={typed}
                  onChange={(e) => {
                    setTyped(e.currentTarget.value);
                    setError(null);
                  }}
                  aria-invalid={Boolean(error)}
                  className="h-11"
                  autoFocus
                />
                <span className="shrink-0 text-body text-tertiary">{suffix}</span>
              </div>

              {error && (
                <FormError message={error} />
              )}
            </div>

            <Button size="lg" type="submit" className="w-full">{tCommon("actions.continue")}</Button>
          </form>
        )}

        <p className="text-center text-body text-tertiary">
          <Link href="/find-company" className="text-accent-text underline-offset-4 hover:underline">
            {t("companyAddress.step.forgot")}
          </Link>
        </p>
      </div>
    </AuthScreen>
  );
}
