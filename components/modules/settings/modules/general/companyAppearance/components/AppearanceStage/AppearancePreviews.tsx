"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { NoddoMark, NoddoWordmark } from "@/components/brand";
import { buttonVariants } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import { AuthHeading, AuthSplit, RingGrid } from "@/components/modules/auth/layout";
import { HomeBand } from "@/components/modules/home/components";
import type { CompanyBackground } from "@/models/company/CompanyAppearance";

/*
 * The three previews of Appearance's stage (sign-in-appearance § Layout, "the stage"): drawn at their true size and
 * zoomed into a browser frame, in the draft colour the stage carries on its subtree. Decorative — the page's own
 * controls are on the left; nothing here can be focused or pressed.
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

/** A browser window: radius 14, a 24 bar with the company's address. */
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
        <span className="ml-2 truncate">{address}</span>
      </div>
      <div style={{ width: width * zoom, height: height * zoom }} className="overflow-hidden">
        <div style={{ width, height, zoom }} className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

const fakeField = "flex h-11 w-full items-center rounded-control border border-field bg-card px-3 text-body text-tertiary";

/** The company login (sign-in-company-login, RC2): the real `AuthSplit`, a still form on its white side. */
function LoginForm({ companyName }: { companyName: string }) {
  const t = useTranslations("auth");
  return (
    <>
      <AuthHeading title={t("company.title", { company: companyName })} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-label text-primary">{t("fields.email")}</span>
          <span className={fakeField} />
        </div>
        <span className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full")}>{t("company.emailCode")}</span>
        <div className="flex flex-col gap-1.5">
          <span className="flex justify-between text-label text-primary">
            {t("fields.password")}
            <span className="text-accent-text">{t("company.forgotPassword")}</span>
          </span>
          <span className={fakeField} />
        </div>
        <span className={cn(buttonVariants({ size: "lg" }), "w-full")}>{t("company.submit")}</span>
      </div>
    </>
  );
}

