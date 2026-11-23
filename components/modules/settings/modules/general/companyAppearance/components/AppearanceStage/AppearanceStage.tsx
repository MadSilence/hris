"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { accentAttributes } from "@/lib/theme/accent";
import { AppPreview, EmailPreview, LoginPreview, type PreviewProps } from "./AppearancePreviews";

export type StageTab = "app" | "login" | "email";

export const STAGE_TABS: StageTab[] = ["app", "login", "email"];

/** One quiet row of rings at the stage's bottom right (L1): five rings 44, the second in the accent, nodding. */
export function StageRings() {
  return (
    <svg aria-hidden className="appearance-stage-rings pointer-events-none" viewBox="0 0 420 128">
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} className={i === 1 ? "hot" : undefined} cx={42 + i * 84} cy={i === 1 ? 49 : 42} r={19} strokeWidth={6} />
      ))}
    </svg>
  );
}

type Props = PreviewProps & {
  /** The colour being tried; the stage is an island in it (DESIGN_SYSTEM § 2), the rest of the page keeps the saved one. */
  accent: string | null;
  draft: boolean;
  address: string;
  /** The reader's first name, for Home's greeting. */
  viewerName?: string;
};

/**
 * The stage (sign-in-appearance § Layout, L1): Mist from the column's gap to the window's right and bottom edges,
 * radius 32 on its left corners, one quiet row of rings in its corner; pills on top — Inside noddo · Login page · Email —
 * "Not saved yet" while there is a draft, the picked preview centred (it scrolls if the window is too small for it),
 * and the foot.
 */
export function AppearanceStage({ accent, draft, address, viewerName, ...preview }: Props) {
  const t = useTranslations("settings.appearance.stage");
  const [tab, setTab] = React.useState<StageTab>("app");
  const island = accentAttributes(accent);

  return (
    <section
      aria-label={t("region")}
      data-theme="light"
      data-accent={island["data-accent"]}
      data-accent-tone={island["data-accent-tone"]}
      style={island.style as React.CSSProperties | undefined}
      className="appearance-stage flex flex-col"
    >
      <StageRings />

      <div className="relative flex items-center justify-between gap-4 px-10 pt-7">
        <div role="tablist" aria-label={t("region")} className="flex gap-1.5">
          {STAGE_TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className="appearance-stage-tab transition-colors duration-(--duration-hover)"
            >
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
        {draft ? (
          <span className="appearance-draft">
            <i aria-hidden />
            {t("draft")}
          </span>
        ) : null}
      </div>

      <div role="tabpanel" aria-label={t(`tabs.${tab}`)} className="relative flex min-h-0 flex-1 overflow-auto px-10 py-8">
        <div aria-hidden className="pointer-events-none m-auto select-none">
          {tab === "app" && <AppPreview {...preview} address={address} viewerName={viewerName} />}
          {tab === "login" && <LoginPreview {...preview} address={address} />}
          {tab === "email" && <EmailPreview {...preview} />}
        </div>
      </div>

      <p className="relative m-0 px-10 pb-8 text-body font-semibold text-tertiary">{t("foot", { company: preview.companyName })}</p>
    </section>
  );
}
