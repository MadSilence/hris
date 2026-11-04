"use client";

import { FC, useState } from "react";
import { Briefcase01Icon, Copy01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  JobForm,
  JobFormValues,
} from "@/components/modules/settings/modules/jobcatalog/components/JobForm";
import { JobFamily, JobLevelGroup } from "@/models/job";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { InlineAlert } from "@/components/desact/alert";

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
    submit: "Add",
  },
  edit: {
    title: "Edit job",
    description: "Change what this position is called or where it sits.",
    submit: "Save",
  },
  duplicate: {
    title: "Duplicate job",
    description: "Everything is copied except the code, which must stay unique.",
    submit: "Add",
  },
};

const ICON: Record<JobModalMode, IconSvgElement> = {
  create: Briefcase01Icon,
  edit: PencilEdit02Icon,
  duplicate: Copy01Icon,
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
  const shownIcon = ICON[mode];

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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
                <Icon icon={shownIcon} />
              </span>
              <div className="space-y-1">
                <DialogTitle>{copy.title}</DialogTitle>
                <DialogDescription>{copy.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <InlineAlert tone="declined">
              {errorMessage}
            </InlineAlert>
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
