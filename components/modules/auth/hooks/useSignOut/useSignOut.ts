"use client";

import { useLogoutAction } from "@/components/modules/auth/hooks/useLogoutAction";
import { clearPermissionsStorage } from "@/components/auth/permissionsStorage";
import { signOutNavigation } from "@/components/modules/auth/signOutNavigation";

/**
 * Signing out, wherever it is offered — the sidebar's user menu and Home's My profile menu. A full navigation to
 * `/login` on this same host, the company's own login; it leaves even if clearing the cookies failed, because staying
 * would only 401. The remembered company is kept on purpose.
 */
export const useSignOut = () => {
  const logout = useLogoutAction();
  return async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // nothing useful to add: the next sign-in replaces the cookies anyway
    } finally {
      clearPermissionsStorage();
      signOutNavigation.toLogin();
    }
  };
};
