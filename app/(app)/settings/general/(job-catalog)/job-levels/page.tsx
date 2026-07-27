"use client";

import * as React from "react";
import JobLevelContainer
  from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelContainer/JobLevelContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function JobLevelsPage() {
  return (
    <PermissionGate
      anyOf={[
        { resource: "JOBS.LEVEL_GROUP", action: "VIEW" },
        { resource: "JOBS.LEVEL", action: "VIEW" },
      ]}
      fallback={<AccessDenied/>}
    >
      <JobLevelContainer/>
    </PermissionGate>
  );
}
