"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { useCanAccess } from "@/components/auth/useAccess";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  useProfileEditGuard,
} from "@/components/modules/organization/modules/profile/context/ProfileEditGuard";
import type { ResourceCode } from "@/models/access";

type TabDef = {
  id: string;
  label: string;
  /** Undefined = always visible. Otherwise the tab is hidden without VIEW on this resource. */
  resource?: ResourceCode;
};

const TABS: TabDef[] = [
  { id: "personal", label: "Personal Info" },
  { id: "documents", label: "Documents", resource: "PEOPLE.DOCUMENTS" },
  { id: "time-off", label: "Time Off", resource: "PEOPLE.TIME_OFF" },
];

type Props = { userId: string };

export function ProfileTabsNav({ userId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/organization/people/${userId}`;

  const { isDirty } = useProfileEditGuard();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const canViewDocuments = useCanAccess("PEOPLE.DOCUMENTS", "VIEW");
  const canViewTimeOff = useCanAccess("PEOPLE.TIME_OFF", "VIEW");

  const visibleTabs = TABS.filter((tab) => {
    if (tab.resource === "PEOPLE.DOCUMENTS") return canViewDocuments;
    if (tab.resource === "PEOPLE.TIME_OFF") return canViewTimeOff;
    return true;
  });

  const active =
    visibleTabs.find((tab) => pathname === `${base}/${tab.id}`)?.id ?? "personal";

  return (
    <>
      <Tabs value={active} className="w-full">
        <TabsList
          className="grid w-full bg-brown-50"
          style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
        >
          {visibleTabs.map((tab) => {
            const href = `${base}/${tab.id}`;

            return (
              <TabsTrigger key={tab.id} value={tab.id} asChild>
                <Link
                  href={href}
                  className="no-underline"
                  onClick={(e) => {
                    // Switching tabs unmounts the editor, so an unsaved draft would vanish silently.
                    if (isDirty && href !== pathname) {
                      e.preventDefault();
                      setPendingHref(href);
                    }
                  }}
                >
                  {tab.label}
                </Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <ConfirmCancelModal
        isOpen={!!pendingHref}
        description="You have unsaved changes on this tab. Leaving now discards them."
        cancelText="Keep editing"
        confirmText="Discard and leave"
        onCancelAction={() => setPendingHref(null)}
        onConfirmAction={() => {
          const href = pendingHref;
          setPendingHref(null);
          if (href) router.push(href);
        }}
      />
    </>
  );
}
