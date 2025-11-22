"use client";
import { ReactNode, useState } from "react";
import Sidebar, { NavItem } from "@/components/layout/Sidebar/Sidebar";
import Home from "@/public/icons/home.svg";
import Inbox from "@/public/icons/inbox.svg";
import Search from "@/public/icons/search.svg";
import People from "@/public/icons/people.svg";
import Calendar from "@/public/icons/calendar.svg";
import Settings from "@/public/icons/settings.svg";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const top: NavItem[] = [
    { label: "Home", href: "/organization/people", Icon: Home },
    { label: "Inbox", href: "/inbox", Icon: Inbox },
    { label: "Search", href: "/search", Icon: Search },
    { label: "Organization", href: "/organization", Icon: People },
    { label: "Time Off", href: "/time-off", Icon: Calendar },
  ];

  const bottom: NavItem[] = [{ label: "Settings", href: "/settings", Icon: Settings }];

  return (
    <div className={styles.frame}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        topItems={top}
        bottomItems={bottom}
        profile={{ name: "Petr Kastahlod", initials: "PK", href: "/profile" }}
      />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
