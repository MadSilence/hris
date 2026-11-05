"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { GitBranchIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Tabs, TabsList, TabsTrigger } from "@/components/desact/tabs";

// Each tab titles the page itself: the two are separate pages that share a tab strip, not one page
// with a title covering both.
const tabs = [
  {
    id: "people",
    labelKey: "layout.people.title",
    href: "/organization/people",
    icon: UserGroupIcon,
    descriptionKey: "layout.people.description",
  },
  {
    id: "chart",
    labelKey: "layout.chart.title",
    href: "/organization/chart",
    icon: GitBranchIcon,
    descriptionKey: "layout.chart.description",
  },
] as const;

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("organization");
  const pathname = usePathname();
  const activeTab = tabs.find((tab) => pathname === tab.href) ?? null;

  if (!activeTab) return <>{children}</>;

  return (
    <div className="flex h-[calc(100dvh-96px)] min-h-0 flex-col gap-10">
      <section className="flex flex-none flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-greeting">{t(activeTab.labelKey)}</h1>
          <p className="max-w-2xl text-body text-tertiary">{t(activeTab.descriptionKey)}</p>
        </div>

        <Tabs value={activeTab.id} className="w-full">
          <TabsList>
            {tabs.map((tab) => {
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
                    {t(tab.labelKey)}
                  </Link>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </section>

      <section className="flex min-h-0 flex-1 flex-col">{children}</section>
    </div>
  );
}
