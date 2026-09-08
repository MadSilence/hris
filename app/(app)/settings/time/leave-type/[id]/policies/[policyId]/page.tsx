"use client";

import { useParams } from "next/navigation";

import PolicyDetailContainer from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/components/PolicyDetailContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function PolicyDetailPage() {
  const params = useParams();
  const leaveTypeId = params.id as string;
  const policyId = params.policyId as string;

  return (
    <PageGate resource="PEOPLE.TIME_OFF_POLICIES" action="VIEW">
      <PolicyDetailContainer leaveTypeId={leaveTypeId} policyId={policyId} />
    </PageGate>
  );
}
