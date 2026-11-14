import type { ReactNode } from "react";

/**
 * The company's own pages a link from an email opens — an invitation, confirming a new email, a dead link. Each draws
 * its own `AuthSplit` in the company's look (sign-in-* specs), because what sits in the white side's corner (a back
 * arrow, or nothing) is the page's own business.
 */
export const dynamic = "force-dynamic";

export default function CompanyAuthLayout({ children }: { children: ReactNode }) {
  return children;
}
