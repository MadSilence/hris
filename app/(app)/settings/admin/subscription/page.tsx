"use client";

import { useTranslations } from "next-intl";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageGate } from "@/components/auth/PageGate";
import { GoLiveContainer } from "@/components/modules/demo";

/**
 * Settings → Subscription: today, going live from the demo or the trial (DEMO_PLAN.md 6.6); the plan and payment join
 * it with Stripe (GO_TO_MARKET_DESIGN.md § 5.2). Behind `SETTINGS.BILLING` MANAGE (P4).
 */
export default function SubscriptionSettingsPage() {
  const t = useTranslations("demo.goLive");
  return (
    <PageGate resource="SETTINGS.BILLING" action="MANAGE">
      <div className="space-y-6 px-8">
        <SettingsPageHeader title={t("title")} backHref="/settings" />
        <GoLiveContainer />
      </div>
    </PageGate>
  );
}
