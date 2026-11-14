"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Alert02Icon, Clock01Icon, Rocket01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import { useCompanyState } from "@/components/modules/demo/hooks";

export const GO_LIVE_HREF = "/settings/admin/subscription";

/**
 * The company's state on every page (DEMO_PLAN.md 4.2, the owner's B1): a demo says so and offers *Go live*; a trial
 * counts its days; a company whose trial ended says it is read-only. A page banner is neutral — it states the state of
 * the whole app (SPEC § 13.7). The button is for whoever may go live (`SETTINGS.BILLING`); everybody else is told whom
 * to ask. Nothing shows for a company that is live.
 */
export function DemoBanner() {
  const t = useTranslations("demo.banner");
  const { access } = useAccess();
  const { data: state } = useCompanyState();
  if (!state) return null;

  const mayGoLive = canAccess({ access, resource: "SETTINGS.BILLING", action: "MANAGE" });
  const days = state.trialDaysLeft ?? 0;
  const goLive = state.goLive;

  let text: string | null = null;
  let icon = Rocket01Icon;
  let action: "goLive" | "open" | null = "goLive";
  if (goLive === "REQUESTED") {
    text = t("requested");
    action = "open";
  } else if (goLive === "ACTIVATED" || goLive === "RUNNING") {
    text = t("running");
    action = "open";
  } else if (goLive === "FAILED") {
    text = t("failed");
    icon = Alert02Icon;
    action = "open";
  } else if (goLive === "DONE") {
    text = null;
  } else if (state.status === "READ_ONLY") {
    text = t("readOnly");
    icon = Alert02Icon;
  } else if (state.isDemo) {
    text = state.status === "TRIALING" ? t("demo", { days }) : t("demoNoTrial");
  } else if (state.status === "TRIALING") {
    text = t("trial", { days });
    icon = Clock01Icon;
  }
  if (!text) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-4 border-b border-divider bg-mist px-6 py-3 text-body text-primary"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon icon={icon} size="sm" className="shrink-0" />
        <span className="min-w-0">
          {text}
          {!mayGoLive && action === "goLive" && <span className="text-tertiary"> {t("askOwner")}</span>}
        </span>
      </div>
      {mayGoLive && action && (
        <Button asChild variant="secondary" size="sm">
          <Link href={GO_LIVE_HREF}>{action === "goLive" ? t("goLive") : t("open")}</Link>
        </Button>
      )}
    </div>
  );
}
