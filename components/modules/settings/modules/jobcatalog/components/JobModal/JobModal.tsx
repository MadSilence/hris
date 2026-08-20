"use client";

import { FC, useState } from "react";
import { Briefcase, Copy, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  JobForm,
  JobFormValues,
} from "@/components/modules/settings/modules/jobcatalog/components/JobForm";
import { JobFamily, JobLevelGroup } from "@/models/job";

export type JobModalMode = "create" | "edit" | "duplicate";

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  mode: JobModalMode;
  initialValues?: Partial<JobFormValues>;
  families: JobFamily[];
  levelGroups: JobLevelGroup[];
  isLevelsLoading?: boolean;
  takenCodes?: string[];
  errorMessage?: string | null;
  onConfirmAction: (submission: JobFormValues) => void;
  onRequestCloseAction: () => void;
};

/**
 * Duplicating a position is creating one with the source prefilled — the copy carries the name,
 * family, level and description over, and only the code is left blank because it is unique per
 * company.
 */
const COPY: Record<JobModalMode, { title: string; description: string; submit: string }> = {
  create: {
    title: "Add job",
    description: "A position is a family, a name and (optionally) a level.",
    submit: "Create",
  },
  edit: {
    title: "Edit job",
    description: "Change what this position is called or where it sits.",
    submit: "Save",
  },
  duplicate: {
    title: "Duplicate job",
    description: "Everything is copied except the code, which must stay unique.",
    submit: "Create",
  },
};

const ICON: Record<JobModalMode, typeof Briefcase> = {
  create: Briefcase,
  edit: Pencil,
  duplicate: Copy,
};

export const JobModal: FC<Props> = ({
  isOpen,
  isLoading,
  mode,
  initialValues,
  families,
  levelGroups,
  isLevelsLoading,
  takenCodes,
  errorMessage,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const copy = COPY[mode];
  const Icon = ICON[mode];

  const requestClose = () => {
    if (isLoading) return;

    if (isDirty) {
      setIsConfirmCancelOpen(true);
      return;
    }

    onRequestCloseAction();
  };

  const confirmClose = () => {
    setIsConfirmCancelOpen(false);
    onRequestCloseAction();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose className="gap-5 sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brown-100 text-brown-700">
                <Icon className="h-5 w-5"/>
              </span>
              <div className="space-y-1">
                <DialogTitle>{copy.title}</DialogTitle>
                <DialogDescription>{copy.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          )}

          <JobForm
            isLoading={isLoading}
            submitLabel={copy.submit}
            initialValues={initialValues}
            families={families}
            levelGroups={levelGroups}
            isLevelsLoading={isLevelsLoading}
            takenCodes={takenCodes}
            onCancelAction={requestClose}
            onDirtyChangeAction={setIsDirty}
            onSubmitAction={onConfirmAction}
          />
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={isConfirmCancelOpen}
        onCancelAction={() => setIsConfirmCancelOpen(false)}
        onConfirmAction={confirmClose}
      />
    </>
  );
};
