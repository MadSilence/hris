"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import { AutomationEditorContainer } from "@/components/modules/automations/editor";

/**
 * A new automation: from a template (`?template=<key>`), from a prompt for noddo AI (`?ai=<text>`), or from nothing
 * (`design/screens/automations-start`).
 */
const NewAutomationEditor: React.FC = () => {
  const params = useSearchParams();
  // Read once: the first save rewrites the address to `/automations/<id>` in place (history.replaceState), which drops
  // `?template=` — read on every render, the editor's key changed with it and the editor came back empty.
  const [opened] = React.useState(() => ({ template: params.get("template"), ai: params.get("ai") }));
  return <AutomationEditorContainer automationId={null} templateKey={opened.template} aiPrompt={opened.ai}/>;
};

const NewAutomationRoute: React.FC = () => (
  <PageGate resource="SETTINGS.AUTOMATIONS" action="MANAGE">
    <Suspense fallback={null}>
      <NewAutomationEditor/>
    </Suspense>
  </PageGate>
);

export default NewAutomationRoute;
