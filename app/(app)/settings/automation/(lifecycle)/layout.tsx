"use client";

import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { SentIcon, UserAdd01Icon, UserRemove01Icon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess, ResourceCode } from "@/models/access";
import { Tabs, TabsList, TabsTrigger } from "@/components/desact/tabs";

type Tab = {
  id: string;
  labelKey: `lifecycleSettings.${"preboarding" | "onboarding" | "offboarding"}.label`;
  href: string;
  icon: IconSvgElement;
  resource: ResourceCode;
  descriptionKey: `lifecycleSettings.${"preboarding" | "onboarding" | "offboarding"}.description`;
};

const tabs: Tab[] = [
  {
    id: "preboarding",
    labelKey: "lifecycleSettings.preboarding.label",
    href: "/settings/automation/preboarding",
    icon: SentIcon,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    descriptionKey: "lifecycleSettings.preboarding.description",
  },
  {
    id: "onboarding",
    labelKey: "lifecycleSettings.onboarding.label",
    href: "/settings/automation/onboarding",
    icon: UserAdd01Icon,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    descriptionKey: "lifecycleSettings.onboarding.description",
  },
  {
    id: "offboarding",
    labelKey: "lifecycleSettings.offboarding.label",
    href: "/settings/automation/offboarding",
    icon: UserRemove01Icon,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    descriptionKey: "lifecycleSettings.offboarding.description",
  },
];

/** The column count the tab strip needs; a class per count, because Tailwind cannot build one at runtime. */

/**
 * Settings → Preboarding, Onboarding & Offboarding: one header and a tab per process, the way Legal
 * Entities & Offices is laid out. Each tab is its own route, so a link can land on one.
 */
export default function LifecycleSettingsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("automations");
  const pathname = usePathname();
  const { access } = useAccess();

  const activeTab = useMemo(() => tabs.find((tab) => pathname === tab.href) ?? null, [pathname]);

  const visibleTabs = useMemo(
    () => tabs.filter((tab) => canAccess({ access, resource: tab.resource, action: "VIEW" })),
    [access],
  );

  if (!activeTab) {
    return <>{children}</>;
  }

  return (
    <PermissionGate
      anyOf={[
        { resource: "PEOPLE.LIFECYCLE_TEMPLATES", action: "VIEW" },
        { resource: "SETTINGS.GENERAL", action: "VIEW" },
      ]}
      fallback={<AccessDenied/>}
    >
      <div className="space-y-6">
        <div className="px-8 space-y-4">
          <SettingsPageHeader title={t(activeTab.labelKey)} backHref="/settings"/>

          <PageDescription className="text-body text-tertiary/90">
            {t(activeTab.descriptionKey)}
          </PageDescription>
        </div>

        <div className="px-8">
          <Tabs value={activeTab.id} className="w-full">
            <TabsList>
              {visibleTabs.map((tab) => {
                const shownIcon = tab.icon;

                return (
                  <TabsTrigger key={tab.id} value={tab.id} asChild className="flex items-center gap-2">
                    <Link href={tab.href} className="no-underline">
                      <Icon icon={shownIcon} size="sm" />
                      {t(tab.labelKey)}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {children}
      </div>
    </PermissionGate>
  );
}
