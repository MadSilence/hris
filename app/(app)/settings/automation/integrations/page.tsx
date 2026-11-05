"use client";

import { useTranslations } from "next-intl";
import { ComingSoonSettingsPage } from "@/components/modules/settings/components/ComingSoonSettingsPage";

export default function IntegrationsSettingsPage() {
  const t = useTranslations("automations");
  return <ComingSoonSettingsPage title={t("comingSoon.integrations")} />;
}
