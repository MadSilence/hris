"use client";

import { useTranslations } from "next-intl";
import React from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageGate } from "@/components/auth/PageGate";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import RolesPageContainer from "@/components/modules/settings/modules/roles/components/RolesPageContainer/RolesPageContainer";

const RolesSettingsPage: React.FC = () => {
  const t = useTranslations("settings");
  return (
    <PageGate resource="ROLES.ROLE" action="VIEW">
      <div className="flex h-[calc(100svh-6rem)] flex-col gap-4 overflow-hidden">
        <div className="px-8 space-y-2 shrink-0">
          <SettingsPageHeader title={t("pages.roles.title")} backHref="/settings"/>

          <PageDescription className="text-body text-tertiary/90">
            {t("pages.roles.description")}
          </PageDescription>
        </div>

        <div className="flex-1 min-h-0">
          <RolesPageContainer/>
        </div>
      </div>
    </PageGate>
  );
};

export default RolesSettingsPage;
