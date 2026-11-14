import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { NoddoWordmark } from "@/components/brand";
import { RingGrid } from "./RingGrid";

/*
 * The first-experience base (sign-in-root § Common): registration (B) and the owner's setup (S). The form on the left
 * under noddo's wordmark, a rounded Wine card on the right with the slogan and the orbit — a still Rose ring at the
 * centre, five labelled rings on two dashed circles that turn slowly in opposite directions. noddo's own, so Wine
 * whatever the host. On a phone: a Wine strip with the wordmark and a row of rings, then the form.
 */

function Orbit() {
  const t = useTranslations("auth");
  const satellites = [
    { cx: 250, cy: 60, lx: 250, ly: 34, anchor: "middle", label: t("orbit.workflows") },
    { cx: 407, cy: 174, lx: 433, ly: 179, anchor: "start", label: t("orbit.approvals") },
    { cx: 347, cy: 358, lx: 373, ly: 363, anchor: "start", label: t("orbit.timeOff") },
    { cx: 153, cy: 358, lx: 127, ly: 363, anchor: "end", label: t("orbit.onboarding") },
    { cx: 93, cy: 174, lx: 67, ly: 179, anchor: "end", label: t("orbit.reviews") },
  ] as const;
  return (
    <svg className="auth-orbit" viewBox="0 0 500 440" aria-hidden="true">
      <circle className="auth-orbit-outer" cx="250" cy="225" r="165" />
      <circle className="auth-orbit-inner" cx="250" cy="225" r="96" />
      <circle className="auth-orbit-centre" cx="250" cy="225" r="50" />
      {satellites.map((s) => (
        <g key={s.label}>
          <circle className="auth-orbit-ring" cx={s.cx} cy={s.cy} r="13" />
          <text className="auth-orbit-label" x={s.lx} y={s.ly} textAnchor={s.anchor}>{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function AuthFirstExperience({ back, long = true, children }: { back?: ReactNode; long?: boolean; children: ReactNode }) {
  const t = useTranslations("auth");
  return (
    <div className="auth-first" data-long={long}>
      <header className="auth-first-strip">
        <NoddoWordmark tone="white" height={24} />
        <RingGrid layout="strip" />
      </header>
      <main className="auth-first-main">
        <div className="auth-first-top">
          {back}
          <span className="auth-first-wordmark"><NoddoWordmark tone="ink" height={28} /></span>
        </div>
        <div className="auth-main-mid">
          <div className="auth-step">{children}</div>
        </div>
      </main>
      <aside className="auth-first-card">
        <h2 className="auth-first-slogan">{t.rich("pane.sloganLines", { br: () => <br />, em: (c) => <span>{c}</span> })}</h2>
        <p className="auth-first-sub">{t("pane.approveOnce")}</p>
        <Orbit />
      </aside>
    </div>
  );
}
