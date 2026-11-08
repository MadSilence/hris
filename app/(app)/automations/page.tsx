"use client";

import React, { Suspense } from "react";
import { PageGate } from "@/components/auth/PageGate";
import { AutomationsPage } from "@/components/modules/automations/list";

/** Sidebar → Automations: the list and Activity (`design/screens/automations-list`, `automations-activity`). */
const AutomationsRoute: React.FC = () => (
  <PageGate resource="SETTINGS.AUTOMATIONS" action="VIEW">
    {/* `useSearchParams` (the tab and Activity's deep link) needs a Suspense boundary under the App Router. */}
    <Suspense fallback={null}>
      <AutomationsPage/>
    </Suspense>
  </PageGate>
);

export default AutomationsRoute;
