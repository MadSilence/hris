"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { useAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { canAccess, isSystemOwner } from "@/models/access";
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

  const { access } = useAccess();
  const { userId: currentUserId } = useCurrentUser();
  const isOwnProfile = currentUserId === userId;

  /**
   * Scope matters here, not just the grant. An ordinary employee holds DOCUMENTS and TIME_OFF at
   * SELF, so checking the permission alone put both tabs on *everyone's* profile — where they then
   * rendered an empty list or a row of disabled buttons. On someone else's page the grant only
   * counts if it reaches past the person's own record.
   */
  const canSeeTab = (resource: ResourceCode) => {
    if (!canAccess({ access, resource, action: "VIEW" })) return false;
    if (isOwnProfile) return true;
    // The owner passes canAccess without any scopes listed — don't let the check below hide
    // everything from them.
    if (isSystemOwner(access)) return true;

    const scopes = access?.permissions?.[resource]?.VIEW ?? [];
    return scopes.some((scope) => scope !== "SELF");
  };

  const visibleTabs = TABS.filter((tab) => !tab.resource || canSeeTab(tab.resource));

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
