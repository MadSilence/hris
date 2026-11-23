"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight02Icon, ArrowUp02Icon, Calendar03Icon, SparklesIcon } from "@hugeicons/core-free-icons";

import { NoddoWordmark } from "@/components/brand";
import { buttonVariants } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import { useDisplayLocale, useShortDates } from "@/lib/date";
import { AuthHeading, AuthOr, AuthSplit, RingGrid } from "@/components/modules/auth/layout";
import { HomeBand } from "@/components/modules/home/components";
import type { CompanyBackground } from "@/models/company/CompanyAppearance";

/*
 * The three previews of Appearance's stage (sign-in-appearance § Layout, "the stage"; the designers' AP19): drawn at
 * their true size and zoomed into a window, in the draft colour the stage carries on its subtree. Decorative — the
 * page's own controls are on the left; nothing here can be focused or pressed.
 */

export type PreviewProps = {
  companyName: string;
  logoUrl: string | null;
  background: CompanyBackground;
  logoColors: string[];
};

/** A logo without its own background always sits on white; without a logo, the company's first letter. */
function LogoTile({ companyName, logoUrl, className }: { companyName: string; logoUrl: string | null; className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden border border-divider bg-card text-accent-text", className)}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="max-h-[70%] max-w-[70%] object-contain" />
      ) : (
        <span className="font-semibold">{(companyName.trim()[0] ?? "").toUpperCase()}</span>
      )}
    </span>
  );
}

