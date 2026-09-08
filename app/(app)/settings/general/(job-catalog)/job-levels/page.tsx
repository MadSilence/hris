"use client";

import * as React from "react";
import JobLevelContainer
  from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelContainer/JobLevelContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function JobLevelsPage() {
  return (
    <PageGate
      anyOf={[
        { resource: "JOBS.LEVEL_GROUP", action: "VIEW" },
        { resource: "JOBS.LEVEL", action: "VIEW" },
      ]}>
      <JobLevelContainer/>
    </PageGate>
  );
}
