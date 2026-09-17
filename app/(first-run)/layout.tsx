import type { ReactNode } from "react";

import CurrentUserProvider from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import CompanyDataProvider from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { Toaster } from "@/public/desact/src/components/ui/sonner";

/**
 * The two screens that come before the product: the company's setup and a person's welcome.
 *
 * <p>Outside `(app)` on purpose. That group's layout is the gate that sends people here, so a screen
 * living inside it would be redirected to itself. They get the providers they actually need — who is
 * signed in, and which company this is — and nothing else: no sidebar, because there is nowhere to
 * navigate to yet, and no navigation is the point.
 */
export default function FirstRunLayout({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <CompanyDataProvider>
        <div className="min-h-screen bg-background">
          {children}
          <Toaster />
        </div>
      </CompanyDataProvider>
    </CurrentUserProvider>
  );
}
