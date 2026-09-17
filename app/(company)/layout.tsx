import { ReactNode } from "react";

/**
 * Pages on a company's own address that are not the app: an invitation, a preboarding link, a password
 * reset. They belong to the company rather than to the landing site, so they carry none of its
 * navigation — every link in it leads to the root.
 */
export default function CompanyPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
