"use client";

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Sidebar, { NavItem } from "@/components/layout/Sidebar/Sidebar";
import Home from "@/public/icons/home.svg";
import Inbox from "@/public/icons/inbox.svg";
import Search from "@/public/icons/search.svg";
import People from "@/public/icons/people.svg";
import Calendar from "@/public/icons/calendar.svg";
import Settings from "@/public/icons/settings.svg";
import { Clock, ListChecks, Workflow } from "lucide-react";
import styles from "./layout.module.css";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess, isSystemOwner, ResourceCode, type AccessAction } from "@/models/access";
import { settingsGroups } from "@/components/modules/settings/config/settings.config";
import { Toaster } from "@/public/desact/src/components/ui/sonner";
import { showError } from "@/lib/errors/errorToast";
import CurrentUserProvider, { useCurrentUser, } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { ImpersonationBanner } from "@/components/modules/auth/impersonation/components/ImpersonationBanner";
import ImpersonationProvider, {
  useImpersonationContext,
} from "@/components/providers/ImpersonationProvider/ImpersonationProvider";
import { useLogoutAction } from "@/components/modules/auth/hooks/useLogoutAction";
import { ChangePasswordModal } from "@/components/modules/auth/components/ChangePasswordModal";
import { clearPermissionsStorage } from "@/components/auth/permissionsStorage";
import { signOutNavigation } from "@/components/modules/auth/signOutNavigation";
import CompanyDataProvider, { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useUnreadNotificationsCount } from "@/components/modules/notifications/hooks/useUnreadNotificationsCount";
import { ForbiddenError } from "@/components/clients/exceptions";
import UserSettingsProvider from "@/components/providers/UserSettingsProvider";
import { useWelcome } from "@/components/modules/firstRun/hooks";
import { QuickSearchDialog, useQuickSearchShortcut, type SearchPage } from "@/components/modules/search";

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { access } = useAccess();

  const { user } = useCurrentUser();
  const { company } = useCompanyData();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const { data: welcome } = useWelcome();
  const { isImpersonating } = useImpersonationContext();
  const logout = useLogoutAction();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  useQuickSearchShortcut(openSearch);

  // A full navigation to `/login` on this same host — the company's own login. Leaves for it even if
  // clearing the cookies failed: staying would only 401. The remembered company is kept on purpose.
  const handleSignOut = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // nothing useful to add: the next sign-in replaces the cookies anyway
    } finally {
      clearPermissionsStorage();
      signOutNavigation.toLogin();
    }
  };

  // Non-GET calls through InternalApiClient still announce a refusal this way (reads do not — a
  // failed read belongs to the region that did not load); only the client can dispatch it
  // can — a server action runs on the server and has no window. Mutations reach the same cards
  // through showActionError instead.
  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      showError(new ForbiddenError(typeof detail === "string" ? detail : undefined, {
        code: "E00403",
        status: 403,
      }));
    };

    window.addEventListener("hris:forbidden", handleForbidden);
    return () => window.removeEventListener("hris:forbidden", handleForbidden);
  }, []);

  // Settings hub is visible when the user can view at least one settings area.
  const settingsResources: ResourceCode[] = settingsGroups
    .flatMap((group) => group.items)
    .flatMap((item) => item.resources ?? []);

  const allTopItems: (NavItem & { resources?: ResourceCode[]; widerThanSelf?: boolean; action?: AccessAction })[] = [
    { label: "Home", href: "/dashboard", Icon: Home },
    {
      label: "Inbox",
      href: "/inbox",
      Icon: Inbox,
      badge: unreadCount ?? 0,
    },
    // Beside the inbox: where tasks assigned to me land, a preboarding's included once the person
    // registers (LIFECYCLE_PROCESSES.md § 5.3). Everyone has one.
    { label: "Tasks", href: "/tasks", Icon: ListChecks as NavItem["Icon"] },
    // Opens the quick-search window in place; there is no results page (H11). Ctrl/Cmd + K does the same.
    {
      label: "Search",
      href: "#quick-search",
      Icon: Search,
      onSelect: openSearch,
    },
    {
      label: "Organization",
      href: "/organization/people",
      Icon: People,
      resources: ["PEOPLE.PROFILE"],
    },
    {
      label: "Calendar",
      href: "/calendar",
      Icon: Calendar,
      resources: ["PEOPLE.CALENDAR"],
      // A grant that reaches nobody but yourself builds a board with one row; the item is offered
      // only when the scope reaches further. `canAccess` without a scope passed on any grant at all.
      widerThanSelf: true,
    },
    // The company's attendance, for those who manage it (MANAGE). Everybody logs their own time on
    // their profile; the overview is not theirs to see.
    {
      label: "Attendance",
      href: "/attendance",
      Icon: Clock as NavItem["Icon"],
      resources: ["PEOPLE.ATTENDANCE"],
      action: "MANAGE",
    },
    {
      label: "Processes",
      href: "/processes",
      Icon: Workflow as NavItem["Icon"],
      resources: ["PEOPLE.LIFECYCLE_PROCESSES"],
    },
  ];

  const allBottomItems: (NavItem & { resources?: ResourceCode[] })[] = [
    {
      label: "Settings",
      href: "/settings",
      Icon: Settings,
      resources: settingsResources,
    },
  ];

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
  // The window's "Go To" list starts from what the sidebar already offers this reader.
  const appPages: SearchPage[] = top
    .filter((item) => !item.onSelect)
    .map((item) => ({ label: item.label, href: item.href }));

  const profile = useMemo(() => {
    const fullName = user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "";
    return {
      id: user?.id ?? "",
      name: fullName || "Loading...",
      role: user?.email || undefined,
      avatarUrl: user?.avatarUrl ?? null,
    };
  }, [user]);

  return (
    <div className={styles.frame}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
        topItems={top}
        bottomItems={bottom}
        profile={profile}
        company={company}
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

      <div className={styles.content}>
        <ImpersonationBanner/>
        <main className={styles.main}>{children}</main>
      </div>

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
            <LayoutContent>
              <div className="px-16 pt-16 pb-8">
                {children}
              </div>
            </LayoutContent>
          </UserSettingsProvider>
        </ImpersonationProvider>
      </CompanyDataProvider>
    </CurrentUserProvider>
  );
}
