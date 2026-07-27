"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import Sidebar, { NavItem } from "@/components/layout/Sidebar/Sidebar";
import Home from "@/public/icons/home.svg";
import Inbox from "@/public/icons/inbox.svg";
import Search from "@/public/icons/search.svg";
import People from "@/public/icons/people.svg";
import Calendar from "@/public/icons/calendar.svg";
import Settings from "@/public/icons/settings.svg";
import styles from "./layout.module.css";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess, ResourceCode } from "@/models/access";
import { settingsGroups } from "@/components/modules/settings/config/settings.config";
import { Toast } from "@/components/ui/Toast";
import CurrentUserProvider, { useCurrentUser, } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { ImpersonationBanner } from "@/components/modules/auth/impersonation/components/ImpersonationBanner";
import ImpersonationProvider from "@/components/providers/ImpersonationProvider/ImpersonationProvider";
import CompanyDataProvider, { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { access } = useAccess();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { user } = useCurrentUser();
  const { company } = useCompanyData();

  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToastMsg(typeof detail === "string" ? detail : "Permission denied");
    };

    window.addEventListener("hris:forbidden", handleForbidden);
    return () => window.removeEventListener("hris:forbidden", handleForbidden);
  }, []);

  // Settings hub is visible when the user can view at least one settings area.
  const settingsResources: ResourceCode[] = settingsGroups
    .flatMap((group) => group.items)
    .flatMap((item) => item.resources ?? []);

  const allTopItems: (NavItem & { resources?: ResourceCode[] })[] = [
    { label: "Home", href: "/dashboard", Icon: Home },
    {
      label: "Inbox",
      href: "/inbox",
      Icon: Inbox,
    },
    {
      label: "Search",
      href: "/search",
      Icon: Search,
    },
    {
      label: "Organization",
      href: "/organization/people",
      Icon: People,
      resources: ["PEOPLE.PROFILE"],
    },
    {
      label: "Time Off",
      href: "/time-off",
      Icon: Calendar,
      resources: ["PEOPLE.TIME_OFF"],
    },
  ];

  const allBottomItems: (NavItem & { resources?: ResourceCode[] })[] = [
    {
      label: "Settings",
      href: "/settings",
      Icon: Settings,
      resources: settingsResources,
    },
  ];

  const filterItem = (item: NavItem & { resources?: ResourceCode[] }) => {
    if (!item.resources || item.resources.length === 0) return true;

    return item.resources.some((resource) =>
      canAccess({ access, resource, action: "VIEW" }),
    );
  };

  const top = allTopItems.filter(filterItem);
  const bottom = allBottomItems.filter(filterItem);

  const profile = useMemo(() => {
    const fullName = user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "";
    return {
      id: user?.id ?? "",
      name: fullName || "Loading...",
      role: user?.email || undefined,
      avatarUrl: user?.avatarUrl ?? null,
    };
  }, [user]);

  return (
    <div className={styles.frame}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
        topItems={top}
        bottomItems={bottom}
        profile={profile}
        company={company}
      />

      <div className={styles.content}>
        <ImpersonationBanner/>
        <main className={styles.main}>{children}</main>
      </div>

      {toastMsg ? (
        <Toast message={toastMsg} onClose={() => setToastMsg(null)}/>
      ) : null}
    </div>
  );
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <CompanyDataProvider>
        <ImpersonationProvider>
          <LayoutContent>
            <div className="px-16 pt-16 pb-8">
              {children}
            </div>
          </LayoutContent>
        </ImpersonationProvider>
      </CompanyDataProvider>
    </CurrentUserProvider>
  );
}
