"use client";

import { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, ListTree } from "lucide-react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";

const tabs = [
  {
    id: "job-catalog",
    label: "Job Catalog",
    href: "/settings/general/job-catalog",
    icon: ListTree,
  },
  {
    id: "job-levels",
    label: "Job Levels",
    href: "/settings/general/job-levels",
    icon: Layers,
  },
];

export default function SettingsJobCatalogLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const activeTab = useMemo(
    () => tabs.find((tab) => pathname === tab.href) ?? tabs[0],
    [pathname],
  );

  return (
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Job Catalog" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          Build your organization&apos;s job structure. Group positions into job families, assign each
          job a level, and keep a single consistent catalog that roles, compensation, and reporting
          can rely on.
        </PageDescription>
      </div>

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
  );
}
