"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sessionNavigation } from "@/components/clients/apiClient/internalApiClient";

const REFRESH_PATH = "/api/auth/refresh";
const LAST_RENEWAL_KEY = "noddo.serverRenderRenewedAt";
/** A second 401 this soon after a renewal is not an expired token any more — it is a session that is gone. */
const RETRY_WINDOW_MS = 15_000;

const renewedJustNow = (): boolean => {
  try {
    const at = Number(window.sessionStorage.getItem(LAST_RENEWAL_KEY) ?? 0);
    return Date.now() - at < RETRY_WINDOW_MS;
  } catch {
    return false;
  }
};

const markRenewed = () => {
  try {
    window.sessionStorage.setItem(LAST_RENEWAL_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the retry window is lost, the renewal itself is not.
  }
};

/**
 * What a server component renders when the backend answered its read with 401.
 *
 * A server component cannot renew the session — writing the new cookies throws there, and spending the refresh
 * token without writing it back would leave the browser holding one the backend has already rotated away
 * (`hrisApiClient.renewSession`). So a 401 during a server render used to be `redirect("/login")`, which threw
 * people out of a perfectly good session: the walk of 2026-11-23 met it on a profile when the 30-minute access
 * token ran out mid-page — the backend's own session was alive, and opening Home a second later worked.
 *
 * Here, in the browser, the renewal can be done: trade the refresh cookie once, then render the server part again.
 * Only when the renewal is refused — or the render 401s again straight after one — is the session really over,
 * and the person goes to the login with the page to come back to, as the browser's own client does.
 */
export function RenewSession() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    if (renewedJustNow()) {
      sessionNavigation.redirectToLogin();
      return;
    }
    fetch(REFRESH_PATH, { method: "POST", credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok)
      .catch(() => false)
      .then((renewed) => {
        if (cancelled) return;
        if (!renewed) {
          sessionNavigation.redirectToLogin();
          return;
        }
        markRenewed();
        router.refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
