"use client";

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Sidebar, { NavItem } from "@/components/layout/Sidebar/Sidebar";
import {
  Calendar03Icon,
  CheckListIcon,
  Clock01Icon,
  FlashIcon,
  Home01Icon,
  InboxIcon,
  Settings01Icon,
  StarIcon,
  UserGroupIcon,
  WorkflowSquare03Icon,
} from "@hugeicons/core-free-icons";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess, isSystemOwner, ResourceCode, type AccessAction } from "@/models/access";
import { canSeeSettingsItem, settingsGroups } from "@/components/modules/settings/config/settings.config";
import { Toaster } from "@/components/desact/sonner";
import { showError } from "@/lib/errors/errorToast";
import CurrentUserProvider, { useCurrentUser, } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { ImpersonationBanner } from "@/components/modules/auth/impersonation/components/ImpersonationBanner";
import ImpersonationProvider, {
  useImpersonationContext,
} from "@/components/providers/ImpersonationProvider/ImpersonationProvider";
import { useSignOut } from "@/components/modules/auth/hooks/useSignOut";
import { ChangePasswordModal } from "@/components/modules/auth/components/ChangePasswordModal";
import CompanyDataProvider, { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useUnreadNotificationsCount } from "@/components/modules/notifications/hooks/useUnreadNotificationsCount";
import { ForbiddenError } from "@/components/clients/exceptions";
import UserSettingsProvider from "@/components/providers/UserSettingsProvider";
import { useWelcome } from "@/components/modules/firstRun/hooks";
import { QuickSearchDialog, useQuickSearchShortcut, type SearchPage } from "@/components/modules/search";
import { StepUpDialog } from "@/components/modules/mfa/stepUp";
import { AppFrameProvider, useAppFrameMode } from "@/components/layout/AppFrame";

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("navigation");
  const [collapsed, setCollapsed] = useState(false);
  const { access } = useAccess();
  // A canvas page (the automation editor) folds the sidebar to 64 px; hovering opens it over the page. A manual
  // unfold there lasts while the page is open and is not remembered (AppFrame).
  const canvas = useAppFrameMode() === "canvas";
  const [canvasUnfolded, setCanvasUnfolded] = useState(false);
  useEffect(() => {
    if (!canvas) setCanvasUnfolded(false);
  }, [canvas]);

  const { user } = useCurrentUser();
  const { company } = useCompanyData();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const { data: welcome } = useWelcome();
  const { isImpersonating } = useImpersonationContext();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  useQuickSearchShortcut(openSearch);

  const handleSignOut = useSignOut();

  // Non-GET calls through InternalApiClient still announce a refusal this way (reads do not — a
  // failed read belongs to the region that did not load); only the client can dispatch it
  // can — a server action runs on the server and has no window. Mutations reach the same cards
  // through showActionError instead.
  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const detail: unknown = (e as CustomEvent).detail;
      const refusal = detail instanceof ForbiddenError ? detail : undefined;
      // A refusal with a code of its own keeps it; a bare 403 reads as the generic E00403.
      showError(new ForbiddenError(refusal?.message, {
        code: refusal?.code ?? "E00403",
        status: 403,
        params: refusal?.params,
        requestId: refusal?.requestId,
      }));
    };

    window.addEventListener("hris:forbidden", handleForbidden);
    return () => window.removeEventListener("hris:forbidden", handleForbidden);
  }, []);

  // Settings hub is visible when the hub would offer the user at least one item.
  const seesSettings = settingsGroups.some((group) => group.items.some((item) => canSeeSettingsItem(access, item)));

  const allTopItems: (NavItem & { resources?: ResourceCode[]; widerThanSelf?: boolean; action?: AccessAction })[] = [
    { label: t("menu.home"), href: "/dashboard", icon: Home01Icon },
    { label: t("menu.inbox"), href: "/inbox", icon: InboxIcon, badge: unreadCount ?? 0 },
    // Beside the inbox: where tasks assigned to me land, a preboarding's included once the person
    // registers (LIFECYCLE_PROCESSES.md § 5.3). Everyone has one.
    { label: t("menu.tasks"), href: "/tasks", icon: CheckListIcon },
    { label: t("menu.organization"), href: "/organization/people", icon: UserGroupIcon, resources: ["PEOPLE.PROFILE"] },
    {
      label: t("menu.calendar"),
      href: "/calendar",
      icon: Calendar03Icon,
      resources: ["PEOPLE.CALENDAR"],
      // A grant that reaches nobody but yourself builds a board with one row; the item is offered
      // only when the scope reaches further. `canAccess` without a scope passed on any grant at all.
      widerThanSelf: true,
    },
    // The company's attendance, for those who manage it (MANAGE). Everybody logs their own time on
    // their profile; the overview is not theirs to see.
    { label: t("menu.attendance"), href: "/attendance", icon: Clock01Icon, resources: ["PEOPLE.ATTENDANCE"], action: "MANAGE" },
    { label: t("menu.processes"), href: "/processes", icon: WorkflowSquare03Icon, resources: ["PEOPLE.LIFECYCLE_PROCESSES"] },
    // Performance reviews (REVIEWS_DESIGN.md § 12.1): everybody's — anybody may have a review to write or to read.
    // Overview sends somebody who does not run cycles on to My Reviews.
    { label: t("menu.reviews"), href: "/reviews", icon: StarIcon },
    // Automations left Settings for the main navigation (AUTOMATIONS_REDESIGN_PLAN batch 8); the right keeps its
    // code (K11). Viewers see the list without actions.
    { label: t("menu.automations"), href: "/automations", icon: FlashIcon, resources: ["SETTINGS.AUTOMATIONS"] },
  ];

  const allBottomItems: (NavItem & { resources?: ResourceCode[] })[] = seesSettings
    ? [{ label: t("menu.settings"), href: "/settings", icon: Settings01Icon }]
    : [];

  const filterItem = (item: NavItem & { resources?: ResourceCode[]; widerThanSelf?: boolean; action?: AccessAction }) => {
    if (!item.resources || item.resources.length === 0) return true;

    return item.resources.some((resource) => {
      if (!canAccess({ access, resource, action: item.action ?? "VIEW" })) return false;
      if (!item.widerThanSelf || isSystemOwner(access)) return true;
      const scopes = access?.permissions?.[resource]?.VIEW ?? [];
      return scopes.some((scope) => scope !== "SELF");
    });
  };

  const top = allTopItems.filter(filterItem);
  const bottom = allBottomItems.filter(filterItem);
  // The window's "Go to" list starts from what the sidebar already offers this reader.
  const appPages: SearchPage[] = top.map((item) => ({ label: item.label, href: item.href }));

  const profile = useMemo(() => {
    const fullName = user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "";
    return {
      id: user?.id ?? "",
      name: fullName,
      email: user?.email || undefined,
      avatarUrl: user?.avatarUrl ?? null,
    };
  }, [user]);

  return (
    <div className="grid min-h-dvh grid-cols-[auto_minmax(0,1fr)] bg-page print:block print:min-h-0">
      <Sidebar
        collapsed={canvas ? !canvasUnfolded : collapsed}
        onToggle={() => (canvas ? setCanvasUnfolded((current) => !current) : setCollapsed((current) => !current))}
        peekOnHover={canvas && !canvasUnfolded}
        topItems={top}
        bottomItems={bottom}
        profile={profile}
        company={company}
        onSearch={openSearch}
        onSignOut={handleSignOut}
        // An impersonated session's password is the subject's, and not the actor's to change.
        onChangePassword={isImpersonating ? undefined : () => setIsChangePasswordOpen(true)}
        // Skipping the welcome is an answer and never asks again — but a missing photo stays missing,
        // and this is the offer to come back to it rather than a second interruption.
        showFinishProfile={Boolean(welcome?.outstanding) && !isImpersonating}
      />

      <QuickSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} appPages={appPages}/>

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onCloseAction={() => setIsChangePasswordOpen(false)}
      />

      {/* Printing a page (the company calendar's Print): the page alone, grown to its content. */}
      <div className="flex h-dvh min-w-0 flex-col print:h-auto">
        <ImpersonationBanner/>
        <main className={canvas ? "min-h-0 min-w-0 flex-1 overflow-hidden" : "min-w-0 flex-1 overflow-auto print:overflow-visible"}>
          {/* Page padding (SPEC § 6): 32 px, 24 below a 1280 px viewport; none on a canvas page. One element either
              way, so switching the mode never remounts the page. */}
          <div
            className={
              canvas
                ? "h-full"
                : "px-(--page-padding-narrow) py-(--page-padding-narrow) xl:px-(--page-padding) xl:py-(--page-padding)"
            }
          >
            {children}
          </div>
        </main>
      </div>

      {/* "Confirm it is you" — one dialog for every sensitive operation (MFA_DESIGN.md § 3.5). */}
      <StepUpDialog/>

      <Toaster/>
    </div>
  );
};

/**
 * Everything the signed-in app draws around a page: the sidebar, the providers, the toaster.
 *
 * <p>Split out of the route's own layout so that layout can be a <b>server</b> component. The gate it
 * now carries — is this company set up, has this person seen the welcome — has to be answered before
 * anything renders, or the reader gets a flash of the product they are about to be redirected out of.
 * A client-side check cannot do that; it can only undo it.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <CompanyDataProvider>
        <ImpersonationProvider>
          <UserSettingsProvider>
            <AppFrameProvider>
              <LayoutContent>{children}</LayoutContent>
            </AppFrameProvider>
          </UserSettingsProvider>
        </ImpersonationProvider>
      </CompanyDataProvider>
    </CurrentUserProvider>
  );
}
