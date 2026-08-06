"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";

const TABS = [
  { id: "personal", label: "Personal Info" },
  { id: "documents", label: "Documents" },
  { id: "time-off", label: "Time Off" },
] as const;

type Props = { userId: string };

export function ProfileTabsNav({ userId }: Props) {
  const pathname = usePathname();
  const base = `/organization/people/${userId}`;
  const active = TABS.find((tab) => pathname === `${base}/${tab.id}`)?.id ?? "personal";

  return (
    <Tabs value={active} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-brown-50">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} asChild>
            <Link href={`${base}/${tab.id}`} className="no-underline">
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
