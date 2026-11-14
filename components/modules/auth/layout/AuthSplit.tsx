import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { NoddoWordmark, PoweredByNoddo } from "@/components/brand";
import type { CompanyBackground } from "@/models/company/CompanyAppearance";
import { RingGrid } from "./RingGrid";

/*
 * The everyday base of every login screen (sign-in-root/spec.md § Common): on a computer a pane 520 wide on the left
 * — the ring grid on top, noddo's wordmark and slogan or the company's mark and name at the foot — and the white side
 * holding only the step; on a phone the pane becomes a slim strip on top.
 *
 * **Server-safe**, no hooks beyond the catalogue: the company's accent and background arrive on `<html>` with the
 * HTML (COMPANY_ADDRESSES.md § 4), so nothing repaints after the first frame. noddo's own screens (the root,
 * registration) are always Wine, whatever the host.
 */

export type AuthBrand =
  | { kind: "noddo" }
  | {
      kind: "company";
      name: string;
      logoUrl?: string | null;
      /** The company's background from Appearance: its colour (the default) or Light. */
      background?: CompanyBackground;
      /** The logo's colours: on a Light pane the nodding rings take them when there are several. */
      logoColors?: string[];
    };

type Props = {
  brand: AuthBrand;
  /** The back arrow, top-left of the white side — one screen back. */
  back?: ReactNode;
  /** A form as tall as a phone's screen: it starts at the top there instead of in the middle. */
  long?: boolean;
  /**
   * The invitation's pane (sign-in-invitation G1–G4): the company small on top, a 6 × 3 grid, and a two-tone "Welcome
   * to Acme, Anna." at the foot — the invitation must not look like the free trial, nor like the everyday login.
   */
  welcome?: { name: string | null };
  children: ReactNode;
};

/** Over this many characters a company's name drops to the smaller size on the pane (the designers' ~16). */
const LONG_NAME = 16;

function CompanyMark({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <span className="auth-company-mark" aria-hidden="true">
      {logoUrl ? (
        // A backend-hosted upload of unknown size; next/image would need a remote pattern for the API origin.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" />
      ) : (
        (name.trim()[0] ?? "").toUpperCase()
      )}
    </span>
  );
}

function Company({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="auth-company" data-long={name.length > LONG_NAME}>
      <CompanyMark name={name} logoUrl={logoUrl} />
      <span className="auth-company-name">{name}</span>
    </div>
  );
}

function Slogan() {
  const t = useTranslations("auth");
  return <p className="auth-slogan">{t.rich("pane.slogan", { em: (chunks) => <span>{chunks}</span> })}</p>;
}

function Welcome({ company, name }: { company: string; name: string | null }) {
  const t = useTranslations("auth");
  return (
    <p className="auth-welcome">
      {name
        ? t.rich("invite.paneWelcome", { company, name, br: () => <br />, em: (c) => <span>{c}</span> })
        : t.rich("invite.paneWelcomeNoName", { company, br: () => <br /> })}
    </p>
  );
}

/**
 * The nodding rings' colours on a Light pane (sign-in-appearance § "Light"): the logo's, when it has several; else
 * none, and the rings take the company colour from the stylesheet.
 */
const hotColorsOf = (brand: AuthBrand): string[] | undefined =>
  brand.kind === "company" && brand.background === "LIGHT" && (brand.logoColors?.length ?? 0) >= 2
    ? brand.logoColors
    : undefined;

export function AuthSplit({ brand, back, long = false, welcome, children }: Props) {
  const t = useTranslations("common");
  const background = brand.kind === "company" ? brand.background ?? "COLOR" : "COLOR";
  const onLight = brand.kind === "company" && background === "LIGHT";
  const hotColors = hotColorsOf(brand);
  return (
    <div
      className="auth-split"
      data-brand={brand.kind}
      data-background={background.toLowerCase()}
      data-long={long}
    >
      {welcome && brand.kind === "company" ? (
        <aside className="auth-pane" data-variant="invitation">
          <Company name={brand.name} logoUrl={brand.logoUrl} />
          <RingGrid layout="invitation" hotColors={hotColors} />
          <div className="auth-pane-foot">
            <Welcome company={brand.name} name={welcome.name} />
            <span className="auth-powered">
              {t("brand.poweredBy")}
              <NoddoWordmark tone={onLight ? "ink" : "mono"} height={15} />
            </span>
          </div>
        </aside>
      ) : (
      <aside className="auth-pane">
        <RingGrid layout="pane" hotColors={hotColors} />
        <div className="auth-pane-foot">
          {brand.kind === "noddo" ? (
            <>
              <NoddoWordmark tone="white" height={44} />
              <Slogan />
            </>
          ) : (
            <>
              <Company name={brand.name} logoUrl={brand.logoUrl} />
              <span className="auth-powered">
                {t("brand.poweredBy")}
                <NoddoWordmark tone={onLight ? "ink" : "mono"} height={15} />
              </span>
            </>
          )}
        </div>
      </aside>
      )}

      <header className="auth-strip">
        {brand.kind === "noddo" ? (
          <NoddoWordmark tone="white" height={24} />
        ) : (
          <Company name={brand.name} logoUrl={brand.logoUrl} />
        )}
        <RingGrid layout="strip" hotColors={hotColors} />
      </header>

      <main className="auth-main">
        <div className="auth-main-top">{back}</div>
        <div className="auth-main-mid">
          <div className="auth-step">{children}</div>
        </div>
        {brand.kind === "company" && (
          <div className="auth-main-foot md:hidden">
            <PoweredByNoddo />
          </div>
        )}
      </main>
    </div>
  );
}
