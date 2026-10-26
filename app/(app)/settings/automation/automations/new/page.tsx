"use client";

import React, { Suspense } from "react";
import { PageGate } from "@/components/auth/PageGate";
import { AutomationRuleContainer } from "@/components/modules/automations/builder/AutomationRuleContainer";

// `useSearchParams` (the ready-made starting point) needs a Suspense boundary under the App Router.
const NewAutomationPage: React.FC = () => (
  <PageGate resource="SETTINGS.AUTOMATIONS" action="MANAGE">
    <Suspense fallback={null}>
      <AutomationRuleContainer ruleId={null}/>
    </Suspense>
  </PageGate>
);

export default NewAutomationPage;
