"use client";

import { useParams } from "next/navigation";

import PolicyDetailContainer from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/components/PolicyDetailContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function PolicyDetailPage() {
  const params = useParams();
  const leaveTypeId = params.id as string;
  const policyId = params.policyId as string;

  return (
    <PermissionGate resource="PEOPLE.TIME_OFF_POLICIES" action="VIEW" fallback={<AccessDenied />}>
      <PolicyDetailContainer leaveTypeId={leaveTypeId} policyId={policyId} />
    </PermissionGate>
  );
}
