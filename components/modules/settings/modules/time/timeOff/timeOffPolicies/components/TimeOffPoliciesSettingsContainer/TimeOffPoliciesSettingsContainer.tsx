"use client";

import { showError } from "@/lib/errors/errorToast";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { TimeOffPoliciesSettingsComponent } from "../TimeOffPoliciesSettingsComponent";
import { DeleteTimeOffPolicyModal } from "../modals/DeleteTimeOffPolicyModal";
import {
  PolicyWizardModal,
  buildAccrualRequest,
  buildApprovalRequest,
  buildRestrictionsRequest,
  buildUpdatePolicyRequest,
  buildCreatePolicyRequest,
  buildEditRulesRequest,
  buildEligibilityRequest,
  buildRequestRulesRequest,
  buildTenureRulesRequest,
  type PolicyWizardValues,
} from "../wizard";

import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useSaveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useSaveTimeOffPolicy";
import { useDuplicateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useDuplicateTimeOffPolicy";
import { useCreateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useCreateTimeOffPolicy";
import { useActivateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useActivateTimeOffPolicy";
import { useArchiveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useArchiveTimeOffPolicy";
import { useUnarchiveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useUnarchiveTimeOffPolicy";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { useDeleteTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useDeleteTimeOffPolicy";

import type { TimeOffPolicy } from "@/models/timeOff";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";

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
  const duplicateMutation = useDuplicateTimeOffPolicy();
  const saveMutation = useSaveTimeOffPolicy();
  const activateMutation = useActivateTimeOffPolicy();
  const archiveMutation = useArchiveTimeOffPolicy();
  const unarchiveMutation = useUnarchiveTimeOffPolicy();
  const [archiveTarget, setArchiveTarget] = useState<TimeOffPolicy | null>(null);
  const deleteMutation = useDeleteTimeOffPolicy();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState<TimeOffPolicy | null>(null);
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) return <ErrorState error={error} />;

  const handleCreate = async (values: PolicyWizardValues, activate: boolean) => {
    const res = await createMutation.mutateAsync(
      buildCreatePolicyRequest(values, leaveTypeId ?? "", activate),
    );

    const policyId = res.data?.id;
    if (policyId) {
      // Sub-resources are keyed by policyId, so they are saved after the create — but in one call
      // and one transaction, not eight. A refusal partway used to leave a policy that exists and is
      // configured with half of what the person typed.
      await saveMutation.mutateAsync({
        id: policyId,
        name: null,
        policy: buildUpdatePolicyRequest(values),
        requestRules: buildRequestRulesRequest(values),
        editRules: buildEditRulesRequest(values),
        eligibility: buildEligibilityRequest(values),
        accrual: buildAccrualRequest(values),
        restrictions: buildRestrictionsRequest(values),
        tenureRules: buildTenureRulesRequest(values),
        approval: buildApprovalRequest(values),
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleOpen = (policy: TimeOffPolicy) => {
    const base = leaveTypeId ?? policy.leaveTypeId;
    router.push(`/settings/time/leave-type/${base}/policies/${policy.id}`);
  };

  const handleActivate = (policy: TimeOffPolicy) => {
    activateMutation.mutateAsync({ id: policy.id }).catch(showError);
  };

  const handleUnarchive = (policy: TimeOffPolicy) => {
    unarchiveMutation.mutate({ id: policy.id });
  };

  /**
   * Archive confirms, per `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 7.
   *
   * <p>It used to fire straight from the menu **with no error handling at all**, so a refused
   * archive was completely silent. The undo toast that briefly replaced that is kept as well: the
   * dialog answers "did you mean to", the undo answers "I meant to and I was wrong", and on an act
   * that removes a policy from every list it is worth having both. If that turns out to be one step
   * too many in use, the undo is the half to drop — the confirmation is the rule.
   */
  const confirmArchive = async () => {
    if (!archiveTarget) return;
    const policy = archiveTarget;
    try {
      await archiveMutation.mutateAsync({ id: policy.id });
      setArchiveTarget(null);
      showUndoToast({
        message: `${policy.name} archived`,
        onUndo: () => unarchiveMutation.mutateAsync({ id: policy.id }),
      });
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingPolicy) return;
    try {
      await deleteMutation.mutateAsync({ id: deletingPolicy.id });
      setDeletingPolicy(null);
    } catch (error) {
      // Only a draft can be deleted; the dialog stays up so the refusal has somewhere to be read.
      showError(error);
    }
  };

  /**
   * Copies the policy under a name nobody has to invent from scratch, as a draft.
   *
   * A prompt rather than a modal on purpose: the only thing to decide is the name, and a dialog for
   * one text field is a dialog for the sake of having one. If it grows a second question it becomes
   * a modal like the others.
   */
  const handleDuplicate = async (policy: TimeOffPolicy) => {
    const name = window.prompt(
      "Name for the copy",
      `${policy.displayName} (copy)`,
    );
    if (!name?.trim()) return;

    try {
      await duplicateMutation.mutateAsync({ id: policy.id, name: name.trim() });
    } catch (error) {
      showError(error);
    }
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
        onArchiveAction={setArchiveTarget}
        onUnarchiveAction={handleUnarchive}
        onDeleteAction={(policy) => setDeletingPolicy(policy)}
        onDuplicateAction={handleDuplicate}
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
      <ConfirmActionModal
        isOpen={archiveTarget !== null}
        title={`Archive "${archiveTarget?.name ?? ""}"`}
        description="An archived policy stops being offered and can be unarchived at any time \u2014 it comes back as a draft, so switching it on again is a separate step."
        confirmLabel="Archive"
        isLoading={archiveMutation.isPending}
        onConfirmAction={confirmArchive}
        onCancelAction={() => setArchiveTarget(null)}
      />

    </>
  );
}
