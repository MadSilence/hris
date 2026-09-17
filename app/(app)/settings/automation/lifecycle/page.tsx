import { FC } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import { LifecycleTemplatesContainer } from "@/components/modules/lifecycle/templates/LifecycleTemplatesContainer";

const LifecycleTemplatesSettingsPage: FC = () => (
  <PageGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Preboarding & Onboarding" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          The task lists a preboarding or an onboarding starts with. Preboarding is for somebody who has
          not signed in yet and happens on one page behind a link; onboarding happens inside the app.
        </PageDescription>
      </div>

      <div className="px-8">
        <LifecycleTemplatesContainer/>
      </div>
    </div>
  </PageGate>
);

export default LifecycleTemplatesSettingsPage;
