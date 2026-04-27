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
import { PermissionsProvider, usePermissions, } from "@/components/auth/PermissionsContext";
import { Toast } from "@/components/ui/Toast";
import CurrentUserProvider, { useCurrentUser, } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { canModule } = usePermissions();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { user } = useCurrentUser();

  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToastMsg(typeof detail === "string" ? detail : "Permission denied");
    };

    window.addEventListener("hris:forbidden", handleForbidden);
    return () => window.removeEventListener("hris:forbidden", handleForbidden);
  }, []);

  const allTopItems: (NavItem & { module?: string })[] = [
    { label: "Home", href: "/home", Icon: Home },
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
      module: "PEOPLE",
    },
    {
      label: "Time Off",
      href: "/time-off",
      Icon: Calendar,
      module: "TIME_OFF",
    },
  ];

  const allBottomItems: (NavItem & { module?: string })[] = [
    {
      label: "Settings",
      href: "/settings",
      Icon: Settings,
    },
  ];

  const filterItem = (item: NavItem & { module?: string }) => {
    if (!item.module) return true;

    return canModule(item.module, "view");
  };

  const top = allTopItems.filter(filterItem);
  const bottom = allBottomItems.filter(filterItem);

  const profile = useMemo(() => {
    const fullName = user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "";
    console.log(user)
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
      />

      <main className={styles.main}>{children}</main>

      {toastMsg ? (
        <Toast message={toastMsg} onClose={() => setToastMsg(null)}/>
      ) : null}
    </div>
  );
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionsProvider>
      <CurrentUserProvider>
        <LayoutContent>{children}</LayoutContent>
      </CurrentUserProvider>
    </PermissionsProvider>
  );
}
