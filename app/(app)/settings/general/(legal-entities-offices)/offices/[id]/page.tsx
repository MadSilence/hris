"use client";

import React from "react";
import { useParams } from "next/navigation";

import OfficeDetailsContainer from "@/components/modules/settings/modules/office/components/OfficeDetailsContainer/OfficeDetailsContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function OfficeDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <PageGate resource="ORG.OFFICE" action="VIEW">
      <OfficeDetailsContainer officeId={params.id}/>
    </PageGate>
  );
}
