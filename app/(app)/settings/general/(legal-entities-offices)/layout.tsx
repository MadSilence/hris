"use client";

import React, { ReactNode, useMemo } from "react";
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
  label: string;
  href: string;
  icon: IconSvgElement;
  resource: ResourceCode;
  title: string;
  description: string;
};

const tabs: Tab[] = [
  {
    id: "legal-entities",
    label: "Legal entities",
    href: "/settings/general/legal-entities",
    icon: BankIcon,
    resource: "ORG.LEGAL_ENTITY",
    title: "Legal entities",
    description:
      "Legal Entities define the official registered companies within your organization. Each entity includes important compliance details such as registration number, tax ID, and address.",
  },
  {
    id: "offices",
    label: "Offices",
    href: "/settings/general/offices",
    icon: Building03Icon,
    resource: "ORG.OFFICE",
    title: "Offices",
    description:
      "Offices represent the physical or remote locations where your company operates. Each office contains details such as address, country, timezone, and employee distribution.",
  },
];

export default function LegalEntitiesAndOfficesLayout({
  children,
}: {
  children: ReactNode;
}) {
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
          <SettingsPageHeader title={activeTab.title} backHref="/settings"/>

          <PageDescription className="text-body text-tertiary/90">
            {activeTab.description}
          </PageDescription>
        </div>

        <div className="px-8">
          <Tabs value={activeTab.id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-subtle">
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
                      {tab.label}
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
