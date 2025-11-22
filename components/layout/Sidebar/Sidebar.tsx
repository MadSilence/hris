"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import Collapse from "@/public/icons/collapse.svg";

export type NavItem = {
  label: string;
  href: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  topItems: NavItem[];
  bottomItems: NavItem[];
  profile: { name: string; initials?: string; href: string };
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  topItems,
  bottomItems,
  profile,
}) => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const renderItem = (i: NavItem) => {
    const active = isActive(i.href);
    const Icon = i.Icon;

    return (
      <li key={i.href}>
        <Link
          className={[
            styles.link,
            active ? styles.active : "",
            collapsed ? styles.linkCollapsed : "",
          ].join(" ")}
          href={i.href}
          aria-current={active ? "page" : undefined}
          title={collapsed ? i.label : undefined}
        >
          {Icon ? <Icon className={styles.icon} aria-hidden focusable={false} /> : null}
          <span className={styles.text}>{i.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ""].join(" ")}>
      <div className={styles.header}>
        <Link href="/organization/people" className={styles.brand}>
          <span className={styles.logoDot} aria-hidden/>
          <span className={styles.brandText}>SixSoftware</span>
        </Link>

        <button
          type="button"
          className={styles.toggle}
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <Collapse className={styles.toggleIcon} aria-hidden focusable={false} />
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.list}>{topItems.map(renderItem)}</ul>
      </nav>

      <div className={styles.bottom}>
        <ul className={styles.list}>{bottomItems.map(renderItem)}</ul>

        <Link href={profile.href} className={styles.profile} title={collapsed ? profile.name : undefined}>
          <span className={styles.avatar}>
            {profile.initials ?? profile.name.slice(0, 2).toUpperCase()}
          </span>
          <span className={styles.profileText}>{profile.name}</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
