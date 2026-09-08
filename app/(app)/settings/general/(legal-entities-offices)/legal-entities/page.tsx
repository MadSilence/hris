"use client";

import * as React from "react";

import LegalEntityContainer from "@/components/modules/settings/modules/legalEntity/components/LegalEntityContainer/LegalEntityContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function LegalEntitiesPage() {
  return (
    <PageGate resource="ORG.LEGAL_ENTITY" action="VIEW">
      <LegalEntityContainer/>
    </PageGate>
  );
}
