"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/desact/tabs";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  useProfileEditGuard,
} from "@/components/modules/organization/modules/profile/context/ProfileEditGuard";
import type { ResourceCode } from "@/models/access";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";

type TabDef = {
  id: string;
  labelKey: "publicProfile" | "personal" | "documents" | "timeOff" | "salary" | "attendance" | "forms" | "reviews" | "tasks" | "notes";
  /** Undefined = always visible. Otherwise the tab is hidden without VIEW on this resource. */
  resource?: ResourceCode;
  /** Shown also to the person and to their line manager, whatever their rights. */
  personAndManager?: boolean;
};

/**
 * The order is the owner's. Public Profile, Salary, Tasks and Notes are UI only for now — each opens
 * `ProfileComingSoonTab` — and carry no resource: they are ungated until there is something behind them
 * worth a permission. Forms carries none either: it shows the person's answered questionnaires, and the
 * backend gives the processes right all of them and the person what they answered themself.
 */
const TABS: TabDef[] = [
  { id: "public-profile", labelKey: "publicProfile" },
  { id: "personal", labelKey: "personal" },
  { id: "documents", labelKey: "documents", resource: "PEOPLE.DOCUMENTS" },
  { id: "time-off", labelKey: "timeOff", resource: "PEOPLE.TIME_OFF" },
  { id: "salary", labelKey: "salary" },
  { id: "attendance", labelKey: "attendance", resource: "PEOPLE.ATTENDANCE" },
  { id: "forms", labelKey: "forms" },
  // The person, their line manager and REVIEWS.RESULT holders (DECISIONS.md § "Performance reviews — the second
  // sitting", Q6); each sees a different part, and the backend answers which (REVIEWS_DESIGN.md § 12.6).
  { id: "reviews", labelKey: "reviews", resource: "REVIEWS.RESULT", personAndManager: true },
  { id: "tasks", labelKey: "tasks" },
  { id: "notes", labelKey: "notes" },
];

type Props = {
  userId: string;
  /**
   * What the caller may do to *this* person, straight from the server. The client used to work it
   * out from the scope names on its own permissions, which answered "may I, at all" and not "may I,
   * on them" — and was a second copy of the permission model besides.
   */
  capabilities?: Record<string, string[]>;
  /** The person's line manager today, for the tabs the manager sees without a right. */
  managerId?: string | null;
};

export function ProfileTabsNav({ userId, capabilities, managerId }: Props) {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const { user: viewer } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const base = `/organization/people/${userId}`;

  const { isDirty } = useProfileEditGuard();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  /**
   * One lookup, no reasoning. Own profile, System Owner and every scope shape are already accounted
   * for by the server, which resolved the answer against this person.
   */
  const canSeeTab = (resource: ResourceCode) =>
    (capabilities?.[resource] ?? []).includes("VIEW");

  const personOrManager = Boolean(viewer?.id) && (viewer?.id === userId || viewer?.id === managerId);
  const visibleTabs = TABS.filter((tab) =>
    !tab.resource || canSeeTab(tab.resource) || (tab.personAndManager && personOrManager));

  const active =
    visibleTabs.find((tab) => pathname === `${base}/${tab.id}`)?.id ?? "personal";

  return (
    <>
      <Tabs value={active} className="w-full">
        <TabsList>
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
                  {t(`profile.tabs.${tab.labelKey}`)}
                </Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <ConfirmCancelModal
        isOpen={!!pendingHref}
        // The owner's wording (person-profile plan 9.3): the question is about leaving, not discarding.
        title={t("profile.leaveGuard.title")}
        description={t("profile.leaveGuard.description")}
        cancelText={tCommon("actions.keepEditing")}
        confirmText={t("profile.leaveGuard.confirm")}
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
