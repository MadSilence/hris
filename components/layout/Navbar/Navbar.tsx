"use client";

import Link from "next/link";
import NavbarLink from "../../ui/NavbarLink/NavbarLink";
import { Button } from "@/components/desact/button";
import { NoddoWordmark } from "@/components/brand";

const LINKS = [
  { label: "Products", href: "/products" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
] as const;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-card/85 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3">
        <Link href="/" aria-label="noddo home" className="inline-flex items-center">
          <NoddoWordmark tone="ink" height={24} />
        </Link>

        <nav className="hidden items-center justify-center gap-2 md:flex">
          {LINKS.map((link) => (
            <NavbarLink key={link.href} href={link.href}>
              {link.label}
            </NavbarLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>

          <Button asChild>
            <Link href="/trial">Start free trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
