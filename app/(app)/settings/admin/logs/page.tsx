"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageGate } from "@/components/auth/PageGate";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { LogsContainer } from "@/components/modules/settings/modules/logs/components/LogsContainer/LogsContainer";

const LogsSettingsPage: React.FC = () => {
  const t = useTranslations("settings.pages.logs");
  return (
    <PageGate resource="SETTINGS.AUDIT_LOG" action="VIEW">
      <div className="flex h-[calc(100svh-6rem)] flex-col gap-4 overflow-hidden">
        <div className="px-8 space-y-2 shrink-0">
          <SettingsPageHeader title={t("title")} backHref="/settings"/>

          <PageDescription className="text-body text-tertiary/90">
            {t("description")}
          </PageDescription>
        </div>

        <div className="flex-1 min-h-0">
          <LogsContainer/>
        </div>
      </div>
    </PageGate>
  );
};

export default LogsSettingsPage;
