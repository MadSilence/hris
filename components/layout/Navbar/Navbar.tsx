"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import NavbarLink from "../../ui/NavbarLink/NavbarLink";
import { Button } from "@/components/desact/button";
import { NoddoWordmark } from "@/components/brand";

const LINKS = [
  { labelKey: "public.nav.products", href: "/products" },
  { labelKey: "public.nav.solutions", href: "/solutions" },
  { labelKey: "public.nav.pricing", href: "/pricing" },
  { labelKey: "public.nav.about", href: "/about" },
] as const;

export default function Navbar() {
  const t = useTranslations("navigation");
  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-card/85 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3">
        <Link href="/" aria-label={t("public.nav.home")} className="inline-flex items-center">
          <NoddoWordmark tone="ink" height={24} />
        </Link>

        <nav className="hidden items-center justify-center gap-2 md:flex">
          {LINKS.map((link) => (
            <NavbarLink key={link.href} href={link.href}>
              {t(link.labelKey)}
            </NavbarLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">{t("public.nav.signIn")}</Link>
          </Button>

          <Button asChild>
            <Link href="/trial">{t("public.nav.startTrial")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
