"use client";

import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, UserMinus, UserPlus } from "lucide-react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess, ResourceCode } from "@/models/access";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: typeof Send;
  resource: ResourceCode;
  title: string;
  description: string;
};

const tabs: Tab[] = [
  {
    id: "preboarding",
    label: "Preboarding",
    href: "/settings/automation/preboarding",
    icon: Send,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    title: "Preboarding",
    description:
      "The task lists a preboarding starts with. Preboarding is for somebody who has not signed in yet, and happens on one page behind a link.",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    href: "/settings/automation/onboarding",
    icon: UserPlus,
    resource: "PEOPLE.LIFECYCLE_TEMPLATES",
    title: "Onboarding",
    description:
      "The task lists an onboarding starts with. Onboarding happens inside the app, once the new person has signed in.",
  },
  {
    id: "offboarding",
    label: "Offboarding",
    href: "/settings/automation/offboarding",
    icon: UserMinus,
    // What the "Offboarding" settings entry was gated by before it became a tab; offboarding
    // templates are not built — the design defers them (technical_documentation/LIFECYCLE_PROCESSES.md).
    resource: "SETTINGS.GENERAL",
    title: "Offboarding",
    description:
      "What happens when somebody leaves the company — handing over their work, returning equipment, closing access.",
  },
];

/** The column count the tab strip needs; a class per count, because Tailwind cannot build one at runtime. */
const GRID_COLUMNS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

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

          <PageDescription className="text-base text-muted-foreground/90">
            {activeTab.description}
          </PageDescription>
        </div>

        <div className="px-8">
          <Tabs value={activeTab.id} className="w-full">
            <TabsList className={`grid w-full ${GRID_COLUMNS[visibleTabs.length] ?? "grid-cols-3"} bg-brown-50`}>
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <TabsTrigger key={tab.id} value={tab.id} asChild className="flex items-center gap-2">
                    <Link href={tab.href} className="no-underline">
                      <Icon className="h-4 w-4"/>
                      {tab.label}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Not padded here: the Offboarding tab is the shared coming-soon page, which pads itself. */}
        {children}
      </div>
    </PermissionGate>
  );
}
