"use client";

import { useTranslations } from "next-intl";
import { ComingSoonSettingsPage } from "@/components/modules/settings/components/ComingSoonSettingsPage";

export default function SubscriptionSettingsPage() {
  const t = useTranslations("settings");
  return <ComingSoonSettingsPage title={t("menu.items.subscription")} />;
}
