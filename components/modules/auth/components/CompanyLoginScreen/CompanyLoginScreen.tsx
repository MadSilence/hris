import React from "react";

import LoginContainer from "@/components/modules/auth/components/LoginContainer/LoginContainer";
import type { PublicCompanyAppearance } from "@/models/company/PublicCompanyAppearance";
import { DEFAULT_LOGIN_HEADLINE, DEFAULT_LOGIN_SUBHEADLINE } from "@/models/company/loginPageDefaults";

type Props = {
  appearance: PublicCompanyAppearance;
  passwordChanged: boolean;
  changeCompanyHref: string;
  /** Where signing in goes, already checked on the server. */
  returnTo: string;
};

/**
 * A company's own login page, drawn the way the Appearance preview draws it.
 *
 * **A server component, and that is the requirement, not a detail** (`technical_documentation/
 * COMPANY_ADDRESSES.md` § 4, the login page is never repainted). Everything the company configured arrives in this HTML:
 * the headline and subheadline as text, the background as an `<img>` with its URL, the colour through
 * `BrandThemeStyle` in `<head>` from the same read. Nothing here fetches in the browser, so nothing can
 * change after the first frame. Only the form itself hydrates, and it already shows the right words.
 *
 * The only thing that arrives later is the picture's bytes. It is preloaded, and the surface beneath it
 * is the brand's own tint from the first frame (`bg-brown-100` is re-hued by the brand palette), so the
 * image lands in a space already laid out and coloured for it — no fade, no shift.
 */
export default function CompanyLoginScreen({ appearance, passwordChanged, changeCompanyHref, returnTo }: Props) {
  const headline = appearance.loginHeadline?.trim() || DEFAULT_LOGIN_HEADLINE;
  const subheadline = appearance.loginSubheadline?.trim() || DEFAULT_LOGIN_SUBHEADLINE;
  const backgroundUrl = appearance.loginImageUrl;

  return (
    <div
      data-test="company-login"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-brown-100 px-4 py-10"
    >
      {backgroundUrl ? (
        <>
          <link rel="preload" as="image" href={backgroundUrl} />
          {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for
              the API origin, and would swap in a placeholder first — a repaint by design. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundUrl}
            alt=""
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </>
      ) : (
        <>
          <span aria-hidden className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-brown-300 opacity-60 blur-3xl"/>
          <span aria-hidden className="absolute -bottom-32 -right-16 h-[460px] w-[460px] rounded-full bg-brown-500 opacity-40 blur-3xl"/>
        </>
      )}

      <div className="relative w-full max-w-[460px] rounded-3xl bg-white p-8 shadow-2xl sm:p-12">
        <LoginContainer
          passwordChanged={passwordChanged}
          headline={headline}
          subheadline={subheadline}
          changeCompanyHref={changeCompanyHref}
          returnTo={returnTo}
        />
      </div>
    </div>
  );
}
