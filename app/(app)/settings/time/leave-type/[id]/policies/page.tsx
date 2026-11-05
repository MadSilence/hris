"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import TimeOffPoliciesSettingsContainer from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/components/TimeOffPoliciesSettingsContainer";
import { useLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveType";
import { PageGate } from "@/components/auth/PageGate";

export default function LeaveTypePoliciesPage() {
  const t = useTranslations("timeOff");
  const params = useParams();
  const leaveTypeId = params.id as string;

  const { data: leaveType } = useLeaveType(leaveTypeId);

  return (
    <PageGate resource="PEOPLE.TIME_OFF_POLICIES" action="VIEW">
      <TimeOffPoliciesSettingsContainer
        leaveTypeId={leaveTypeId}
        title={leaveType?.name ?? t("settingsPages.policiesFallbackTitle")}
        backHref="/settings/time/leave-type"
      />
    </PageGate>
  );
}
