"use client";

import React, { useMemo, useState } from "react";
import { useJobFamily } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";
import { useJobLevelGroups } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroups";
import { JobFamilyComponent } from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/JobFamily/JobFamilyComponent";
import {
  JobFamilyModal,
  JobFamilyModalMode,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyModal";
import {
  JobModal,
  JobModalMode,
} from "@/components/modules/settings/modules/jobcatalog/components/JobModal";
import {
  CatalogImpactAction,
  CatalogImpactModal,
} from "@/components/modules/settings/modules/jobcatalog/components/CatalogImpactModal";
import { JobFamilyFormValues } from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyForm";
import { JobFormValues, NO_LEVEL } from "@/components/modules/settings/modules/jobcatalog/components/JobForm";
import { Loader } from "@/components/ui/Loader";
import { ActionStatus } from "@/components/models/ActionStatus";
import { Job, JobFamily } from "@/models/job";

import { useCreateJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useCreateJobFamilyAction";
import { useUpdateJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useUpdateJobFamilyAction";
import { useDuplicateJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useDuplicateJobFamilyAction";
import { useArchiveJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useArchiveJobFamilyAction";
import { useActivateJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useActivateJobFamilyAction";
import { useDeleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useDeleteJobFamilyAction";
import { useCreateJobAction } from "@/components/modules/settings/modules/jobcatalog/hooks/Job/useCreateJobAction";
import { useUpdateJobAction } from "@/components/modules/settings/modules/jobcatalog/hooks/Job/useUpdateJobAction";
import { useArchiveJobAction } from "@/components/modules/settings/modules/jobcatalog/hooks/Job/useArchiveJobAction";
import { useActivateJobAction } from "@/components/modules/settings/modules/jobcatalog/hooks/Job/useActivateJobAction";
import { useDeleteJobAction } from "@/components/modules/settings/modules/jobcatalog/hooks/Job/useDeleteJobAction";

/** What the family dialog is currently doing, and to which family. */
type FamilyDialog = { mode: JobFamilyModalMode; family: JobFamily | null };
/** Editing needs the job; creating needs the family it lands in. */
type JobDialog = { mode: JobModalMode; job: Job | null; family: JobFamily | null };
/** Archive and delete share one dialog, keyed by what is being acted on. */
type ImpactDialog =
  | { action: CatalogImpactAction; kind: "family"; family: JobFamily }
  | { action: CatalogImpactAction; kind: "job"; job: Job };

const NONE_TO_NULL = (levelId: string): string | null => (levelId === NO_LEVEL ? null : levelId);

export default function JobFamilyContainer() {
  const { data, isLoading, error } = useJobFamily();

  const [familyDialog, setFamilyDialog] = useState<FamilyDialog | null>(null);
  const [jobDialog, setJobDialog] = useState<JobDialog | null>(null);
  const [impactDialog, setImpactDialog] = useState<ImpactDialog | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Family just created — the list scrolls to it once the refetched data contains it.
  const [focusFamilyId, setFocusFamilyId] = useState<string | null>(null);

  // The grade picker is only needed once a job dialog is open; fetching it with the page would
  // cost every visitor a request for a list most of them never see.
  const { data: levelGroups, isLoading: isLevelsLoading } = useJobLevelGroups(jobDialog !== null);

  const createFamily = useCreateJobFamilyAction();
  const updateFamily = useUpdateJobFamilyAction();
  const duplicateFamily = useDuplicateJobFamilyAction();
  const archiveFamily = useArchiveJobFamilyAction();
  const activateFamily = useActivateJobFamilyAction();
  const deleteFamily = useDeleteJobFamilyAction();

  const createJob = useCreateJobAction();
  const updateJob = useUpdateJobAction();
  const archiveJob = useArchiveJobAction();
  const activateJob = useActivateJobAction();
  const deleteJob = useDeleteJobAction();

  const families = useMemo(() => data ?? [], [data]);

  /** Names taken by *other* families — the one being edited may keep its own. */
  const otherFamilyNames = useMemo(() => {
    const current = familyDialog?.mode === "edit" ? familyDialog.family?.id : undefined;
    return families.filter((f) => f.id !== current).map((f) => f.name);
  }, [families, familyDialog]);

  /** Codes taken by *other* positions, for the job form's inline check. */
  const otherJobCodes = useMemo(() => {
    const current = jobDialog?.mode === "edit" ? jobDialog.job?.id : undefined;
    return families
      .flatMap((f) => f.jobs)
      .filter((j) => j.id !== current && j.code)
      .map((j) => j.code as string);
  }, [families, jobDialog]);

  const closeDialogs = () => {
    setFamilyDialog(null);
    setJobDialog(null);
    setImpactDialog(null);
    setErrorMessage(null);
  };

  /**
   * Mutations return an envelope rather than throwing, so success is a value to inspect.
   * `onCreated` receives the new id when the caller wants to reveal what was just made.
   */
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

  const submitFamily = async (values: JobFamilyFormValues) => {
    setErrorMessage(null);
    if (!familyDialog) return;

    const description = values.description || null;

    if (familyDialog.mode === "create") {
      settle(await createFamily.mutateAsync({ name: values.name, description }), setFocusFamilyId);
      return;
    }
    if (familyDialog.mode === "duplicate" && familyDialog.family) {
      settle(
        await duplicateFamily.mutateAsync({ id: familyDialog.family.id, name: values.name }),
        setFocusFamilyId,
      );
      return;
    }
    if (familyDialog.family) {
      settle(
        await updateFamily.mutateAsync({
          id: familyDialog.family.id,
          name: values.name,
          description,
          clearDescription: description === null,
        }),
      );
    }
  };

  const submitJob = async (values: JobFormValues) => {
    setErrorMessage(null);
    if (!jobDialog) return;

    const levelId = NONE_TO_NULL(values.levelId);
    const code = values.code || null;
    const description = values.description || null;

    if (jobDialog.mode === "edit" && jobDialog.job) {
      settle(
        await updateJob.mutateAsync({
          id: jobDialog.job.id,
          name: values.name,
          familyId: values.familyId,
          levelId,
          clearLevel: levelId === null,
          code,
          clearCode: code === null,
          description,
          clearDescription: description === null,
        }),
      );
      return;
    }

    settle(
      await createJob.mutateAsync({
        familyId: values.familyId,
        levelId,
        name: values.name,
        code,
        description,
      }),
    );
  };

  const confirmImpact = async () => {
    setErrorMessage(null);
    if (!impactDialog) return;

    if (impactDialog.kind === "family") {
      const id = impactDialog.family.id;
      settle(
        impactDialog.action === "delete"
          ? await deleteFamily.mutateAsync({ id })
          : await archiveFamily.mutateAsync({ id }),
      );
      return;
    }

    const id = impactDialog.job.id;
    settle(
      impactDialog.action === "delete"
        ? await deleteJob.mutateAsync({ id })
        : await archiveJob.mutateAsync({ id }),
    );
  };

  const restoreFamily = async (family: JobFamily) => {
    setErrorMessage(null);
    await activateFamily.mutateAsync({ id: family.id });
  };

  const restoreJob = async (job: Job) => {
    setErrorMessage(null);
    await activateJob.mutateAsync({ id: job.id });
  };

  if (error) {
    return (
      <div className="py-10 text-sm text-muted-foreground">Failed to load job families</div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader/>
      </div>
    );
  }

  const isFamilySaving =
    createFamily.isPending || updateFamily.isPending || duplicateFamily.isPending;
  const isJobSaving = createJob.isPending || updateJob.isPending;
  const isImpactPending =
    archiveFamily.isPending || deleteFamily.isPending || archiveJob.isPending || deleteJob.isPending;

  return (
    <>
      <JobFamilyComponent
        jobFamilies={families}
        onCreateFamily={() => setFamilyDialog({ mode: "create", family: null })}
        onEditFamily={(family) => setFamilyDialog({ mode: "edit", family })}
        onDuplicateFamily={(family) => setFamilyDialog({ mode: "duplicate", family })}
        onArchiveFamily={(family) => setImpactDialog({ action: "archive", kind: "family", family })}
        onActivateFamily={restoreFamily}
        onDeleteFamily={(family) => setImpactDialog({ action: "delete", kind: "family", family })}
        onCreateJob={(family) => setJobDialog({ mode: "create", job: null, family })}
        onEditJob={(job) => setJobDialog({ mode: "edit", job, family: null })}
        onDuplicateJob={(job) => setJobDialog({ mode: "duplicate", job, family: null })}
        onArchiveJob={(job) => setImpactDialog({ action: "archive", kind: "job", job })}
        onActivateJob={restoreJob}
        onDeleteJob={(job) => setImpactDialog({ action: "delete", kind: "job", job })}
        focusFamilyId={focusFamilyId}
        onFocusFamilyHandled={() => setFocusFamilyId(null)}
      />

      {familyDialog && (
        <JobFamilyModal
          isOpen
          isLoading={isFamilySaving}
          mode={familyDialog.mode}
          existingNames={otherFamilyNames}
          errorMessage={errorMessage}
          initialValues={familyInitialValues(familyDialog)}
          onConfirmAction={submitFamily}
          onRequestCloseAction={closeDialogs}
        />
      )}

      {jobDialog && (
        <JobModal
          isOpen
          isLoading={isJobSaving}
          mode={jobDialog.mode}
          families={families}
          levelGroups={levelGroups ?? []}
          isLevelsLoading={isLevelsLoading}
          takenCodes={otherJobCodes}
          errorMessage={errorMessage}
          initialValues={jobInitialValues(jobDialog)}
          onConfirmAction={submitJob}
          onRequestCloseAction={closeDialogs}
        />
      )}

      {impactDialog && (
        <CatalogImpactModal
          isOpen
          isLoading={isImpactPending}
          action={impactDialog.action}
          errorMessage={errorMessage}
          {...impactProps(impactDialog)}
          onConfirmAction={confirmImpact}
          onRequestCloseAction={closeDialogs}
        />
      )}
    </>
  );
}

const familyInitialValues = (dialog: FamilyDialog): Partial<JobFamilyFormValues> | undefined => {
  if (!dialog.family) return undefined;

  // A duplicate opens with a name that is free, so the inline uniqueness check passes on sight.
  const name = dialog.mode === "duplicate" ? `${dialog.family.name} (copy)` : dialog.family.name;
  return { name, description: dialog.family.description ?? "" };
};

const jobInitialValues = (dialog: JobDialog): Partial<JobFormValues> | undefined => {
  if (dialog.mode === "create") {
    return dialog.family ? { familyId: dialog.family.id } : undefined;
  }
  if (!dialog.job) return undefined;

  const job = dialog.job;
  return {
    // Duplicating carries everything over except the code — it is unique per company, so the copy
    // starts without one rather than with a name the user has to invent a suffix for.
    name: dialog.mode === "duplicate" ? `${job.name} (copy)` : job.name,
    familyId: job.familyId ?? "",
    levelId: job.level?.id ?? NO_LEVEL,
    code: dialog.mode === "duplicate" ? "" : job.code ?? "",
    description: job.description ?? "",
  };
};

const impactProps = (dialog: ImpactDialog) => {
  if (dialog.kind === "family") {
    return {
      entityLabel: "job family",
      entityName: dialog.family.name,
      affectedPeople: dialog.family.assignedUsersCount,
      affectedJobs: dialog.family.jobs.length,
    };
  }
  return {
    entityLabel: "job",
    entityName: dialog.job.name,
    affectedPeople: dialog.job.assignedUsersCount,
  };
};
