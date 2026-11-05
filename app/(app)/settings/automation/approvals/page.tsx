"use client";

import { useTranslations } from "next-intl";
import { ComingSoonSettingsPage } from "@/components/modules/settings/components/ComingSoonSettingsPage";

export default function ApprovalsSettingsPage() {
  const t = useTranslations("automations");
  return <ComingSoonSettingsPage title={t("comingSoon.approvals")} />;
}
