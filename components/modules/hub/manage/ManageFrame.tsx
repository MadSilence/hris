"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { PageGate } from "@/components/auth/PageGate";
import { useCanAccess } from "@/components/auth";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import type { AccessAction } from "@/models/access";
import { cn } from "@/lib/cn";
import { BackLink, HubPage, HubTitle } from "../shared";

/**
 * Manage hub's gate (`HUB.CONTENT`, EDIT; Settings MANAGE). UX only — Java's `AccessEngine` decides — and its refusal
 * is the spec's: "This page is private" with the way back to the hub.
 */
export const HubManageGate: React.FC<{ children: React.ReactNode; action?: AccessAction }> = ({ children, action = "EDIT" }) => (
  <PageGate resource="HUB.CONTENT" action={action} fallback={<HubPrivatePage />}>
    {children}
  </PageGate>
);

const HubPrivatePage: React.FC = () => {
  const t = useTranslations("hub");
  return (
    <ErrorPage
      scene="policies"
      title={t("errors.privateTitle")}
      line={t("errors.privateLine")}
      actions={
        <Button asChild>
          <Link href="/hub" className="no-underline">
            {t("errors.goToHub")}
          </Link>
        </Button>
      }
    />
  );
};

const TABS = [
  { id: "overview", href: "/hub/manage" },
  { id: "posts", href: "/hub/manage/posts" },
  { id: "pages", href: "/hub/manage/pages" },
  { id: "settings", href: "/hub/manage/settings" },
] as const;

/**
 * The frame of every Manage hub tab (CM01–CM04): the back link, "Manage hub" with the buttons that follow the tab,
 * and the tabs with their accent underline. Settings is offered only with `HUB.CONTENT` MANAGE.
 */
export const ManageFrame: React.FC<{ actions?: React.ReactNode; children: React.ReactNode }> = ({ actions, children }) => {
  const t = useTranslations("hub");
  const pathname = usePathname();
  const canManage = useCanAccess("HUB.CONTENT", "MANAGE");
  const tabs = TABS.filter((tab) => tab.id !== "settings" || canManage);
  const label = (id: (typeof TABS)[number]["id"]) =>
    id === "overview" ? t("manage.tabs.overview") : id === "posts" ? t("manage.tabs.posts") : id === "pages" ? t("manage.tabs.pages") : t("manage.tabs.settings");

  return (
    <HubPage>
      <BackLink href="/hub" label={t("home.title")} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <HubTitle>{t("manage.title")}</HubTitle>
        <span className="ml-auto flex items-center gap-2">{actions}</span>
      </div>
      <nav aria-label={t("manage.title")} className="mt-7 flex gap-6 border-b border-divider">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 pb-2.5 text-body font-medium no-underline transition-colors",
                active ? "border-accent text-primary" : "border-transparent text-secondary hover:text-primary",
              )}
            >
              {label(tab.id)}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">{children}</div>
    </HubPage>
  );
};
