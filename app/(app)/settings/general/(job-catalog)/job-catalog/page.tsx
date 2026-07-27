"use client";

import * as React from "react";
import JobFamilyContainer from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/JobFamilyContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function JobCatalogPage() {
  return (
    <PermissionGate resource="JOBS.FAMILY" action="VIEW" fallback={<AccessDenied/>}>
      <JobFamilyContainer/>
    </PermissionGate>
  );
}
