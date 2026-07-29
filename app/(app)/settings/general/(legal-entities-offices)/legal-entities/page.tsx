"use client";

import * as React from "react";

import LegalEntityContainer from "@/components/modules/settings/modules/legalEntity/components/LegalEntityContainer/LegalEntityContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function LegalEntitiesPage() {
  return (
    <PermissionGate resource="ORG.LEGAL_ENTITY" action="VIEW" fallback={<AccessDenied/>}>
      <LegalEntityContainer/>
    </PermissionGate>
  );
}
