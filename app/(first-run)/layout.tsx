import type { ReactNode } from "react";

import CurrentUserProvider from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import CompanyDataProvider from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { Toaster } from "@/components/desact/sonner";
import { StepUpDialog } from "@/components/modules/mfa/stepUp";

/**
 * The two screens that come before the product: the company's setup and a person's welcome.
 *
 * <p>Outside `(app)` on purpose. That group's layout is the gate that sends people here, so a screen
 * living inside it would be redirected to itself. They get the providers they actually need — who is
 * signed in, and which company this is — and nothing else: no sidebar, because there is nowhere to
 * navigate to yet, and no navigation is the point. The "confirm it is you" dialog is here too: the welcome's
 * *Connect Google* asks it when the login is not fresh.
 */
export default function FirstRunLayout({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <CompanyDataProvider>
        <div className="min-h-screen bg-page">
          {children}
          <Toaster />
          <StepUpDialog />
        </div>
      </CompanyDataProvider>
    </CurrentUserProvider>
  );
}
