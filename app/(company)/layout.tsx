import { ReactNode } from "react";

/**
 * Pages on a company's own address that are not the app: an invitation, a preboarding link, a password
 * reset. They belong to the company rather than to the landing site, so they carry none of its
 * navigation — every link in it leads to the root. The sign-in family wears the login's card
 * (`(auth)/layout.tsx`); the preboarding page and the phone's avatar page lay themselves out.
 */
export default function CompanyPagesLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-page">{children}</div>;
}
