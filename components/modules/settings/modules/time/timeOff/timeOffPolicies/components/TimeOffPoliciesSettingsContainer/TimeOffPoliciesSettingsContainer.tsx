"use client";

import { useState } from "react";

import { TimeOffPoliciesSettingsComponent } from "../TimeOffPoliciesSettingsComponent";
import { CreateTimeOffPolicyModal } from "../modals/CreateTimeOffPolicyModal";
import { EditTimeOffPolicyModal } from "../modals/EditTimeOffPolicyModal";
import { DeleteTimeOffPolicyModal } from "../modals/DeleteTimeOffPolicyModal";

import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useCreateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useCreateTimeOffPolicy";
import { useUpdateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useUpdateTimeOffPolicy";
import { useRenameTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useRenameTimeOffPolicy";
import { useActivateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useActivateTimeOffPolicy";
import { useArchiveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useArchiveTimeOffPolicy";
import { useDeleteTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useDeleteTimeOffPolicy";

import type { TimeOffPolicy } from "@/models/timeOff";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { CreateTimeOffPolicyFormValues } from "../modals/CreateTimeOffPolicyModal";
import type { EditTimeOffPolicyFormValues } from "../modals/EditTimeOffPolicyModal";

export default function TimeOffPoliciesSettingsContainer() {
  const { data: policies, isLoading, error } = useTimeOffPolicies();

  const createMutation = useCreateTimeOffPolicy();
  const updateMutation = useUpdateTimeOffPolicy();
  const renameMutation = useRenameTimeOffPolicy();
  const activateMutation = useActivateTimeOffPolicy();
  const archiveMutation = useArchiveTimeOffPolicy();
  const deleteMutation = useDeleteTimeOffPolicy();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<TimeOffPolicy | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<TimeOffPolicy | null>(null);

  if (error) throw error;

  const handleCreate = async (values: CreateTimeOffPolicyFormValues) => {
    await createMutation.mutateAsync({
      name: values.name.toLowerCase().replace(/\s+/g, "-"),
      displayName: values.name,
      description: values.description || null,
      status: TimeOffPolicyStatus.Draft,
      unit: values.unit,
      paid: values.paid,
      hiddenFromEmployees: false,
      unlimitedQuota: true,
      yearlyQuota: null,
      renewalType: TimeOffPolicyRenewalType.YearlyFixedDate,
      renewalFixedDay: 1,
      renewalFixedMonth: 1,
      carryoverType: TimeOffPolicyCarryoverType.None,
      carryoverLimit: null,
      carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.Never,
      carryoverExpiryValue: null,
      carryoverExpiryUnit: null,
    });
    setIsCreateModalOpen(false);
  };

  const handleEdit = async (values: EditTimeOffPolicyFormValues) => {
    if (!editingPolicy) return;

    const nameChanged = values.name !== editingPolicy.displayName;
    const configChanged =
      values.description !== (editingPolicy.description ?? "") ||
      values.unit !== editingPolicy.unit ||
      values.paid !== editingPolicy.paid;

    if (nameChanged) {
      await renameMutation.mutateAsync({
        id: editingPolicy.id,
        name: values.name.toLowerCase().replace(/\s+/g, "-"),
      });
    }

    if (configChanged) {
      await updateMutation.mutateAsync({
        id: editingPolicy.id,
        displayName: values.name,
        description: values.description || null,
        unit: values.unit,
        paid: values.paid,
        hiddenFromEmployees: editingPolicy.hiddenFromEmployees,
        unlimitedQuota: editingPolicy.unlimitedQuota,
        yearlyQuota: editingPolicy.yearlyQuota,
        renewalType: editingPolicy.renewalType,
        renewalFixedDay: editingPolicy.renewalFixedDay,
        renewalFixedMonth: editingPolicy.renewalFixedMonth,
        carryoverType: editingPolicy.carryoverType,
        carryoverLimit: editingPolicy.carryoverLimit,
        carryoverExpiryType: editingPolicy.carryoverExpiryType,
        carryoverExpiryValue: editingPolicy.carryoverExpiryValue,
        carryoverExpiryUnit: editingPolicy.carryoverExpiryUnit,
      });
    }

    setEditingPolicy(null);
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

  const isEditLoading =
    updateMutation.isPending || renameMutation.isPending;

  return (
    <>
      <TimeOffPoliciesSettingsComponent
        policies={policies ?? []}
        isLoading={isLoading}
        onCreateAction={() => setIsCreateModalOpen(true)}
        onEditAction={(policy) => setEditingPolicy(policy)}
        onActivateAction={handleActivate}
        onArchiveAction={handleArchive}
        onDeleteAction={(policy) => setDeletingPolicy(policy)}
      />

      <CreateTimeOffPolicyModal
        isOpen={isCreateModalOpen}
        isLoading={createMutation.isPending}
        onConfirmAction={handleCreate}
        onCancelAction={() => setIsCreateModalOpen(false)}
      />

      <EditTimeOffPolicyModal
        isOpen={editingPolicy !== null}
        isLoading={isEditLoading}
        policy={editingPolicy}
        onConfirmAction={handleEdit}
        onCancelAction={() => setEditingPolicy(null)}
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
