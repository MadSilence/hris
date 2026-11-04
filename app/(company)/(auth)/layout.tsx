import type { ReactNode } from "react";

import AuthScreen from "@/components/modules/auth/components/AuthScreen";
import { currentCompanySubdomain, publicAppearanceFor } from "@/api/modules/companyAddress";

/**
 * The company's own sign-in family — password reset, an invitation, confirming a new email — drawn as its
 * login is (SPEC § 2): the company's logo on the card, its colour on the button, "powered by noddo" at the
 * foot. Read on the server through the same cached read as the login and `workspaceAccent`, so the logo and
 * the colour arrive with the HTML.
 *
 * The login image stays on the login: the company placed it there and nowhere else.
 */
export const dynamic = "force-dynamic";

export default async function CompanyAuthLayout({ children }: { children: ReactNode }) {
  const subdomain = await currentCompanySubdomain();
  const appearance = subdomain ? await publicAppearanceFor(subdomain) : null;

  return (
    <AuthScreen logoUrl={appearance?.logoUrl} poweredBy className="min-h-screen">
      {children}
    </AuthScreen>
  );
}
