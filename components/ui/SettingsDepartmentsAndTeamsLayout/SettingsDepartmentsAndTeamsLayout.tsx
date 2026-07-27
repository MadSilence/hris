"use client";

import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users } from "lucide-react";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess, ResourceCode } from "@/models/access";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";

type Props = {
  header: ReactNode;
  children: ReactNode;
};

const tabs: { id: string; label: string; href: string; icon: typeof Building2; resource: ResourceCode }[] = [
  {
    id: "departments",
    label: "Departments",
    href: "/settings/general/departments",
    icon: Building2,
    resource: "ORG.DEPARTMENT",
  },
  {
    id: "teams",
    label: "Teams",
    href: "/settings/general/teams",
    icon: Users,
    resource: "ORG.TEAM",
  },
];

export default function SettingsDepartmentsAndTeamsLayout({
  header,
  children,
}: Props) {
  const pathname = usePathname();
  const { access } = useAccess();

  const visibleTabs = useMemo(
    () => tabs.filter((tab) => canAccess({ access, resource: tab.resource, action: "VIEW" })),
    [access],
  );

  const activeTab = useMemo(() => {
    return tabs.find((tab) => pathname.includes(`/${tab.id}`)) ?? tabs[0];
  }, [pathname]);

  return (
    <PermissionGate
      anyOf={[
        { resource: "ORG.DEPARTMENT", action: "VIEW" },
        { resource: "ORG.TEAM", action: "VIEW" },
      ]}
      fallback={<AccessDenied/>}
    >
      <div className="space-y-6">
        <div className="px-8 space-y-4">{header}</div>

        <div className="px-8">
          <Tabs value={activeTab.id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-brown-50">
              {visibleTabs.map((tab) => {
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
