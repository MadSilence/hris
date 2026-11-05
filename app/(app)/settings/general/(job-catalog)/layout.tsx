"use client";

import { ReactNode, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HierarchySquare02Icon, Layers01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { Tabs, TabsList, TabsTrigger } from "@/components/desact/tabs";

/** A tab's title labels both the tab and the page. */
const tabs = [
  {
    id: "job-catalog",
    titleKey: "jobCatalog.page.title",
    descriptionKey: "jobCatalog.page.description",
    href: "/settings/general/job-catalog",
    icon: HierarchySquare02Icon,
  },
  {
    id: "job-levels",
    titleKey: "jobLevels.page.title",
    descriptionKey: "jobLevels.page.description",
    href: "/settings/general/job-levels",
    icon: Layers01Icon,
  },
] as const;

export default function SettingsJobCatalogLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("structure");
  const pathname = usePathname();

  const activeTab = useMemo(
    () => tabs.find((tab) => pathname === tab.href) ?? tabs[0],
    [pathname],
  );

  return (
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        {/* The page is titled by the tab it is on — it must not claim to be one of its own children. */}
        <SettingsPageHeader title={t(activeTab.titleKey)} backHref="/settings"/>

        <PageDescription className="text-body text-tertiary/90">
          {t(activeTab.descriptionKey)}
        </PageDescription>
      </div>

      <div className="px-8">
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
  );
}
