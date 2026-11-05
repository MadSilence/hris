"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy01Icon, HierarchySquare02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import {
  JobFamilyForm,
  JobFamilyFormValues,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyForm";
import { InlineAlert } from "@/components/desact/alert";

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
const COPY = {
  create: {
    titleKey: "familyModal.create.title",
    descriptionKey: "familyModal.create.description",
    submitKey: "actions.add",
  },
  edit: {
    titleKey: "familyModal.edit.title",
    descriptionKey: "familyModal.edit.description",
    submitKey: "actions.save",
  },
  duplicate: {
    titleKey: "familyModal.duplicate.title",
    descriptionKey: "familyModal.duplicate.description",
    submitKey: "actions.duplicate",
  },
} as const satisfies Record<JobFamilyModalMode, { titleKey: string; descriptionKey: string; submitKey: string }>;

const ICON: Record<JobFamilyModalMode, IconSvgElement> = {
  create: HierarchySquare02Icon,
  edit: PencilEdit02Icon,
  duplicate: Copy01Icon,
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
  const t = useTranslations("structure.jobCatalog");
  const tCommon = useTranslations("common");
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
                <DialogTitle>{t(copy.titleKey)}</DialogTitle>
                <DialogDescription>{t(copy.descriptionKey)}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <InlineAlert tone="declined">
              {errorMessage}
            </InlineAlert>
          )}

          <JobFamilyForm
            isLoading={isLoading}
            submitLabel={tCommon(copy.submitKey)}
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
