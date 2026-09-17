"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import {
  companyHost,
  companyOrigin,
  normalizeCompanyAddress,
  TYPED_COMPANY_COOKIE,
  type WebAddressConfig,
} from "@/lib/companyAddress";

export enum CompanyAddressStepMessages {
  Required = "Please enter your company address.",
}

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
      setError(CompanyAddressStepMessages.Required);
      return;
    }
    goTo(address);
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center py-12">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-medium">Sign in to your company</h1>
          <p className="text-md text-[var(--color-text-tertiary)]">
            Enter your company&apos;s address — the one you sign in at.
          </p>
        </div>

        {rememberedSubdomain && !chooseAnother ? (
          <div className="space-y-4">
            <Button className="h-11 w-full" onClick={() => goTo(rememberedSubdomain)}>
              Continue to {companyHost(rememberedSubdomain, web)}
            </Button>
            <Button variant="outline" className="h-11 w-full" onClick={() => setChooseAnother(true)}>
              Use another company
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <RequiredLabel htmlFor="company-address" required>Company Address</RequiredLabel>

              <div className="flex items-center gap-2">
                <Input
                  id="company-address"
                  name="companyAddress"
                  autoComplete="organization"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="your-company"
                  value={typed}
                  onChange={(e) => {
                    setTyped(e.currentTarget.value);
                    setError(null);
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby="company-address-preview"
                  autoFocus
                />
                <span className="shrink-0 text-sm text-[var(--color-text-tertiary)]">{suffix}</span>
              </div>

              <p id="company-address-preview" className="text-sm text-[var(--color-text-tertiary)]" aria-live="polite">
                {address ? (
                  <>You will sign in at <span className="font-medium text-[var(--color-text-primary)]">{companyHost(address, web)}</span></>
                ) : (
                  "Letters, numbers and dashes."
                )}
              </p>

              {error && (
                <p className="text-sm text-destructive" role="alert">{error}</p>
              )}
            </div>

            <Button type="submit" className="h-11 w-full">Continue</Button>
          </form>
        )}

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            <Link href="/find-company" className="underline underline-offset-4">
              Don&apos;t know your company address?
            </Link>
          </p>
          <p>
            New here?{" "}
            <Link href="/trial" className="underline underline-offset-4">Start a free trial</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
