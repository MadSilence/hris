import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { companyExists, currentCompanySubdomain } from "@/api/modules/companyAddress";

/**
 * Every step of a company's login (`/login`, `/login/forgot`, `/login/second-step`, …) on an address no company holds:
 * no form is drawn for it — "Log in to no-such-company" was (the designers' login fix R3). The browser goes to the
 * root's "Log in to your company" with the address typed in and "We can’t find that company…" under it: `/login/unknown`
 * is a root page, so on this host the middleware sends it on to the root (`hostRouting.ts` — a redirect straight to the
 * root's own origin would be made relative).
 *
 * When the backend cannot answer the page renders as before: an outage must not send a real company's people away.
 */
export const dynamic = "force-dynamic";

export default async function CompanyLoginLayout({ children }: { children: ReactNode }) {
  const subdomain = await currentCompanySubdomain();
  if (subdomain && (await companyExists(subdomain)) === false) {
    redirect(`/login/unknown?${new URLSearchParams({ address: subdomain }).toString()}`);
  }
  return children;
}