/** A browser window (L1): radius 14, a 24 bar with three dots and the company's address in a white pill. */
function BrowserFrame({ address, width, height, zoom, children }: {
  address: string;
  width: number;
  height: number;
  zoom: number;
  children: React.ReactNode;
}) {
  return (
    <div className="appearance-frame" style={{ width: width * zoom }}>
      <div className="appearance-frame-bar">
        <i />
        <i />
        <i />
        <span>{address}</span>
      </div>
      <div style={{ width: width * zoom, height: height * zoom }} className="overflow-hidden">
        <div style={{ width, height, zoom }} className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

const PROVIDER_MARKS = { GOOGLE: "/brand/providers/google.png", MICROSOFT: "/brand/providers/microsoft.png" } as const;
const PROVIDER_NAMES = { GOOGLE: "sessions.method.google", MICROSOFT: "sessions.method.microsoft" } as const;
const fakeField = "flex h-11 w-full items-center rounded-control border border-field bg-card px-3";

/**
 * The company login (sign-in-company-login, L1-Login): Continue with Google / Microsoft, "or", the email with its
 * "Email me a login code", the password with "Forgot password?", Log in and "Not your company?" — a still copy of
 * `LoginContainer`'s form, with nothing that can be pressed.
 */
function LoginForm({ companyName }: { companyName: string }) {
  const t = useTranslations("auth");
  const link = (chunks: React.ReactNode) => <span className="text-accent-text">{chunks}</span>;
  return (
    <>
      <AuthHeading title={t("company.title", { company: companyName })} />
      <div className="flex flex-col gap-3">
        {(["GOOGLE", "MICROSOFT"] as const).map((provider) => (
          <span
            key={provider}
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-control border border-field bg-card px-4.5 text-card-title font-medium text-primary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a 20 px brand file, not a photo */}
            <img src={PROVIDER_MARKS[provider]} alt="" width={20} height={20} className="block flex-none" />
            {t("company.continueWith", { provider: t(PROVIDER_NAMES[provider]) })}
          </span>
        ))}
      </div>
      <AuthOr />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-label text-primary">{t("fields.email")}</span>
          <span className={fakeField} />
          <span className="text-label text-accent-text">{t("company.emailCode")}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="flex justify-between text-label text-primary">
            {t("fields.password")}
            <span className="text-accent-text">{t("company.forgotPassword")}</span>
          </span>
          <span className={fakeField} />
        </div>
        <span className={cn(buttonVariants({ size: "lg" }), "w-full")}>{t("company.submit")}</span>
      </div>
      <p className="text-body text-secondary">{t.rich("company.notYourCompany", { link })}</p>
    </>
  );
}

/** The phone's scale and size: 375 wide, drawn 164 on the stage (L1-Login). */
const PHONE_ZOOM = 0.4375;

export function LoginPreview({ companyName, logoUrl, background, logoColors, address }: PreviewProps & { address: string }) {
  const brand = { kind: "company" as const, name: companyName, logoUrl, background, logoColors };
  const hot = background === "LIGHT" && logoColors.length >= 2 ? logoColors : undefined;
  return (
    <div className="relative pb-[141px] pr-10">
      <BrowserFrame address={address} width={1280} height={800} zoom={PHONE_ZOOM}>
        <AuthSplit brand={brand}>
          <LoginForm companyName={companyName} />
        </AuthSplit>
      </BrowserFrame>

      {/* The phone, overlapping the computer's bottom-right corner: the pane becomes a strip on top. */}
      <div className="absolute bottom-0 right-0" style={{ width: 375 * PHONE_ZOOM + 6 }}>
        <div className="appearance-phone" data-background={background.toLowerCase()}>
          <div style={{ width: 375, height: 812, zoom: PHONE_ZOOM }} className="flex flex-col">
            <header className="auth-strip">
              <div className="auth-company" data-long={companyName.length > 16}>
                <span className="auth-company-mark" aria-hidden="true">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="" />
                  ) : (
                    (companyName.trim()[0] ?? "").toUpperCase()
                  )}
                </span>
                <span className="auth-company-name">{companyName}</span>
              </div>
              <RingGrid layout="strip" hotColors={hot} />
            </header>
            <div className="flex flex-1 flex-col gap-7 px-5 pt-8">
              <LoginForm companyName={companyName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The scale Home is shown at: 1280 × 800 into a 604 × 402 window (L1-App). */
const APP_ZOOM = 0.472;

const card = "flex flex-col gap-3 overflow-hidden rounded-widget bg-card p-6 shadow-widget";

function WidgetHead({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="truncate text-widget-title text-primary">{title}</span>
      {link ? <span className="shrink-0 text-label text-accent-text">{link}</span> : null}
    </div>
  );
}

function Initials({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-pill bg-tag-plum-bg text-hint font-semibold text-tag-plum-text", className)}>
      {children}
    </span>
  );
}

const initialsOf = (name: string) =>
  name.split(/[\s·]+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");

/**
 * Inside noddo (L1-App / L2-Teal-App / L7-Light-App): the app's frame and Home's top as drawn — the greeting row with
 * the AI box, then Waiting on you, Time off, Next time off and To sign, Who's out and This week, with sample people.
 * The sidebar is drawn as quiet bars, its active item in the accent. *My time* is not on Home and not here (AQ-10).
 */
export function AppPreview({ companyName, logoUrl, background, address, viewerName }: PreviewProps & { address: string; viewerName?: string }) {
  const t = useTranslations("settings.appearance.stage.app");
  const tHome = useTranslations("home");
  const dates = useShortDates();
  const locale = useDisplayLocale();
  const style = background === "LIGHT" ? "LIGHT" : "COLOUR";
  const onBand = style === "COLOUR";
  const name = viewerName?.trim() || undefined;
  // A fixed sample week, so the server and the browser write the same thing.
  const week = [9, 10, 11, 12, 13].map((day) => new Date(2026, 10, day));
  const bars = [44, 35, 52, 40, 48, 36, 46, 34, 42];

  return (
    <BrowserFrame address={address} width={1280} height={800} zoom={APP_ZOOM}>
      <div className="flex h-full bg-subtle">
        <nav className="flex w-[214px] shrink-0 flex-col gap-1 border-r border-divider px-6 py-8">
          <div className="mb-5 flex items-center gap-2">
            <LogoTile companyName={companyName} logoUrl={logoUrl} className="size-7 rounded-control text-hint" />
            <span className="h-2 w-14 rounded-pill bg-canvas-dot" />
          </div>
          {bars.map((width, i) => (
            <span key={i} className={cn("flex h-7 items-center gap-5 rounded-control px-2", i === 0 && "bg-accent-muted")}>
              <span className={cn("size-4 rounded-glyph", i === 0 ? "bg-accent-ring" : "bg-canvas-dot")} />
              <span className={cn("h-1.5 rounded-pill", i === 0 ? "bg-accent-ring" : "bg-canvas-dot")} style={{ width: width * 1.6 }} />
            </span>
          ))}
        </nav>

        <main className="relative flex-1 overflow-hidden bg-page px-12 pt-12">
          <HomeBand style={style} />
          <div className="relative flex flex-col gap-5">
            <div className="flex justify-end">
              <span
                className={cn(
                  "flex h-11 items-center gap-2 rounded-pill border pr-3.5 pl-1 text-home-pill",
                  onBand ? "band-glass on-band" : "border-divider bg-card text-primary",
                )}
              >
                <Initials className="size-[34px] text-label">{initialsOf(name ?? companyName)}</Initials>
                {tHome("header.myProfile")}
              </span>
            </div>
            <div className="flex items-end justify-between gap-10">
              <div className="flex min-w-0 flex-col gap-2.5">
                <p className={cn("m-0 text-body font-medium", onBand ? "on-band-tint" : "text-accent-text")}>
                  {dates.long("2026-11-10", { weekday: true, hideYear: true })}
                </p>
                <h2 className={cn("m-0 text-home-greeting", onBand ? "on-band" : "text-primary")}>
                  {tHome("greeting.line", { part: "afternoon", hasName: name ? "yes" : "no", name: name ?? "" })}
                </h2>
              </div>
              <span className="flex h-12 w-[462px] shrink-0 items-center gap-2.5 rounded-ai-box bg-card pr-2 pl-4.5 shadow-ai-box">
                <Icon icon={SparklesIcon} size="md" className="shrink-0 text-accent" />
                <span className="flex-1 truncate text-card-title font-normal text-tertiary">{tHome("ai.placeholder")}</span>
                <span className="rounded-pill border border-field px-2.5 text-hint font-medium text-secondary">{tHome("ai.chips.requestTimeOff")}</span>
                <span className="flex size-9 items-center justify-center rounded-tint bg-accent text-on-accent">
                  <Icon icon={ArrowUp02Icon} size="sm" />
                </span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-5">
              <section className={cn(card, "col-span-2 h-[305px]")}>
                <WidgetHead title={tHome("widgets.waitingOnYou.title")} link={tHome("waitingOnYou.inbox")} />
                <span className="text-label font-semibold text-accent-text">{tHome("waitingOnYou.counter", { at: 1, count: 3 })}</span>
                <div className="flex flex-1 flex-col gap-2 rounded-tint border border-divider p-5 shadow-deck">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-tint bg-accent-subtle text-primary">
                      <Icon icon={Calendar03Icon} size="sm" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-body font-semibold text-primary">{t("requester")}</span>
                      <span className="text-label font-normal text-tertiary">{t("wants")}</span>
                    </span>
                  </div>
                  <span className="text-deck-line text-primary">{t("dates")}</span>
                  <div className="mt-auto flex justify-end gap-2">
                    <span className={buttonVariants({ variant: "secondary", size: "sm" })}>{tHome("waitingOnYou.decline")}</span>
                    <span className={buttonVariants({ size: "sm" })}>{tHome("waitingOnYou.approve")}</span>
                  </div>
                </div>
              </section>

              <section className={cn(card, "h-[305px]")}>
                <WidgetHead title={tHome("widgets.timeOff.title")} />
                <span className="text-home-greeting font-normal text-primary">{t("balance")}</span>
                <span className="text-body text-secondary">{t("balanceUnit")}</span>
                <span className={cn(buttonVariants({ size: "sm" }), "mt-auto w-full")}>{tHome("ai.actions.requestTimeOff")}</span>
              </section>

              <div className="flex h-[305px] flex-col gap-5">
                <section className={cn(card, "flex-1")}>
                  <WidgetHead title={tHome("widgets.nextTimeOff.title")} />
                  <span className="flex items-baseline gap-2">
                    <span className="text-number text-primary">{t("countdown")}</span>
                    <span className="text-label font-normal text-secondary">{t("countdownUnit")}</span>
                  </span>
                </section>
                <section className={cn(card, "flex-1")}>
                  <WidgetHead title={tHome("widgets.toSign.title")} />
                  <span className="flex items-baseline gap-2">
                    <span className="text-number text-primary">{t("toSign")}</span>
                    <span className="text-label font-normal text-secondary">{t("toSignUnit")}</span>
                  </span>
                </section>
              </div>

              <section className={cn(card, "col-span-2 h-[305px]")}>
                <WidgetHead title={tHome("widgets.whosOut.title")} />
                <div className="grid grid-cols-5 gap-1">
                  {week.map((day, i) => (
                    <span key={i} className={cn("flex flex-col items-center text-hint", i === 1 ? "font-semibold text-primary" : "text-tertiary")}>
                      {day.toLocaleDateString(locale, { weekday: "short" })}
                      <span className="text-card-title">{day.getDate()}</span>
                    </span>
                  ))}
                </div>
                {[
                  { text: t("outRuta"), className: "col-span-3 col-start-1 bg-tag-ocean-bg text-tag-ocean-text" },
                  { text: t("outLena"), className: "col-span-2 col-start-4 bg-tag-indigo-bg text-tag-indigo-text" },
                  { text: t("outMarius"), className: "col-span-5 col-start-1 bg-tag-plum-bg text-tag-plum-text" },
                ].map((pill) => (
                  <div key={pill.text} className="grid grid-cols-5">
                    <span className={cn("flex h-7 items-center gap-1.5 truncate rounded-pill pr-3 pl-1 text-label", pill.className)}>
                      <Initials className="size-5 bg-card">{initialsOf(pill.text)}</Initials>
                      {pill.text}
                    </span>
                  </div>
                ))}
              </section>

              <section className={cn(card, "col-span-2 h-[305px]")}>
                <WidgetHead title={tHome("widgets.thisWeek.title")} />
                <span className="text-deck-line text-primary">{t("birthday")}</span>
                {[t("anniversary"), t("joiner")].map((line) => (
                  <span key={line} className="flex items-center gap-2 text-body text-secondary">
                    <Initials>{initialsOf(line)}</Initials>
                    {line}
                  </span>
                ))}
              </section>
            </div>
          </div>
        </main>
      </div>
    </BrowserFrame>
  );
}

/** The moment band's row (design/email-images.mjs `band`): six rings, the second and fifth light, the fifth dropped. */
const MAIL_RINGS = [23, 133.8, 244.6, 355.4, 466.2, 577].map((cx, i) => ({ cx, cy: i === 4 ? 32 : 23, hot: i === 1 || i === 4 }));

/** The scale the 600 px email is shown at on the stage: 416 wide (L1-Mail). */
const MAIL_ZOOM = 416 / 600;

/**
 * The invitation (sign-in-emails M2, the owner's R19 / A16) as hris-api writes it, at its true 600 px and zoomed into a
 * mail window: the moment band — the company's mark, "You’re invited / to join Acme" and the row of rings cut by the
 * band's edge — the body, "Join Acme" with its arrow, the small print, and the footer signed by noddo. The address is
 * text, never a link. No postal address in the footer: the product has none (AQ-10). Light: a Gray 50 band, a white
 * canvas, a bordered card.
 */
export function EmailPreview({ companyName, logoUrl, background }: PreviewProps) {
  const t = useTranslations("settings.appearance.stage.email");
  return (
    <div className="appearance-mail" data-background={background.toLowerCase()} style={{ width: 416 + 44 }}>
      <div style={{ width: 600, zoom: MAIL_ZOOM }}>
        <div className="appearance-mail-canvas">
          <div className="appearance-mail-card">
            <div className="appearance-mail-band">
              <div className="flex items-center gap-2.5">
                <LogoTile companyName={companyName} logoUrl={logoUrl} className="appearance-mail-tile" />
                <span className="appearance-mail-name">{companyName}</span>
              </div>
              <p className="appearance-mail-title">
                {t.rich("title", { company: companyName, br: () => <br />, em: (chunks) => <em>{chunks}</em> })}
              </p>
              <svg className="appearance-mail-rings" viewBox="0 0 600 36" width={520} height={31.2} aria-hidden="true">
                {MAIL_RINGS.map((ring) => (
                  <circle key={ring.cx} className={ring.hot ? "hot" : undefined} cx={ring.cx} cy={ring.cy} r={20} strokeWidth={6} />
                ))}
              </svg>
            </div>

            <div className="appearance-mail-body">
              <p className="m-0">
                {t.rich("body", {
                  company: companyName,
                  email: t("sampleEmail"),
                  b: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              <span className="appearance-mail-button">
                {t("action", { company: companyName })}
                <Icon icon={ArrowRight02Icon} size="sm" />
              </span>
              <p className="appearance-mail-small">{t("note")}</p>
            </div>
          </div>

          <div className="appearance-mail-footer">
            <NoddoWordmark height={26} className="mx-auto mb-2.5" />
            <p className="m-0 text-secondary">{t("sentBy", { company: companyName })}</p>
            <p className="appearance-mail-reason">{t("reason", { company: companyName })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
