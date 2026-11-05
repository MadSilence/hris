"use client";

import { useTranslations } from "next-intl";
import { ComingSoonSettingsPage } from "@/components/modules/settings/components/ComingSoonSettingsPage";

export default function ExportSettingsPage() {
  const t = useTranslations("settings");
  return <ComingSoonSettingsPage title={t("importExport.tabs.export")} withHeader={false} />;
}
