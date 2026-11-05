"use client";

import { FC, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";
import { InlineAlert } from "@/components/desact/alert";

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  /** What is being deleted — it picks the sentences. */
  entityLabel: "level" | "group";
  entityName: string;
  /** Positions that lose their grade. For a track, summed over its grades. */
  affectedJobs: number;
  /** People holding one of those positions — they keep the position, only the grade goes. */
  affectedPeople: number;
  /** Grades removed with the track. Omitted for a single grade. */
  affectedLevels?: number;
  errorMessage?: string | null;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
};

/**
 * Removing a grade does not remove anyone's job — it takes the grade off the positions that used
 * it. That distinction is the whole point of the dialog: the blast radius is the catalogue, not
 * the roster.
 */
export const JobLevelDeleteModal: FC<Props> = ({
  isOpen,
  isLoading,
  entityLabel,
  entityName,
  affectedJobs,
  affectedPeople,
  affectedLevels,
  errorMessage,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const t = useTranslations("structure.jobLevels");
  const tCommon = useTranslations("common");
  const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;

  return (
  <AlertDialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open && !isLoading) onRequestCloseAction();
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
            <Icon icon={Delete02Icon} />
          </span>
          <div className="space-y-1">
            <AlertDialogTitle className="capitalize">{t(`delete.${entityLabel}.title`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.rich(`delete.${entityLabel}.lead`, { name: entityName, b: strong })}
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>

      <div className="rounded-card border border-divider bg-mist p-4">
        <div className="flex items-start gap-3">
          <Icon icon={Alert02Icon} className="mt-0.5 shrink-0 text-secondary" />

          <div>
            <h4 className="mb-1 font-medium text-primary">{t("delete.warning")}</h4>

            <div className="space-y-1 text-body text-secondary">
              {affectedLevels !== undefined && affectedLevels > 0 && (
                <p>{t.rich("delete.levelsToo", { count: affectedLevels, b: strong })}</p>
              )}

              {affectedJobs > 0 ? (
                <p>
                  {affectedPeople > 0
                    ? t.rich("delete.jobsLoseWithPeople", { jobs: affectedJobs, people: affectedPeople, b: strong })
                    : t.rich("delete.jobsLose", { jobs: affectedJobs, b: strong })}
                </p>
              ) : (
                <p>{t("delete.noPositions")}</p>
              )}

              <p>{t("delete.refusalNote")}</p>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <InlineAlert tone="declined">
          {errorMessage}
        </InlineAlert>
      )}

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>

        <AlertDialogAction
          disabled={isLoading}
          onClick={(e) => {
            // Stay open until the mutation settles — a refused delete has something to say.
            e.preventDefault();
            onConfirmAction();
          }}
          destructive
        >
          {t(`delete.${entityLabel}.title`)}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  );
};
