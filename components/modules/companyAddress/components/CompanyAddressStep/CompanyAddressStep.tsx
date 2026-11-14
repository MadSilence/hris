"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import {
  companyHost,
  companyOrigin,
  normalizeCompanyAddress,
  TYPED_COMPANY_COOKIE,
  type WebAddressConfig,
} from "@/lib/companyAddress";

/**
 * `<root>/login` — "Log in to your company" (sign-in-root A1, A2). The address is typed and followed; the page never
 * asks the backend whether a company is there (COMPANY_ADDRESSES.md § 2). A2 offers the company this browser logged in
 * to last, by its logo and name, read on the server for the remembered address only.
 */
export type RememberedCompany = { subdomain: string; name: string | null; logoUrl: string | null };

type Props = {
  web: WebAddressConfig;
  remembered: RememberedCompany | null;
  navigate?: (url: string) => void;
};

const defaultNavigate = (url: string) => window.location.assign(url);

/** "Continue to" without a cookie would lose the typed address on the next visit. A year, like the remembered one. */
const REMEMBER_TYPED_FOR_SECONDS = 365 * 24 * 60 * 60;

function CompanyTile({ company, web }: { company: RememberedCompany; web: WebAddressConfig }) {
  const name = company.name ?? company.subdomain;
  return (
    <div className="flex items-center gap-4 rounded-card border border-divider bg-card p-4">
      <span className="flex size-14 flex-none items-center justify-center overflow-hidden rounded-control border border-divider bg-card text-section-title text-accent-text">
        {company.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a backend-hosted logo of unknown size
          <img src={company.logoUrl} alt="" className="max-h-10 max-w-10 object-contain" />
        ) : (
          name.trim().charAt(0).toUpperCase()
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="line-clamp-2 text-card-title font-semibold text-primary">{name}</span>
        <span className="truncate text-label font-normal text-tertiary">{companyHost(company.subdomain, web)}</span>
      </span>
    </div>
  );
}

export default function CompanyAddressStep({ web, remembered, navigate = defaultNavigate }: Props) {
  const t = useTranslations("auth");
  const [chooseAnother, setChooseAnother] = useState(remembered === null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const goTo = (subdomain: string) => {
    setBusy(true);
    document.cookie = `${TYPED_COMPANY_COOKIE}=${subdomain}; path=/; max-age=${REMEMBER_TYPED_FOR_SECONDS}; samesite=lax`;
    navigate(`${companyOrigin(subdomain, web)}/login`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const address = normalizeCompanyAddress(typed);
    if (!address) {
      setError(t("root.addressRequired"));
      return;
    }
    goTo(address);
  };

  const offered = chooseAnother ? null : remembered;

  return (
    <AuthSplit brand={{ kind: "noddo" }}>
      <AuthHeading title={t("root.title")} />

      {offered ? (
        <div className="flex flex-col gap-4">
          <p className="text-body text-secondary">{t("root.lastTime")}</p>
          <CompanyTile company={offered} web={web} />
          <Button size="lg" type="button" className="w-full" loading={busy} loadingLabel={t("busy.loggingIn")}
                  onClick={() => goTo(offered.subdomain)}>
            {t("root.continue")}
          </Button>
          <Button variant="link" type="button" className="self-start" onClick={() => setChooseAnother(true)}>
            {t("root.useAnother")}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-address">{t("root.address")}</Label>
            <div className="relative">
              <Input
                id="company-address"
                name="companyAddress"
                autoComplete="organization"
                autoCapitalize="none"
                spellCheck={false}
                value={typed}
                onChange={(e) => {
                  setTyped(e.currentTarget.value);
                  setError(null);
                }}
                aria-invalid={Boolean(error)}
                className="h-11 pr-28"
                autoFocus
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body text-tertiary">
                .{web.rootDomain}
              </span>
            </div>
            <FieldError>{error}</FieldError>
          </div>
          <Button size="lg" type="submit" className="w-full" loading={busy} loadingLabel={t("busy.loggingIn")}>
            {t("root.continue")}
          </Button>
        </form>
      )}

      <Link href="/login/find" className="self-start text-body text-accent-text underline-offset-4 hover:underline">
        {t("root.forgotAddress")}
      </Link>
    </AuthSplit>
  );
}
