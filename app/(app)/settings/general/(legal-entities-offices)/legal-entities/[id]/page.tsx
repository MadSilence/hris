"use client";

import React from "react";
import { useParams } from "next/navigation";

import LegalEntityDetailsContainer
  from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsContainer/LegalEntityDetailsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function LegalEntityDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <PermissionGate resource="ORG.LEGAL_ENTITY" action="VIEW" fallback={<AccessDenied/>}>
      <LegalEntityDetailsContainer legalEntityId={params.id}/>
    </PermissionGate>
  );
}
