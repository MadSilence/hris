"use client";

import React from "react";
import { useParams } from "next/navigation";

import LegalEntityDetailsContainer
  from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsContainer/LegalEntityDetailsContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function LegalEntityDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <PageGate resource="ORG.LEGAL_ENTITY" action="VIEW">
      <LegalEntityDetailsContainer legalEntityId={params.id}/>
    </PageGate>
  );
}
