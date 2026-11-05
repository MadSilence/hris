"use client";

import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardSquare01Icon, FileTextIcon, UserCheck01Icon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";

import { useAccess } from "@/components/auth/useAccess";
import { canAccess, ResourceCode } from "@/models/access";
import { Tabs, TabsList, TabsTrigger } from "@/components/desact/tabs";

type Tab = {
  id: "overview" | "me" | "forms";
  href: string;
  icon: IconSvgElement;
  /** Undefined: everybody — everybody may have reviews to write or to read. */
  resource?: ResourceCode;
};

const tabs: Tab[] = [
  {
    id: "overview",
    href: "/reviews",
    icon: DashboardSquare01Icon,
    resource: "REVIEWS.CYCLE",
  },
  {
    id: "me",
    href: "/reviews/me",
    icon: UserCheck01Icon,
  },
  {
    id: "forms",
    href: "/reviews/forms",
    icon: FileTextIcon,
    resource: "REVIEWS.FORM",
  },
];

/** The column count the tab strip needs; a class per count, because Tailwind cannot build one at runtime. */

/**
 * Reviews (technical_design/REVIEWS_DESIGN.md § 12): one heading over a tab per page, each tab its own route and
 * its own right — My Reviews is everybody's. A page below a tab (a cycle, a form, a review being written) has the
 * screen to itself, and each page gates itself.
 */
export default function ReviewsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("reviews");
  const pathname = usePathname();
  const { access } = useAccess();

  const activeTab = useMemo(() => tabs.find((tab) => pathname === tab.href) ?? null, [pathname]);
  const visibleTabs = useMemo(
    () => tabs.filter((tab) => !tab.resource || canAccess({ access, resource: tab.resource, action: "VIEW" })),
    [access],
  );

  if (!activeTab) return <>{children}</>;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-page-title text-primary">{t("layout.title")}</h1>
        <p className="mt-1 text-body text-tertiary">{t(`layout.tabs.${activeTab.id}.description`)}</p>
      </div>

      {visibleTabs.length > 1 && (
        <Tabs value={activeTab.id} className="w-full">
          <TabsList>
            {visibleTabs.map((tab) => {
              const shownIcon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} asChild className="flex items-center gap-2">
                  <Link href={tab.href} className="no-underline">
                    <Icon icon={shownIcon} size="sm" />
                    {t(`layout.tabs.${tab.id}.label`)}
                  </Link>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {children}
    </div>
  );
}
