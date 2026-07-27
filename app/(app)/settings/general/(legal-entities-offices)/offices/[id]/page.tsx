"use client";

import React from "react";
import { useParams } from "next/navigation";

import OfficeDetailsContainer from "@/components/modules/settings/modules/office/components/OfficeDetailsContainer/OfficeDetailsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function OfficeDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <PermissionGate resource="ORG.OFFICE" action="VIEW" fallback={<AccessDenied/>}>
      <OfficeDetailsContainer officeId={params.id}/>
    </PermissionGate>
  );
}
