"use client";

import Link from "next/link";
import NavbarLink from "../../ui/NavbarLink/NavbarLink";
import styles from "./Navbar.module.css";

const LINKS = [
  { label: "Products", href: "/products" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
] as const;

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Six Software
        </Link>

        <nav className={styles.nav}>
          {LINKS.map((l) => (
            <NavbarLink key={l.href} href={l.href}>
              {l.label}
            </NavbarLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>
            Login
          </Link>
          <Link href="/trial" className={styles.trialBtn}>
            Free Trial
          </Link>
        </div>
      </div>
    </header>
  );
}
