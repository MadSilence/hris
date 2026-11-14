"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";
import { accentAttributes } from "@/lib/theme/accent";
import { AppPreview, EmailPreview, LoginPreview, type PreviewProps } from "./AppearancePreviews";

export type StageTab = "app" | "login" | "email";

const TABS: StageTab[] = ["app", "login", "email"];

/** The quiet ring grid behind the previews (#DADADF, the nodding ring in the accent) — neutral, so the colour on
 * the previews is the only colour. */
function StageRings() {
  const rings = [];
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 14; col++) {
      const hot = row === 1 && col === 11;
      rings.push(<circle key={`${col}-${row}`} className={hot ? "hot" : undefined} cx={36 + col * 74} cy={36 + row * 74 + (hot ? 7 : 0)} r={17} strokeWidth={6} />);
    }
  }
  return (
    <svg aria-hidden className="appearance-stage-rings pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMinYMin slice">
      {rings}
    </svg>
  );
}

type Props = PreviewProps & {
  /** The colour being tried; the stage is an island in it (DESIGN_SYSTEM § 2), the rest of the page keeps the saved one. */
  accent: string | null;
  draft: boolean;
  address: string;
};

/**
 * The stage (sign-in-appearance § Layout): Mist, radius 32 on its left corners, a quiet ring grid; pills on top —
 * Inside noddo · Login page · Email — "Not saved yet" while there is a draft, the picked preview centred, and the foot.
 */
export function AppearanceStage({ accent, draft, address, ...preview }: Props) {
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
      className="appearance-stage flex min-h-0 flex-col"
    >
      <StageRings />

      <div className="relative flex items-center justify-between gap-4 px-8 pt-7">
        <div role="tablist" aria-label={t("region")} className="flex gap-1.5">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "h-[34px] rounded-pill px-4 text-label transition-colors duration-(--duration-hover)",
                tab === key ? "bg-accent text-on-accent" : "bg-card text-secondary hover:text-primary",
              )}
            >
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
        {draft ? (
          <span className="rounded-pill bg-card px-3 py-1 text-label text-secondary shadow-raised">{t("draft")}</span>
        ) : null}
      </div>

      <div role="tabpanel" aria-label={t(`tabs.${tab}`)} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-8">
        <div aria-hidden className="pointer-events-none select-none">
          {tab === "app" && <AppPreview {...preview} address={address} />}
          {tab === "login" && <LoginPreview {...preview} address={address} />}
          {tab === "email" && <EmailPreview {...preview} />}
        </div>
      </div>

      <p className="relative m-0 pb-6 text-center text-label font-normal text-tertiary">{t("foot", { company: preview.companyName })}</p>
    </section>
  );
}
