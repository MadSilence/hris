"use client";

import SettingsCard from "@/components/modules/settings/components/SettingsCard/SettingsCard";
import { canSeeSettingsItem, settingsGroups } from "@/components/modules/settings/config/settings.config";
import { useAccess } from "@/components/auth/useAccess";
import React from "react";
import { useTranslations } from "next-intl";

const SettingsContainer: React.FC = () => {
  const { access } = useAccess();
  const t = useTranslations("settings");

  const visibleGroups = settingsGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => canSeeSettingsItem(access, item))
        .map(({ labelKey, href, external }) => ({ label: t(labelKey), href, external })),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div>
      <header className="pt-3">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h1 className="text-greeting leading-tight">{t("hub.title")}</h1>
                <p className="text-label text-tertiary mt-1">{t("hub.subtitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-6 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {visibleGroups.map((group) => (
            <SettingsCard
              key={group.id}
              title={t(group.titleKey)}
              icon={group.icon}
              items={group.items}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsContainer;
