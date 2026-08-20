"use client";

import React, { useEffect, useMemo, useState } from "react";

import { JobLevel as JobLevelModel, JobLevelGroup } from "@/models/job";
import { Loader } from "@/components/ui/Loader";
import { ActionStatus } from "@/components/models/ActionStatus";
import { JobLevel } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevel/JobLevel";
import { JobLevelNameModal } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelNameModal/JobLevelNameModal";
import { JobLevelDeleteModal } from "@/components/modules/settings/modules/jobcatalog/components/JobLevelContainer/JobLevelDeleteModal/JobLevelDeleteModal";
import { useJobLevelGroups } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroups";
import { useCreateJobLevelGroupAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useCreateJobLevelGroupAction";
import { useUpdateJobLevelGroupAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useUpdateJobLevelGroupAction";
import { useDeleteJobLevelGroupAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useDeleteJobLevelGroupAction";
import { useReorderJobLevelsAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useReorderJobLevelsAction";
import { useCreateJobLevelAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevel/useCreateJobLevelAction";
import { useUpdateJobLevelAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevel/useUpdateJobLevelAction";
import { useDeleteJobLevelAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevel/useDeleteJobLevelAction";

/** Which name is being entered, and for what. */
type NameDialog =
  | { kind: "group"; mode: "create" }
  | { kind: "group"; mode: "edit"; group: JobLevelGroup }
  | { kind: "level"; mode: "create"; group: JobLevelGroup }
  | { kind: "level"; mode: "edit"; group: JobLevelGroup; level: JobLevelModel };

type DeleteDialog =
  | { kind: "group"; group: JobLevelGroup }
  | { kind: "level"; group: JobLevelGroup; level: JobLevelModel };

export default function JobLevelContainer() {
  const { data, isLoading, error } = useJobLevelGroups();

  const [managingGroupId, setManagingGroupId] = useState<string | null>(null);
  const [nameDialog, setNameDialog] = useState<NameDialog | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Track just created — the list scrolls to it and drops it straight into manage mode.
  const [focusGroupId, setFocusGroupId] = useState<string | null>(null);

  const createGroup = useCreateJobLevelGroupAction();
  const updateGroup = useUpdateJobLevelGroupAction();
  const deleteGroup = useDeleteJobLevelGroupAction();
  const reorderLevels = useReorderJobLevelsAction();
  const createLevel = useCreateJobLevelAction();
  const updateLevel = useUpdateJobLevelAction();
  const deleteLevel = useDeleteJobLevelAction();

  const groups = useMemo(() => data ?? [], [data]);

  // A new track is created empty, so the useful next action is adding grades to it — which lives
  // in manage mode. Dropping it there saves the "where do I add levels" round trip.
  useEffect(() => {
    if (!focusGroupId) return;
    if (!groups.some((g) => g.id === focusGroupId)) return;

    setManagingGroupId(focusGroupId);
    document
      .querySelector(`[data-group-id="${focusGroupId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFocusGroupId(null);
  }, [focusGroupId, groups]);

  const closeDialogs = () => {
    setNameDialog(null);
    setDeleteDialog(null);
    setErrorMessage(null);
  };

  const settle = (
    result: { status: ActionStatus; errorMessage?: string; data?: { id: string } },
    onCreated?: (id: string | null) => void,
  ) => {
    if (result.status === ActionStatus.SUCCESS) {
      onCreated?.(result.data?.id ?? null);
      closeDialogs();
      return;
    }
    setErrorMessage(result.errorMessage ?? "Something went wrong. Please try again.");
  };

  const submitName = async (name: string) => {
    setErrorMessage(null);
    if (!nameDialog) return;

    if (nameDialog.kind === "group") {
      settle(
        nameDialog.mode === "create"
          ? await createGroup.mutateAsync({ name })
          : await updateGroup.mutateAsync({ id: nameDialog.group.id, name }),
        nameDialog.mode === "create" ? setFocusGroupId : undefined,
      );
      return;
    }

    settle(
      nameDialog.mode === "create"
        ? await createLevel.mutateAsync({ groupId: nameDialog.group.id, name })
        : await updateLevel.mutateAsync({ id: nameDialog.level.id, name }),
    );
  };

  const confirmDelete = async () => {
    setErrorMessage(null);
    if (!deleteDialog) return;

    settle(
      deleteDialog.kind === "group"
        ? await deleteGroup.mutateAsync({ id: deleteDialog.group.id })
        : await deleteLevel.mutateAsync({ id: deleteDialog.level.id }),
    );
  };

  /**
   * Moving a rung rewrites the whole ladder: the backend takes the complete order and rejects a
   * partial list, so a swap is expressed as the new full sequence.
   */
  const moveLevel = async (group: JobLevelGroup, level: JobLevelModel, direction: -1 | 1) => {
    setErrorMessage(null);

    const ordered = [...group.levels].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const from = ordered.findIndex((l) => l.id === level.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ordered.length) return;

    const next = [...ordered];
    [next[from], next[to]] = [next[to], next[from]];

    const result = await reorderLevels.mutateAsync({
      groupId: group.id,
      levelIds: next.map((l) => l.id),
    });
    if (result.status === ActionStatus.ERROR) {
      setErrorMessage(result.errorMessage ?? "Could not reorder levels.");
    }
  };

  if (error) {
    return <div className="py-10 text-sm text-muted-foreground">Failed to load job levels</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader/>
      </div>
    );
  }

  const isSavingName =
    createGroup.isPending || updateGroup.isPending || createLevel.isPending || updateLevel.isPending;
  const isDeleting = deleteGroup.isPending || deleteLevel.isPending;

  return (
    <>
      <JobLevel
        groups={groups}
        managingGroupId={managingGroupId}
        onToggleManaging={(groupId) =>
          setManagingGroupId((current) => (current === groupId ? null : groupId))
        }
        onCreateGroup={() => setNameDialog({ kind: "group", mode: "create" })}
        onEditGroup={(group) => setNameDialog({ kind: "group", mode: "edit", group })}
        onDeleteGroup={(group) => setDeleteDialog({ kind: "group", group })}
        onCreateLevel={(group) => setNameDialog({ kind: "level", mode: "create", group })}
        onEditLevel={(group, level) => setNameDialog({ kind: "level", mode: "edit", group, level })}
        onDeleteLevel={(group, level) => setDeleteDialog({ kind: "level", group, level })}
        onMoveLevel={moveLevel}
        isReordering={reorderLevels.isPending}
      />

      {nameDialog && (
        <JobLevelNameModal
          isOpen
          isLoading={isSavingName}
          errorMessage={errorMessage}
          onConfirmAction={submitName}
          onRequestCloseAction={closeDialogs}
          {...nameModalCopy(nameDialog, groups)}
        />
      )}

      {deleteDialog && (
        <JobLevelDeleteModal
          isOpen
          isLoading={isDeleting}
          errorMessage={errorMessage}
          onConfirmAction={confirmDelete}
          onRequestCloseAction={closeDialogs}
          {...deleteModalProps(deleteDialog)}
        />
      )}
    </>
  );
}

const nameModalCopy = (dialog: NameDialog, groups: JobLevelGroup[]) => {
  if (dialog.kind === "group") {
    const names = groups
      .filter((g) => dialog.mode === "create" || g.id !== dialog.group.id)
      .map((g) => g.name);

    return dialog.mode === "create"
      ? {
          title: "Add job group",
          description: "A career track employees progress through.",
          submitLabel: "Create",
          fieldLabel: "Name",
          placeholder: "e.g., Individual Contributor",
          existingNames: names,
        }
      : {
          title: "Rename job group",
          description: "The track keeps its levels and their order.",
          submitLabel: "Save",
          fieldLabel: "Name",
          placeholder: "e.g., Individual Contributor",
          initialName: dialog.group.name,
          existingNames: names,
        };
  }

  // Grade names are unique within their track, not across the company.
  const names = dialog.group.levels.map((l) => l.name);

  return dialog.mode === "create"
    ? {
        title: "Add level",
        description: `A new rung at the bottom of ${dialog.group.name}.`,
        submitLabel: "Create",
        fieldLabel: "Name",
        placeholder: "e.g., L3 - Senior",
        existingNames: names,
      }
    : {
        title: "Rename level",
        description: "Positions using this level follow the new name.",
        submitLabel: "Save",
        fieldLabel: "Name",
        placeholder: "e.g., L3 - Senior",
        initialName: dialog.level.name,
        existingNames: names,
      };
};

const deleteModalProps = (dialog: DeleteDialog) => {
  if (dialog.kind === "group") {
    return {
      entityLabel: "group",
      entityName: dialog.group.name,
      affectedJobs: dialog.group.assignedJobsCount,
      affectedPeople: dialog.group.assignedUsersCount,
      affectedLevels: dialog.group.levels.length,
    };
  }
  return {
    entityLabel: "level",
    entityName: dialog.level.name,
    affectedJobs: dialog.level.assignedJobsCount ?? 0,
    affectedPeople: dialog.level.assignedUsersCount ?? 0,
  };
};
