"use client";

import React from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageGate } from "@/components/auth/PageGate";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { AutomationsListContainer } from "@/components/modules/automations/list/AutomationsListContainer";

const AutomationsSettingsPage: React.FC = () => (
  <PageGate resource="SETTINGS.AUTOMATIONS" action="VIEW">
    <div className="flex h-[calc(100svh-6rem)] flex-col gap-6 overflow-hidden">
      <div className="shrink-0 space-y-2 px-8">
        <SettingsPageHeader title="Automations" backHref="/settings"/>
        <PageDescription className="text-base text-muted-foreground/90">
          Rules that do something on their own when something happens to a person — an email before
          the first day, a task for the manager, the holiday calendar of their office. Assigning by a
          filter in the assignment window makes a rule here too.
        </PageDescription>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-8">
        <AutomationsListContainer/>
      </div>
    </div>
  </PageGate>
);

export default AutomationsSettingsPage;
