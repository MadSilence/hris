"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { TimeOffPoliciesSettingsComponent } from "../TimeOffPoliciesSettingsComponent";
import { DeleteTimeOffPolicyModal } from "../modals/DeleteTimeOffPolicyModal";
import {
  PolicyWizardModal,
  buildApprovalRequest,
  buildCreatePolicyRequest,
  buildEditRulesRequest,
  buildRequestRulesRequest,
  type PolicyWizardValues,
} from "../wizard";

import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useCreateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useCreateTimeOffPolicy";
import { useActivateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useActivateTimeOffPolicy";
import { useArchiveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useArchiveTimeOffPolicy";
import { useDeleteTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useDeleteTimeOffPolicy";
import { useUpdateTimeOffPolicyRequestRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRequestRules/hooks/useUpdateTimeOffPolicyRequestRules";
import { useUpdateTimeOffPolicyEditRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEditRules/hooks/useUpdateTimeOffPolicyEditRules";
import { useUpdateTimeOffPolicyApprovalSettings } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/hooks/useUpdateTimeOffPolicyApprovalSettings";

import type { TimeOffPolicy } from "@/models/timeOff";

type Props = {
  leaveTypeId?: string;
  title?: string;
  backHref?: string;
};

export default function TimeOffPoliciesSettingsContainer({
  leaveTypeId,
  title,
  backHref,
}: Props = {}) {
  const router = useRouter();
  const { data: policies, isLoading, error } = useTimeOffPolicies();

  const visiblePolicies = leaveTypeId
    ? (policies ?? []).filter((p) => p.leaveTypeId === leaveTypeId)
    : (policies ?? []);

  const createMutation = useCreateTimeOffPolicy();
  const activateMutation = useActivateTimeOffPolicy();
  const archiveMutation = useArchiveTimeOffPolicy();
  const deleteMutation = useDeleteTimeOffPolicy();
  const requestRulesMutation = useUpdateTimeOffPolicyRequestRules();
  const editRulesMutation = useUpdateTimeOffPolicyEditRules();
  const approvalMutation = useUpdateTimeOffPolicyApprovalSettings();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState<TimeOffPolicy | null>(null);

  if (error) throw error;

  const handleCreate = async (values: PolicyWizardValues, activate: boolean) => {
    const res = await createMutation.mutateAsync(
      buildCreatePolicyRequest(values, leaveTypeId ?? "", activate),
    );

    const policyId = res.data?.id;
    if (policyId) {
      // Sub-resources are keyed by policyId, so they must be saved after create.
      await requestRulesMutation.mutateAsync({ policyId, ...buildRequestRulesRequest(values) });
      await editRulesMutation.mutateAsync({ policyId, ...buildEditRulesRequest(values) });

      const approval = buildApprovalRequest(values);
      if (approval) {
        await approvalMutation.mutateAsync({ policyId, ...approval });
      }
    }

    setIsCreateModalOpen(false);
  };

  const handleOpen = (policy: TimeOffPolicy) => {
    const base = leaveTypeId ?? policy.leaveTypeId;
    router.push(`/settings/time/leave-type/${base}/policies/${policy.id}`);
  };

  const handleActivate = (policy: TimeOffPolicy) => {
    activateMutation.mutate({ id: policy.id });
  };

  const handleArchive = (policy: TimeOffPolicy) => {
    archiveMutation.mutate({ id: policy.id });
  };

  const handleDelete = async () => {
    if (!deletingPolicy) return;
    await deleteMutation.mutateAsync({ id: deletingPolicy.id });
    setDeletingPolicy(null);
  };

  return (
    <>
      <TimeOffPoliciesSettingsComponent
        policies={visiblePolicies}
        isLoading={isLoading}
        title={title}
        backHref={backHref}
        onCreateAction={() => setIsCreateModalOpen(true)}
        onOpenAction={handleOpen}
        onActivateAction={handleActivate}
        onArchiveAction={handleArchive}
        onDeleteAction={(policy) => setDeletingPolicy(policy)}
      />

      <PolicyWizardModal
        isOpen={isCreateModalOpen}
        isLoading={createMutation.isPending}
        mode="create"
        leaveTypeName={title}
        onSubmitAction={handleCreate}
        onCancelAction={() => setIsCreateModalOpen(false)}
      />

      <DeleteTimeOffPolicyModal
        isOpen={deletingPolicy !== null}
        isLoading={deleteMutation.isPending}
        policy={deletingPolicy}
        onConfirmAction={handleDelete}
        onRequestCloseAction={() => setDeletingPolicy(null)}
      />
    </>
  );
}