export function LoginPreview({ companyName, logoUrl, background, logoColors, address }: PreviewProps & { address: string }) {
  const brand = { kind: "company" as const, name: companyName, logoUrl, background, logoColors };
  const hot = background === "LIGHT" && logoColors.length >= 2 ? logoColors : undefined;
  return (
    <div className="relative pb-10 pr-16">
      <BrowserFrame address={address} width={1280} height={800} zoom={0.46}>
        <AuthSplit brand={brand}>
          <LoginForm companyName={companyName} />
        </AuthSplit>
      </BrowserFrame>

      {/* The phone (3 px frame), overlapping the computer's bottom-right corner: the pane becomes a strip on top. */}
      <div className="absolute bottom-0 right-0" style={{ width: 375 * 0.42 }}>
        <div className="appearance-phone" data-background={background.toLowerCase()} style={{ zoom: 0.42 }}>
          <div style={{ width: 375, height: 640 }} className="flex flex-col">
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

/** Inside noddo (`screens/home`, HF01 Colour top or HF02 Light top): the shell and Home's top in the draft. */
export function AppPreview({ companyName, logoUrl, background, address }: PreviewProps & { address: string }) {
  const tNav = useTranslations("navigation");
  const tHome = useTranslations("home");
  const style = background === "LIGHT" ? "LIGHT" : "COLOUR";
  const items = ["home", "inbox", "tasks", "organization", "calendar", "attendance", "processes", "reviews"] as const;
  const widgets = ["waitingOnYou", "timeOff", "whosOut", "myTasks", "thisWeek", "nextTimeOff"] as const;

  return (
    <BrowserFrame address={address} width={1280} height={800} zoom={0.5}>
      <div className="flex h-full bg-page">
        <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-divider bg-card px-3 py-5">
          <div className="mb-4 flex items-center gap-2.5 px-2">
            <LogoTile companyName={companyName} logoUrl={logoUrl} className="size-8 rounded-control text-body" />
            <span className="truncate text-card-title text-primary">{companyName}</span>
          </div>
          {items.map((item, i) => (
            <span
              key={item}
              className={cn(
                "flex h-9 items-center rounded-control px-3 text-body",
                i === 0 ? "bg-accent-muted font-medium text-accent-text" : "text-secondary",
              )}
            >
              {tNav(`menu.${item}`)}
            </span>
          ))}
        </aside>
        <main className="relative flex-1 overflow-hidden px-14 pt-16">
          <HomeBand style={style} />
          <div className="relative flex flex-col gap-8">
            <div className="flex items-end justify-between">
              <h2 className={cn("m-0 text-home-greeting", style === "COLOUR" ? "on-band" : "text-primary")}>
                {tHome("greeting.line", { part: "afternoon", hasName: "no", name: "" })}
              </h2>
              <span className={cn(buttonVariants({ variant: style === "COLOUR" ? "secondary" : "primary", size: "lg" }))}>
                {tHome("ai.actions.requestTimeOff")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {widgets.map((widget, i) => (
                <div key={widget} className="flex h-64 flex-col gap-4 rounded-widget bg-card p-6 shadow-widget">
                  <span className="text-widget-title text-primary">{tHome(`widgets.${widget}.title`)}</span>
                  <span className="h-3 w-3/4 rounded-pill bg-subtle" />
                  <span className="h-3 w-1/2 rounded-pill bg-subtle" />
                  <span className={cn("mt-auto h-10 rounded-control", i === 0 ? "w-28 bg-accent" : "w-full bg-accent-subtle")} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </BrowserFrame>
  );
}

/** The moment band's row (design/email-images.mjs `band`): six rings, the second and fifth light, the fifth dropped. */
const MAIL_RINGS = [23, 133.8, 244.6, 355.4, 466.2, 577].map((cx, i) => ({ cx, cy: i === 4 ? 32 : 23, hot: i === 1 || i === 4 }));

/** The scale the 600 px email is shown at on the stage. */
const MAIL_ZOOM = 0.72;

/**
 * The login-code email (sign-in-emails M16) as `LoginEmailLayout` writes it, at its true 600 px and zoomed: the inbox's
 * sender line (every email comes from noddo, the subject names the company), the moment band — the company's mark,
 * the two-tone heading and the row of rings cut by the band's edge — the code, "or", the wide button, the small print,
 * and the footer signed by noddo (variant C). The address is text, never a link. Light: a Gray 50 band, a white canvas,
 * a bordered card.
 */
export function EmailPreview({ companyName, logoUrl, background }: PreviewProps) {
  const t = useTranslations("settings.appearance.stage.email");
  const code = t("sampleCode");
  return (
    <div className="appearance-mail" data-background={background.toLowerCase()} style={{ width: 600 * MAIL_ZOOM }}>
      <div style={{ width: 600, zoom: MAIL_ZOOM }}>
        <div className="appearance-mail-sender">
          <NoddoMark size={40} />
          <div className="min-w-0">
            <p className="m-0 truncate">
              <strong>{t("from")}</strong> <span className="text-tertiary">{t("fromAddress")}</span>
            </p>
            <p className="m-0 truncate text-secondary">{t("subject", { code, company: companyName })}</p>
          </div>
        </div>

        <div className="appearance-mail-canvas">
          <div className="appearance-mail-card">
            <div className="appearance-mail-band">
              <div className="flex items-center gap-2.5">
                <LogoTile companyName={companyName} logoUrl={logoUrl} className="appearance-mail-tile" />
                <span className="appearance-mail-name">{companyName}</span>
              </div>
              <p className="appearance-mail-title">
                {t.rich("title", { br: () => <br />, em: (chunks) => <em>{chunks}</em> })}
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
              <div className="appearance-mail-code">
                {code.slice(0, 3)}
                <span className="pl-[18px]">{code.slice(3)}</span>
              </div>
              <div className="appearance-mail-or">
                <i />
                <span>{t("or")}</span>
                <i />
              </div>
              <span className="appearance-mail-button">
                {t("action")}
                <Icon icon={ArrowRight02Icon} size="sm" />
              </span>
              <p className="appearance-mail-note">{t("browser")}</p>
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
