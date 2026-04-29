"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavbarLink.module.css";
import { ReactNode } from "react";

type Props = { href: string; children: ReactNode };

export default function NavbarLink({ href, children }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${styles.link} ${active ? styles.active : ""} no-underline`}
    >
      {children}
    </Link>
  );
}
