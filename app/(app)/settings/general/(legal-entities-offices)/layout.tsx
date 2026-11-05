"use client";

import React, { ReactNode, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BankIcon, Building03Icon } from "@hugeicons/core-free-icons";
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
  /** The tab's title labels both the tab and the page. */
  titleKey: "legalEntities.page.title" | "offices.page.title";
  descriptionKey: "legalEntities.page.description" | "offices.page.description";
  href: string;
  icon: IconSvgElement;
  resource: ResourceCode;
};

const tabs: Tab[] = [
  {
    id: "legal-entities",
    titleKey: "legalEntities.page.title",
    descriptionKey: "legalEntities.page.description",
    href: "/settings/general/legal-entities",
    icon: BankIcon,
    resource: "ORG.LEGAL_ENTITY",
  },
  {
    id: "offices",
    titleKey: "offices.page.title",
    descriptionKey: "offices.page.description",
    href: "/settings/general/offices",
    icon: Building03Icon,
    resource: "ORG.OFFICE",
  },
];

export default function LegalEntitiesAndOfficesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("structure");
  const pathname = usePathname();
  const { access } = useAccess();

  const activeTab = useMemo(
    () => tabs.find((tab) => pathname === tab.href) ?? null,
    [pathname],
  );

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
        { resource: "ORG.LEGAL_ENTITY", action: "VIEW" },
        { resource: "ORG.OFFICE", action: "VIEW" },
      ]}
      fallback={<AccessDenied/>}
    >
      <div className="space-y-6">
        <div className="px-8 space-y-4">
          <SettingsPageHeader title={t(activeTab.titleKey)} backHref="/settings"/>

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
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    asChild
                    className="flex items-center gap-2"
                  >
                    <Link href={tab.href} className="no-underline">
                      <Icon icon={shownIcon} size="sm" />
                      {t(tab.titleKey)}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        <div className="px-8">{children}</div>
      </div>
    </PermissionGate>
  );
}
