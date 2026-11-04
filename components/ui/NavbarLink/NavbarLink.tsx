"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = { href: string; children: ReactNode };

/** A link of the public site's top bar; the page you are on wears the muted accent, like a sidebar item. */
export default function NavbarLink({ href, children }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-control px-3 text-body font-medium transition-colors duration-(--duration-hover)",
        active ? "bg-accent-muted text-accent-text" : "text-secondary hover:bg-subtle hover:text-primary",
      )}
    >
      {children}
    </Link>
  );
}
