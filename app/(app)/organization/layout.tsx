"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitBranch, Users } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";

const tabs = [
  { id: "people", label: "People", href: "/organization/people", icon: Users },
  { id: "chart", label: "Org chart", href: "/organization/chart", icon: GitBranch },
];

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = tabs.find((tab) => pathname === tab.href) ?? null;

  if (!activeTab) return <>{children}</>;

  return (
    <div className="flex h-[calc(100dvh-96px)] min-h-0 flex-col gap-10">
      <section className="flex flex-none flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[40px] font-semibold">Organisation</h1>
          <p className="max-w-2xl text-sm text-[var(--color-text-tertiary)]">
            Browse your team and see how the company reporting structure fits together.
          </p>
        </div>

        <Tabs value={activeTab.id} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-brown-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link href={tab.href} className="no-underline">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </section>

      <section className="flex min-h-0 flex-1 flex-col">{children}</section>
    </div>
  );
}
