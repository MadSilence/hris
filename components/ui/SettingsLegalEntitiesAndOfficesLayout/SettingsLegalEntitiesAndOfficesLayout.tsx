"use client";

import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Landmark } from "lucide-react";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Tabs, TabsList, TabsTrigger, } from "@/public/desact/src/components/ui/tabs";

type Props = {
  header: ReactNode;
  children: ReactNode;
};

const tabs = [
  {
    id: "legal-entities",
    label: "Legal Entities",
    href: "/settings/general/legal-entities",
    icon: Landmark,
  },
  {
    id: "offices",
    label: "Offices",
    href: "/settings/general/offices",
    icon: Building2,
  },
];

export default function SettingsLegalEntitiesAndOfficesLayout({
  header,
  children,
}: Props) {
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    return tabs.find((tab) => pathname.includes(`/${tab.id}`)) ?? tabs[0];
  }, [pathname]);

  return (
    <PermissionGate anyOf={["PERM_SETTINGS_VIEW"]} fallback={<AccessDenied/>}>
      <div className="space-y-6">
        <div className="px-8 space-y-4">{header}</div>

        <div className="px-8">
          <Tabs value={activeTab.id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-brown-50">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    asChild
                    className="flex items-center gap-2"
                  >
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

        <div className="px-8">{children}</div>
      </div>
    </PermissionGate>
  );
}
