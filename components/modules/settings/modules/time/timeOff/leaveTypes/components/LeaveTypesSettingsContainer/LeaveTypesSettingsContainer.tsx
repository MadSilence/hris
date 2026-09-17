"use client";

import { showError } from "@/lib/errors/errorToast";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { LeaveTypesSettingsComponent } from "../LeaveTypesSettingsComponent";
import { CreateLeaveTypeModal } from "../modals/CreateLeaveTypeModal";
import { EditLeaveTypeModal } from "../modals/EditLeaveTypeModal";

import { useLeaveTypes } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveTypes";
import { useCreateLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useCreateLeaveType";
import { useUpdateLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useUpdateLeaveType";
import { useRestoreLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useRestoreLeaveType";
import { useArchiveLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useArchiveLeaveType";

import type { LeaveType } from "@/models/timeOff";
import type { LeaveTypeFormValues } from "../modals/LeaveTypeForm";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";

export default function LeaveTypesSettingsContainer() {
  const router = useRouter();
  const { data: leaveTypes, isLoading, error } = useLeaveTypes();

  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const archiveMutation = useArchiveLeaveType();
  const restoreMutation = useRestoreLeaveType();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  /** Archive confirms, like the other four acts that do — it used to fire on the menu click. */
  const [archiveTarget, setArchiveTarget] = useState<LeaveType | null>(null);
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) return <ErrorState error={error} />;

  const toPayload = (values: LeaveTypeFormValues) => ({
    name: values.name,
    description: values.description || null,
    color: values.color || null,
    category: values.category === "" ? null : values.category,
  });

  const handleCreate = async (values: LeaveTypeFormValues) => {
    try {
      await createMutation.mutateAsync(toPayload(values));
      setIsCreateModalOpen(false);
    } catch (error) {
      // The modal stays open on purpose: whatever was typed is still there to correct.
      showError(error);
    }
  };

  const handleEdit = async (values: LeaveTypeFormValues) => {
    if (!editingLeaveType) return;
    try {
      // The version the dialog was opened with: a colleague's save in between is refused (E00409)
      // and the dialog stays open, instead of their change being overwritten silently.
      await updateMutation.mutateAsync({
        id: editingLeaveType.id,
        ...toPayload(values),
        version: editingLeaveType.version,
      });
      setEditingLeaveType(null);
    } catch (error) {
      showError(error);
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveMutation.mutateAsync({ id: archiveTarget.id });
      setArchiveTarget(null);
    } catch (error) {
      showError(error);
    }
  };

  const handleRestore = (leaveType: LeaveType) => {
    restoreMutation.mutateAsync({ id: leaveType.id }).catch(showError);
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
        onArchiveAction={setArchiveTarget}
        onRestoreAction={handleRestore}
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

      <ConfirmActionModal
        isOpen={archiveTarget !== null}
        title={`Archive "${archiveTarget?.name ?? ""}"`}
        description="An archived leave type cannot be used for new requests. Existing requests keep it, and you can unarchive it at any time."
        confirmLabel="Archive"
        isLoading={archiveMutation.isPending}
        onConfirmAction={confirmArchive}
        onCancelAction={() => setArchiveTarget(null)}
      />
    </>
  );
}
