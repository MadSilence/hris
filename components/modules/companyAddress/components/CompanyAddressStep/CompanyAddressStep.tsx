"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import { useAppDataContext } from "@/components/providers/AppDataProvider/AppDataProvider";
import {
  companyHost,
  companyOrigin,
  normalizeCompanyAddress,
  TYPED_COMPANY_COOKIE,
  type WebAddressConfig,
} from "@/lib/companyAddress";

/**
 * `<root>/login` — "Log in to your company" (sign-in-root A1, A2). The address is typed, checked and followed: an address
 * no company holds stays here with "We can’t find that company…" and a way to find it by email (the designers' login fix
 * R3, the owner's call of 2026-11-19 — until then it was followed blindly and the address's own page drew "Log in to
 * <whatever was typed>"). A2 offers the company this browser logged in to last, by its logo and name, read on the
 * server for the remembered address only.
 */
export type RememberedCompany = { subdomain: string; name: string | null; logoUrl: string | null };

type Props = {
  web: WebAddressConfig;
  remembered: RememberedCompany | null;
  /** An address a company's own page sent back because nobody holds it (`/login/unknown`): typed in, with the error. */
  unknown?: string | null;
  navigate?: (url: string) => void;
  /** Whether a company holds the address; null when that could not be asked. */
  exists?: (subdomain: string) => Promise<boolean | null>;
};

const defaultNavigate = (url: string) => window.location.assign(url);

function useExists(): (subdomain: string) => Promise<boolean | null> {
  const { internalApiClient } = useAppDataContext();
  return async (subdomain) => {
    try {
      const res = await internalApiClient.get<{ exists: boolean | null }>(`/public/company-address/${encodeURIComponent(subdomain)}`);
      return res.exists;
    } catch {
      return null;
    }
  };
}

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

export default function CompanyAddressStep({ web, remembered, unknown = null, navigate = defaultNavigate, exists: existsProp }: Props) {
  const t = useTranslations("auth");
  const askExists = useExists();
  const exists = existsProp ?? askExists;
  const [chooseAnother, setChooseAnother] = useState(remembered === null || Boolean(unknown));
  const [typed, setTyped] = useState(unknown ?? "");
  const [error, setError] = useState<"required" | "unknown" | null>(unknown ? "unknown" : null);
  const [busy, setBusy] = useState(false);

  const goTo = (subdomain: string) => {
    setBusy(true);
    document.cookie = `${TYPED_COMPANY_COOKIE}=${subdomain}; path=/; max-age=${REMEMBER_TYPED_FOR_SECONDS}; samesite=lax`;
    navigate(`${companyOrigin(subdomain, web)}/login`);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const address = normalizeCompanyAddress(typed);
    if (!address) {
      setError("required");
      return;
    }
    setBusy(true);
    // Not found stays here; found, or not known because the check itself failed, goes on as it always did.
    if ((await exists(address)) === false) {
      setBusy(false);
      setError("unknown");
      return;
    }
    goTo(address);
  };

  const errorText = error === "required" ? t("root.addressRequired")
    : error === "unknown" ? t.rich("root.unknownAddress", {
        link: (chunks) => <Link href="/login/find" className="font-medium text-accent-text underline-offset-4 hover:underline">{chunks}</Link>,
      })
      : null;

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
        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-address">{t("root.address")}</Label>
            {/* The ending is an add-on inside the field, Mist, its full height; the text stops where it starts (R1). */}
            <div className="auth-address" data-invalid={Boolean(error)}>
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
                aria-describedby="company-address-suffix"
                autoFocus
              />
              <span id="company-address-suffix" className="auth-address-suffix">.{web.rootDomain}</span>
            </div>
            <FieldError>{errorText}</FieldError>
          </div>
          <Button size="lg" type="submit" className="w-full" loading={busy} loadingLabel={t("busy.loggingIn")}>
            {t("root.continue")}
          </Button>
        </form>
      )}

      <Link href="/login/find" className="self-start text-label text-accent-text underline-offset-4 hover:underline">
        {t("root.forgotAddress")}
      </Link>
    </AuthSplit>
  );
}
