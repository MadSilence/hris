"use client";

import { FC, useState } from "react";
import { Copy, ListTree, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  JobFamilyForm,
  JobFamilyFormValues,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyForm";

export type JobFamilyModalMode = "create" | "edit" | "duplicate";

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  mode: JobFamilyModalMode;
  initialValues?: Partial<JobFamilyFormValues>;
  /** Names already taken, for the form's inline check. */
  existingNames?: string[];
  /** Server-side failure — the modal stays open and shows it instead of closing silently. */
  errorMessage?: string | null;
  onConfirmAction: (submission: JobFamilyFormValues) => void;
  onRequestCloseAction: () => void;
};

/**
 * One dialog for all three ways of producing a family. Duplicate is create with the source's
 * fields prefilled — the copy is the same shape as an original, so a separate dialog would be the
 * same form under a different title.
 */
const COPY: Record<JobFamilyModalMode, { title: string; description: string; submit: string }> = {
  create: {
    title: "Add job family",
    description: "Group related positions under one family.",
    submit: "Create",
  },
  edit: {
    title: "Edit job family",
    description: "Rename the family or update what it covers.",
    submit: "Save",
  },
  duplicate: {
    title: "Duplicate job family",
    description: "Copies the family and every position in it. Job codes are not copied.",
    submit: "Duplicate",
  },
};

const ICON: Record<JobFamilyModalMode, typeof ListTree> = {
  create: ListTree,
  edit: Pencil,
  duplicate: Copy,
};

export const JobFamilyModal: FC<Props> = ({
  isOpen,
  isLoading,
  mode,
  initialValues,
  existingNames,
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

          <JobFamilyForm
            isLoading={isLoading}
            submitLabel={copy.submit}
            initialValues={initialValues}
            existingNames={existingNames}
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
