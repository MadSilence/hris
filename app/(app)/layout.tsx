import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import AppShell from "./AppShell";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import { hrisApiCompanyService } from "@/api/modules/company/services";

/**
 * Inside a workspace the tab reads "Acme · noddo", and a page puts its own name in front: "Calendar · Acme ·
 * noddo" (SPEC § 2). Without the company's name — a hiccup reading it — the product's name alone.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const { name } = await hrisApiCompanyService.getCompany();
    // `absolute`, not `default`: a default is itself run through the root layout's "%s · noddo" and came
    // out "Acme · noddo · noddo". SPEC § 2: the page title is "Acme · noddo", a page under it "People · Acme · noddo".
    if (name) return { title: { absolute: `${name} · noddo`, template: `%s · ${name} · noddo` } };
  } catch {
    // the root layout's "noddo" stands
  }
  return {};
}

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
