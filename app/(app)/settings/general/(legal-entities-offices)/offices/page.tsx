"use client";

import * as React from "react";

import OfficeContainer from "@/components/modules/settings/modules/office/components/OfficeContainer/OfficeContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function OfficesPage() {
  return (
    <PageGate resource="ORG.OFFICE" action="VIEW">
      <OfficeContainer/>
    </PageGate>
  );
}
