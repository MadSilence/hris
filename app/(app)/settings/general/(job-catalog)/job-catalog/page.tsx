"use client";

import * as React from "react";
import JobFamilyContainer from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/JobFamilyContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function JobCatalogPage() {
  return (
    <PageGate resource="JOBS.FAMILY" action="VIEW">
      <JobFamilyContainer/>
    </PageGate>
  );
}
