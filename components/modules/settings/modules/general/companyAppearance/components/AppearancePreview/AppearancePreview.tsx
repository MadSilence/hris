"use client";

import { FC, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { accentAttributes } from "@/lib/theme/accent";
import {
  DEFAULT_LOGIN_HEADLINE_KEY,
  DEFAULT_LOGIN_SUBHEADLINE_KEY,
} from "@/models/company/loginPageDefaults";
import { cn } from "@/lib/cn";
import { AuthCard } from "@/components/modules/auth/components/AuthScreen";
import { PoweredByNoddo } from "@/components/brand";

/**
 * Miniatures of the two screens the Appearance settings actually change, painted with the *draft* colour
 * rather than the saved one.
 *
 * The preview is an island of the design system: it carries its own `data-theme` and accent
 * (`lib/theme/accent.ts`), and tokens.css re-declares every accent role on such an element, so the mocks
 * below paint with the ordinary role utilities (`bg-accent`, `text-accent-text`) and wear the unsaved colour
 * while the page around them keeps the saved one.
 */

/** The mocks are drawn at desktop size and scaled down, so their proportions stay honest. */
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 800;

type Props = {
  accent: string | null;
  loginImageUrl: string | null;
  headline: string;
  subheadline: string;
  companyName?: string | null;
  /** The company's logo, which heads the sign-in card. */
  logoUrl?: string | null;
  imageOnLogin: boolean;
  imageOnDashboard: boolean;
};

type ScreenProps = {
  /** Not drawn — the screens speak for themselves — but kept so the region is still announced. The whole name. */
  label: string;
  children: ReactNode;
};

/**
 * Fits a fixed-size mock into whatever box the layout leaves for it. No frame, border or backdrop:
 * the screen is the preview, and anything drawn around it would read as part of the design.
 */
const Screen: FC<ScreenProps> = ({ label, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Measured once by hand before observing: a ResizeObserver only reports on a rendered frame, so a
    // tab that mounts while hidden would otherwise hold the mock at scale 0 until it is looked at.
    const measure = (width: number, height: number) =>
      setBox((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );

    const rect = element.getBoundingClientRect();
    measure(rect.width, rect.height);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      measure(width, height);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale =
    box.width > 0 && box.height > 0
      ? Math.min(box.width / DESIGN_WIDTH, box.height / DESIGN_HEIGHT)
      : 0;

  return (
    <section aria-label={label} className="flex min-h-0 flex-1 flex-col">
      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden">
        {scale > 0 ? (
          <div
            aria-hidden
            className="absolute left-0 top-0 origin-top-left overflow-hidden"
            style={{
              width: DESIGN_WIDTH,
              height: DESIGN_HEIGHT,
              transform: `translate(${(box.width - DESIGN_WIDTH * scale) / 2}px, ${
                (box.height - DESIGN_HEIGHT * scale) / 2
              }px) scale(${scale})`,
            }}
          >
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
};

/** The mock's words are catalogue keys (`settings.appearance.preview.*`), so the miniature speaks the reader's language. */
const NAV_ITEMS = ["nav.home", "nav.inbox", "nav.search", "nav.organization", "nav.calendar"] as const;

const STATS = [
  { name: "stats.openPositions.label", value: "stats.openPositions.value", delta: "stats.openPositions.delta" },
  { name: "stats.timeToHire.label", value: "stats.timeToHire.value", delta: "stats.timeToHire.delta" },
  { name: "stats.offerAcceptance.label", value: "stats.offerAcceptance.value", delta: "stats.offerAcceptance.delta" },
] as const;

const TREND = [38, 52, 44, 66, 58, 78, 71, 92, 84, 96];

const PIPELINE = [
  ["pipeline.applied", 100],
  ["pipeline.screening", 72],
  ["pipeline.interview", 48],
  ["pipeline.offer", 24],
] as const;

const DashboardScreen: FC<{
  companyName: string;
  backgroundUrl: string | null;
}> = ({ companyName, backgroundUrl }) => {
  const t = useTranslations("settings.appearance.preview");
  return (
  <div className="flex h-full w-full bg-page text-card-title text-primary">
    {/* The sidebar of SPEC § 13.6: the subtle surface, the company's tile, the active item in the muted accent. */}
    <aside className="flex w-[240px] shrink-0 flex-col gap-8 border-r border-sidebar-border bg-sidebar p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-control bg-accent text-body font-semibold text-on-accent">
          {companyName.slice(0, 1).toUpperCase()}
        </span>

        <span className="truncate font-semibold">{companyName}</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item, index) => {
          const active = index === 0;

          return (
            <span
              key={item}
              className={cn(
                "flex h-10 items-center gap-3 rounded-control px-3",
                active
                  ? "bg-sidebar-item-active text-sidebar-item-active-text"
                  : "text-sidebar-text",
              )}
            >
              <span className={cn("size-4 rounded-tag", active ? "bg-accent" : "bg-strong")} />
              {t(item)}
            </span>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-control border border-divider p-2">
        <span className="size-8 rounded-pill bg-divider" />

        <span className="flex flex-col gap-1">
          <span className="h-2.5 w-24 rounded-control bg-divider" />
          <span className="h-2 w-16 rounded-control bg-mist" />
        </span>
      </div>
    </aside>

    <main className="relative flex min-w-0 flex-1 flex-col">
      {backgroundUrl ? (
        <>
          {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for
              the API origin in next.config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />

          {/* The dashboard is dense, dark-on-light content. Without a scrim a photograph eats it. */}
          <span className="absolute inset-0 bg-card/80" />
        </>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col gap-6 p-10">
        <header className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-page-title">{t("dashboard.title")}</h1>

            <p className="m-0 text-tertiary">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <span className="flex h-9 items-center rounded-control bg-accent px-4 text-body font-medium text-on-accent">
            {t("dashboard.action")}
          </span>
        </header>

        <section className="grid grid-cols-3 gap-6">
          {STATS.map(({ name, value, delta }) => (
            <div key={name} className="rounded-card border border-divider bg-card/70 p-5">
              <p className="m-0 text-body text-tertiary">{t(name)}</p>
              <p className="m-0 mt-2 text-page-title text-secondary">{t(value)}</p>
              <p className="m-0 mt-1 text-hint text-tertiary">{t(delta)}</p>
            </div>
          ))}
        </section>

        <section className="grid min-h-0 flex-1 grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col rounded-card border border-divider bg-card/70 p-5">
            <p className="m-0 font-medium">{t("dashboard.trends")}</p>

            <div className="mt-6 flex flex-1 items-end gap-3">
              {TREND.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    "flex-1 rounded-t-control",
                    index >= TREND.length - 3 ? "bg-strong" : "bg-accent",
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-card border border-divider bg-card/70 p-5">
            <p className="m-0 font-medium">{t("dashboard.pipeline")}</p>

            {PIPELINE.map(([stage, share]) => (
              <div key={stage} className="flex flex-col gap-2">
                <span className="flex justify-between text-body text-tertiary">
                  {t(stage)}
                  <span className="text-secondary">{share}%</span>
                </span>

                <span className="block h-2 w-full rounded-pill bg-mist">
                  <span
                    className="block h-full rounded-pill bg-accent"
                    style={{ width: `${share}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  </div>
  );
};

const LoginScreen: FC<{
  backgroundUrl: string | null;
  logoUrl: string | null;
  headline: string;
  subheadline: string;
}> = ({ backgroundUrl, logoUrl, headline, subheadline }) => {
  const t = useTranslations("settings.appearance.preview");
  return (
  <div className="relative flex h-full w-full flex-col items-center overflow-hidden bg-mist">
    {backgroundUrl && (
      <>
        {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for
            the API origin in next.config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </>
    )}

    <div className="relative flex w-full flex-1 items-center justify-center">
      <AuthCard logoUrl={logoUrl} className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="m-0 text-greeting text-primary">{headline}</h1>

          <p className="m-0 text-tertiary">{subheadline}</p>
        </div>

        <div className="flex flex-col gap-5">
          {[t("login.email"), t("login.password")].map((placeholder) => (
            <span
              key={placeholder}
              className="flex h-11 items-center rounded-control border border-field px-4 text-tertiary"
            >
              {placeholder}
            </span>
          ))}

          <span className="flex h-11 items-center justify-center rounded-control bg-accent font-medium text-on-accent">
            {t("login.signIn")}
          </span>
        </div>

        <p className="m-0 text-center text-body text-accent-text">{t("login.forgot")}</p>
      </AuthCard>
    </div>

    <span className={cn("relative mb-6", backgroundUrl && "rounded-pill bg-card px-3 py-1.5")}>
      <PoweredByNoddo />
    </span>
  </div>
  );
};

export const AppearancePreview: FC<Props> = ({
  accent,
  loginImageUrl,
  headline,
  subheadline,
  companyName,
  logoUrl,
  imageOnLogin,
  imageOnDashboard,
}) => {
  const island = accentAttributes(accent);
  const t = useTranslations("settings.appearance.preview");
  const tAuth = useTranslations("auth");

  return (
    <div
      data-theme="light"
      data-accent={island["data-accent"]}
      style={island.style}
      data-test="appearance-preview"
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <Screen label={t("dashboardRegion")}>
        <DashboardScreen
          companyName={companyName?.trim() || t("yourCompany")}
          backgroundUrl={imageOnDashboard ? loginImageUrl : null}
        />
      </Screen>

      <Screen label={t("loginRegion")}>
        <LoginScreen
          backgroundUrl={imageOnLogin ? loginImageUrl : null}
          logoUrl={logoUrl ?? null}
          headline={headline.trim() || tAuth(DEFAULT_LOGIN_HEADLINE_KEY)}
          subheadline={subheadline.trim() || tAuth(DEFAULT_LOGIN_SUBHEADLINE_KEY)}
        />
      </Screen>
    </div>
  );
};
