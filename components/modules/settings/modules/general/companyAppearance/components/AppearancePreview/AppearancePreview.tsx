"use client";

import { FC, ReactNode, useLayoutEffect, useRef, useState } from "react";

import { buildScopedBrandStyleSheet } from "@/lib/theme/brandPalette";
import { cn } from "@/public/desact/src/components/ui/utils";

/**
 * Miniatures of the two screens the Appearance settings actually change, painted with the *draft*
 * colour rather than the saved one.
 *
 * Everything here is scoped by `[data-appearance-preview]`: the page no longer repaints itself while
 * you pick, so this is the only place the unsaved colour exists. That scoping is also why the mocks
 * below paint with `brown-*` utilities and the flat `--color-*` tokens only — see
 * `buildScopedBrandStyleSheet` for why `bg-primary` and friends would silently keep the saved colour.
 */

const PREVIEW_ATTRIBUTE = "data-appearance-preview";
const PREVIEW_SCOPE = `[${PREVIEW_ATTRIBUTE}]`;

/** The mocks are drawn at desktop size and scaled down, so their proportions stay honest. */
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 800;

export const DEFAULT_LOGIN_HEADLINE = "Welcome to SixSoftware";
export const DEFAULT_LOGIN_SUBHEADLINE = "Sign in to continue to your workspace.";

type Props = {
  brandColor: string | null;
  loginImageUrl: string | null;
  headline: string;
  subheadline: string;
  companyName?: string | null;
  imageOnLogin: boolean;
  imageOnDashboard: boolean;
  sidebarContrast: boolean;
};

