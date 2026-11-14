import { APP_HOME, safeReturnPath } from "@/lib/companyAddress";

/**
 * The page kept in `__Host-provider-back`, checked before it is followed: the login, the trial, an invitation's page,
 * or a page of the app (a Connect's). Anything else is the login.
 */
export const backPage = (kept: string | null | undefined): string => {
  if (!kept) return "/login";
  if (kept === "/login" || kept === "/trial" || /^\/invite\?token=[A-Za-z0-9_%-]+$/.test(kept)) return kept;
  const page = safeReturnPath(kept);
  return page === APP_HOME ? "/login" : page;
};

/**
 * The page a refusal returns to: the one the button was on, with the provider named — and, when the account is
 * somebody else's here (`IDN00013`, the invitation's I9), saying so.
 */
export const failedPage = (back: string, provider: string | null, inUse: boolean): string => {
  const query = new URLSearchParams();
  if (provider === "GOOGLE" || provider === "MICROSOFT") query.set("provider", provider);
  if (inUse) query.set("inUse", "1");
  const extra = query.toString();
  return extra ? `${back}${back.includes("?") ? "&" : "?"}${extra}` : back;
};
