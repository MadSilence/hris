"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import { AutomationRuleContainer } from "@/components/modules/automations/builder/AutomationRuleContainer";

const AutomationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <PageGate resource="SETTINGS.AUTOMATIONS" action="VIEW">
      <Suspense fallback={null}>
        <AutomationRuleContainer ruleId={id}/>
      </Suspense>
    </PageGate>
  );
};

export default AutomationPage;
