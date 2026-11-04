"use client";

import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  label: string;
  href: string;
  icon: IconSvgElement;
  resource: ResourceCode;
  title: string;
  description: string;
};

const tabs: Tab[] = [
  {
    id: "preboarding",
    label: "Preboarding",
    href: "/settings/automation/preboarding",
    icon: SentIcon,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    title: "Preboarding",
    description:
      "The task lists a preboarding starts with. Preboarding is for somebody who has not signed in yet, and happens on one page behind a link.",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    href: "/settings/automation/onboarding",
    icon: UserAdd01Icon,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    title: "Onboarding",
    description:
      "The task lists an onboarding starts with. Onboarding happens inside the app, once the new person has signed in.",
  },
  {
    id: "offboarding",
    label: "Offboarding",
    href: "/settings/automation/offboarding",
    icon: UserRemove01Icon,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    title: "Offboarding",
    description:
      "The task lists an offboarding starts with, counted from the last working day — handing over work, returning equipment, the exit interview.",
  },
];

/** The column count the tab strip needs; a class per count, because Tailwind cannot build one at runtime. */

/**
 * Settings → Preboarding, Onboarding & Offboarding: one header and a tab per process, the way Legal
 * Entities & Offices is laid out. Each tab is its own route, so a link can land on one.
 */
export default function LifecycleSettingsLayout({ children }: { children: ReactNode }) {
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
          <SettingsPageHeader title={activeTab.title} backHref="/settings"/>

          <PageDescription className="text-body text-tertiary/90">
            {activeTab.description}
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
                      {tab.label}
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
