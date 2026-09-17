import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AppShell from "./AppShell";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";

/**
 * The gate in front of the whole signed-in app.
 *
 * <p>A server component on purpose. Two things have to be true before a page is worth drawing: the
 * company has been set up, and this person has been welcomed. Asking from the client would mean
 * rendering the sidebar, the navigation and half a dashboard and then throwing it away — which is
 * what a redirect from inside a provider looks like to whoever is watching.
 *
 * <p><b>Routing, not a security check</b> (`hris/CLAUDE.md` § "Security model"). It decides where
 * somebody lands, never what they may do; every endpoint behind it still answers for itself, and a
 * failure to reach the backend opens the gate rather than closing it.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const { setupNeeded, welcomeNeeded } = await hrisFirstRunService.getFirstRunState();

  // The company first: a person welcomed into a company with nothing in it would be asked to fill in
  // a profile whose departments and offices do not exist yet.
  if (setupNeeded) redirect("/setup");
  if (welcomeNeeded) redirect("/welcome");

  return <AppShell>{children}</AppShell>;
}
