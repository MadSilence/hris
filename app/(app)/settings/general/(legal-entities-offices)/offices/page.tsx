"use client";

import * as React from "react";

import OfficeContainer from "@/components/modules/settings/modules/office/components/OfficeContainer/OfficeContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function OfficesPage() {
  return (
    <PermissionGate resource="ORG.OFFICE" action="VIEW" fallback={<AccessDenied/>}>
      <OfficeContainer/>
    </PermissionGate>
  );
}
