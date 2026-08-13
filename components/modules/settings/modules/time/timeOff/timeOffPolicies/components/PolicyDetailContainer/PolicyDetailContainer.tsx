"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil, Play, Trash2, Users } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/public/desact/src/components/ui/tabs";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

import { PolicyOverview } from "./PolicyOverview";
import { PolicyAssignmentsTab } from "./PolicyAssignmentsTab";
import { DeleteTimeOffPolicyModal } from "../modals/DeleteTimeOffPolicyModal";
import {
  PolicyWizardModal,
  buildApprovalRequest,
  buildEditRulesRequest,
  buildRequestRulesRequest,
  buildUpdatePolicyRequest,
  policyToWizardValues,
  type PolicyWizardValues,
} from "../wizard";

import { useTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicy";
import { useUpdateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useUpdateTimeOffPolicy";
import { useRenameTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useRenameTimeOffPolicy";
import { useActivateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useActivateTimeOffPolicy";
import { useArchiveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useArchiveTimeOffPolicy";
import { useDeleteTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useDeleteTimeOffPolicy";
import { useUpdateTimeOffPolicyRequestRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRequestRules/hooks/useUpdateTimeOffPolicyRequestRules";
import { useTimeOffPolicyRequestRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRequestRules/hooks/useTimeOffPolicyRequestRules";
import { useUpdateTimeOffPolicyEditRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEditRules/hooks/useUpdateTimeOffPolicyEditRules";
import { useTimeOffPolicyEditRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEditRules/hooks/useTimeOffPolicyEditRules";
import { useUpdateTimeOffPolicyApprovalSettings } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/hooks/useUpdateTimeOffPolicyApprovalSettings";
import { useTimeOffPolicyApprovalSettings } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/hooks/useTimeOffPolicyApprovalSettings";
import { useLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveType";

import { TimeOffPolicyStatus } from "@/api/modules/timeOff/timeOffPolicies/dto";

type Props = {
  leaveTypeId: string;
  policyId: string;
};

function statusBadge(status: TimeOffPolicyStatus) {
  switch (status) {
    case TimeOffPolicyStatus.Active:
      return { label: "Active", className: "border-green-200 bg-green-50 text-green-700" };
    case TimeOffPolicyStatus.Archived:
      return { label: "Archived", className: "border-amber-200 bg-amber-50 text-amber-700" };
    default:
      return { label: "Draft", className: "" };
  }
}

export default function PolicyDetailContainer({ leaveTypeId, policyId }: Props) {
  const router = useRouter();
  const listHref = `/settings/time/leave-type/${leaveTypeId}/policies`;

  const { data: policy, isLoading, error } = useTimeOffPolicy({ policyId });
  const { data: leaveType } = useLeaveType(leaveTypeId);

  const requestRulesQuery = useTimeOffPolicyRequestRules(policyId);
  const editRulesQuery = useTimeOffPolicyEditRules(policyId);
  const approvalQuery = useTimeOffPolicyApprovalSettings({ policyId });

  const updateMutation = useUpdateTimeOffPolicy();
  const renameMutation = useRenameTimeOffPolicy();
  const activateMutation = useActivateTimeOffPolicy();
  const archiveMutation = useArchiveTimeOffPolicy();
  const deleteMutation = useDeleteTimeOffPolicy();
  const requestRulesMutation = useUpdateTimeOffPolicyRequestRules();
  const editRulesMutation = useUpdateTimeOffPolicyEditRules();
  const approvalMutation = useUpdateTimeOffPolicyApprovalSettings();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (error) throw error;

  const editInitialValues = useMemo(() => {
    if (!policy || !requestRulesQuery.data || !editRulesQuery.data || !approvalQuery.data) {
      return undefined;
    }
    return policyToWizardValues(
      policy,
      requestRulesQuery.data,
      editRulesQuery.data,
      approvalQuery.data,
    );
  }, [policy, requestRulesQuery.data, editRulesQuery.data, approvalQuery.data]);

  const handleEditSave = async (values: PolicyWizardValues) => {
    if (!policy) return;
    const id = policy.id;

    const newSlug = values.name.trim().toLowerCase().replace(/\s+/g, "-");
    if (newSlug !== policy.name) {
      await renameMutation.mutateAsync({ id, name: newSlug });
    }

    await updateMutation.mutateAsync({ id, ...buildUpdatePolicyRequest(values) });
    await requestRulesMutation.mutateAsync({ policyId: id, ...buildRequestRulesRequest(values) });
    await editRulesMutation.mutateAsync({ policyId: id, ...buildEditRulesRequest(values) });

    const approval = buildApprovalRequest(values);
    if (approval) {
      await approvalMutation.mutateAsync({ policyId: id, ...approval });
    }

    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!policy) return;
    await deleteMutation.mutateAsync({ id: policy.id });
    setIsDeleteOpen(false);
    router.push(listHref);
  };

  if (isLoading || !policy) {
    return (
      <div className="px-8 pt-2">
        <SettingsPageHeader title="Policy" backHref={listHref} />
        <div className="mt-6 h-40 animate-pulse rounded-lg bg-brown-50" />
      </div>
    );
  }

  const badge = statusBadge(policy.status);
  const isArchived = policy.status === TimeOffPolicyStatus.Archived;
  const isDraft = policy.status === TimeOffPolicyStatus.Draft;

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-2">
        <SettingsPageHeader title={policy.displayName} backHref={listHref} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className={badge.className}>
              {badge.label}
            </Badge>
            {leaveType && (
              <span className="text-sm text-muted-foreground">in {leaveType.name}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => activateMutation.mutate({ id: policy.id })}
              >
                <Play className="h-4 w-4" />
                Activate
              </Button>
            )}
            {policy.status === TimeOffPolicyStatus.Active && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => archiveMutation.mutate({ id: policy.id })}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-600 hover:text-red-700"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            {!isArchived && (
              <Button size="sm" className="gap-1.5" onClick={() => setIsEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col px-8 pt-5">
        <TabsList className="flex-none">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 min-h-0 flex-1 overflow-y-auto pb-6">
          <PolicyOverview policy={policy} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-5 min-h-0 flex-1 pb-6">
          <PolicyAssignmentsTab
            policyId={policy.id}
            policyName={policy.displayName}
            isArchived={isArchived}
          />
        </TabsContent>
      </Tabs>

      <PolicyWizardModal
        isOpen={isEditOpen && Boolean(editInitialValues)}
        isLoading={updateMutation.isPending || renameMutation.isPending}
        mode="edit"
        leaveTypeName={leaveType?.name}
        initialValues={editInitialValues}
        onSubmitAction={handleEditSave}
        onCancelAction={() => setIsEditOpen(false)}
      />

      <DeleteTimeOffPolicyModal
        isOpen={isDeleteOpen}
        isLoading={deleteMutation.isPending}
        policy={policy}
        onConfirmAction={handleDelete}
        onRequestCloseAction={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