type ScreenProps = {
  /** Not drawn — the screens speak for themselves — but kept so the region is still announced. */
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
    <section aria-label={`${label} preview`} className="flex min-h-0 flex-1 flex-col">
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

const NAV_ITEMS = ["Home", "Inbox", "Search", "Organization", "Calendar"];

const STATS: [string, string, string][] = [
  ["Open positions", "18", "+3 this month"],
  ["Time to hire", "24d", "-2d vs. last quarter"],
  ["Offer acceptance", "87%", "+5% vs. last quarter"],
];

const TREND = [38, 52, 44, 66, 58, 78, 71, 92, 84, 96];

const PIPELINE: [string, number][] = [
  ["Applied", 100],
  ["Screening", 72],
  ["Interview", 48],
  ["Offer", 24],
];

const DashboardScreen: FC<{
  companyName: string;
  backgroundUrl: string | null;
  sidebarContrast: boolean;
}> = ({ companyName, backgroundUrl, sidebarContrast }) => (
  <div className="flex h-full w-full bg-white text-[15px] text-[var(--color-text-primary)]">
    <aside
      className={cn(
        "flex w-[248px] shrink-0 flex-col gap-8 p-4",
        sidebarContrast ? "bg-brown-700 text-white" : "border-r border-brown-200",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold text-white",
            sidebarContrast ? "bg-white/20" : "bg-brown-600",
          )}
        >
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
                "flex h-10 items-center gap-3 rounded-lg px-3",
                sidebarContrast
                  ? active
                    ? "bg-white/15 text-white"
                    : "text-white/70"
                  : active
                    ? "bg-brown-50 text-brown-700"
                    : "text-[var(--color-text-secondary)]",
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded",
                  sidebarContrast
                    ? active
                      ? "bg-white"
                      : "bg-white/40"
                    : active
                      ? "bg-brown-600"
                      : "bg-brown-300",
                )}
              />
              {item}
            </span>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto flex items-center gap-3 rounded-lg border p-2",
          sidebarContrast ? "border-white/20" : "border-brown-200",
        )}
      >
        <span className={cn("h-8 w-8 rounded-lg", sidebarContrast ? "bg-white/25" : "bg-brown-200")}/>

        <span className="flex flex-col gap-1">
          <span className={cn("h-2.5 w-24 rounded", sidebarContrast ? "bg-white/25" : "bg-brown-200")}/>
          <span className={cn("h-2 w-16 rounded", sidebarContrast ? "bg-white/15" : "bg-brown-100")}/>
        </span>
      </div>
    </aside>

    <main className="relative flex min-w-0 flex-1 flex-col">
      {backgroundUrl ? (
        <>
          {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for
              the API origin in next.config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover"/>

          {/* The dashboard is dense, dark-on-light content. Without a scrim a photograph eats it. */}
          <span className="absolute inset-0 bg-white/80"/>
        </>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col gap-6 p-10">
        <header className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-3xl font-semibold">Dashboard</h1>

            <p className="m-0 text-[var(--color-text-tertiary)]">
              Track hiring activity, team growth and open roles in one place.
            </p>
          </div>

          <span className="flex h-9 items-center rounded-[10px] bg-brown-600 px-4 text-sm font-medium text-white">
            Manage users
          </span>
        </header>

        <section className="grid grid-cols-3 gap-6">
          {STATS.map(([label, value, delta]) => (
            <div key={label} className="rounded-xl border border-brown-200 bg-white/70 p-5">
              <p className="m-0 text-sm text-[var(--color-text-tertiary)]">{label}</p>
              <p className="m-0 mt-2 text-3xl font-semibold text-brown-700">{value}</p>
              <p className="m-0 mt-1 text-xs text-[var(--color-text-quaternary)]">{delta}</p>
            </div>
          ))}
        </section>

        <section className="grid min-h-0 flex-1 grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col rounded-xl border border-brown-200 bg-white/70 p-5">
            <p className="m-0 font-medium">Recruitment trends</p>

            <div className="mt-6 flex flex-1 items-end gap-3">
              {TREND.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    "flex-1 rounded-t-md",
                    index >= TREND.length - 3 ? "bg-brown-300" : "bg-brown-500",
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-brown-200 bg-white/70 p-5">
            <p className="m-0 font-medium">Candidate pipeline</p>

            {PIPELINE.map(([stage, share]) => (
              <div key={stage} className="flex flex-col gap-2">
                <span className="flex justify-between text-sm text-[var(--color-text-tertiary)]">
                  {stage}
                  <span className="text-[var(--color-text-secondary)]">{share}%</span>
                </span>

                <span className="block h-2 w-full rounded-full bg-brown-100">
                  <span
                    className="block h-full rounded-full bg-brown-500"
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

const LoginScreen: FC<{
  backgroundUrl: string | null;
  headline: string;
  subheadline: string;
}> = ({ backgroundUrl, headline, subheadline }) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-brown-100">
    {backgroundUrl ? (
      <>
        {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for
            the API origin in next.config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover"/>
      </>
    ) : (
      <>
        <span className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-brown-300 opacity-60 blur-3xl"/>
        <span className="absolute -bottom-32 -right-16 h-[460px] w-[460px] rounded-full bg-brown-500 opacity-40 blur-3xl"/>
      </>
    )}

    <div className="relative flex w-[460px] flex-col gap-8 rounded-3xl bg-white p-12 shadow-2xl">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="m-0 text-4xl font-medium text-[var(--color-text-primary)]">{headline}</h1>

        <p className="m-0 text-[var(--color-text-tertiary)]">{subheadline}</p>
      </div>

      <div className="flex flex-col gap-5">
        {["Email address*", "Password*"].map((placeholder) => (
          <span
            key={placeholder}
            className="flex h-11 items-center rounded-[10px] border border-brown-200 px-4 text-[var(--color-text-placeholder)]"
          >
            {placeholder}
          </span>
        ))}

        <span className="flex h-11 items-center justify-center rounded-[10px] bg-brown-600 font-medium text-white">
          Sign in
        </span>
      </div>
    </div>
  </div>
);

export const AppearancePreview: FC<Props> = ({
  brandColor,
  loginImageUrl,
  headline,
  subheadline,
  companyName,
  imageOnLogin,
  imageOnDashboard,
  sidebarContrast,
}) => (
  <div
    {...{ [PREVIEW_ATTRIBUTE]: "" }}
    data-test="appearance-preview"
    className="flex min-h-0 flex-1 flex-col gap-4"
  >
    <style
      data-brand-theme-preview
      dangerouslySetInnerHTML={{ __html: buildScopedBrandStyleSheet(PREVIEW_SCOPE, brandColor) }}
    />

    <Screen label="Dashboard">
      <DashboardScreen
        companyName={companyName?.trim() || "SixSoftware"}
        backgroundUrl={imageOnDashboard ? loginImageUrl : null}
        sidebarContrast={sidebarContrast}
      />
    </Screen>

    <Screen label="Login screen">
      <LoginScreen
        backgroundUrl={imageOnLogin ? loginImageUrl : null}
        headline={headline.trim() || DEFAULT_LOGIN_HEADLINE}
        subheadline={subheadline.trim() || DEFAULT_LOGIN_SUBHEADLINE}
      />
    </Screen>
  </div>
);
