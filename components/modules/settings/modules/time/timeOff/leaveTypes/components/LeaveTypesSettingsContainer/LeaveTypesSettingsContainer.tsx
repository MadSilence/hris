"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LeaveTypesSettingsComponent } from "../LeaveTypesSettingsComponent";
import { CreateLeaveTypeModal } from "../modals/CreateLeaveTypeModal";
import { EditLeaveTypeModal } from "../modals/EditLeaveTypeModal";

import { useLeaveTypes } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveTypes";
import { useCreateLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useCreateLeaveType";
import { useUpdateLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useUpdateLeaveType";
import { useArchiveLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useArchiveLeaveType";

import type { LeaveType } from "@/models/timeOff";
import type { LeaveTypeFormValues } from "../modals/LeaveTypeForm";

export default function LeaveTypesSettingsContainer() {
  const router = useRouter();
  const { data: leaveTypes, isLoading, error } = useLeaveTypes();

  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const archiveMutation = useArchiveLeaveType();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);

  if (error) throw error;

  const toPayload = (values: LeaveTypeFormValues) => ({
    name: values.name,
    description: values.description || null,
    color: values.color || null,
    category: values.category === "" ? null : values.category,
  });

  const handleCreate = async (values: LeaveTypeFormValues) => {
    await createMutation.mutateAsync(toPayload(values));
    setIsCreateModalOpen(false);
  };

  const handleEdit = async (values: LeaveTypeFormValues) => {
    if (!editingLeaveType) return;
    await updateMutation.mutateAsync({ id: editingLeaveType.id, ...toPayload(values) });
    setEditingLeaveType(null);
  };

  const handleArchive = (leaveType: LeaveType) => {
    archiveMutation.mutate({ id: leaveType.id });
  };

  const handleOpen = (leaveType: LeaveType) => {
    router.push(`/settings/time/leave-type/${leaveType.id}/policies`);
  };

  return (
    <>
      <LeaveTypesSettingsComponent
        leaveTypes={leaveTypes ?? []}
        isLoading={isLoading}
        onCreateAction={() => setIsCreateModalOpen(true)}
        onOpenAction={handleOpen}
        onEditAction={(leaveType) => setEditingLeaveType(leaveType)}
        onArchiveAction={handleArchive}
      />

      <CreateLeaveTypeModal
        isOpen={isCreateModalOpen}
        isLoading={createMutation.isPending}
        onConfirmAction={handleCreate}
        onCancelAction={() => setIsCreateModalOpen(false)}
      />

      <EditLeaveTypeModal
        isOpen={editingLeaveType !== null}
        isLoading={updateMutation.isPending}
        leaveType={editingLeaveType}
        onConfirmAction={handleEdit}
        onCancelAction={() => setEditingLeaveType(null)}
      />
    </>
  );
}
