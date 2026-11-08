"use client";

import React, { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import { AutomationEditorContainer } from "@/components/modules/automations/editor";

/**
 * One automation in the editor. `?step=<stepId>` opens that step's settings ("Fix the step"), `?run=<runId>` that
 * run's window (Activity, "See why"). `?turnOn=1` (Turn on from the list) and `?edit=1` (Edit from the list) stay in
 * the address for the editor to read itself.
 */
const AutomationEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  return (
    <AutomationEditorContainer
      key={id}
      automationId={id}
      focusStepId={params.get("step")}
      focusRunId={params.get("run")}
    />
  );
};

const AutomationRoute: React.FC = () => (
  <PageGate resource="SETTINGS.AUTOMATIONS" action="VIEW">
    <Suspense fallback={null}>
      <AutomationEditor/>
    </Suspense>
  </PageGate>
);

export default AutomationRoute;
