import { FC } from "react";
import { PageGate } from "@/components/auth/PageGate";
import { LifecycleTemplatesContainer } from "@/components/modules/lifecycle/templates/LifecycleTemplatesContainer";

const OnboardingTemplatesSettingsPage: FC = () => (
  <PageGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="VIEW">
    <div className="px-8">
      <LifecycleTemplatesContainer type="ONBOARDING"/>
    </div>
  </PageGate>
);

export default OnboardingTemplatesSettingsPage;
