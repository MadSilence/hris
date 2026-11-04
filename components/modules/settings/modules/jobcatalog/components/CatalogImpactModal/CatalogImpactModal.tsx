"use client";

import { FC, ReactNode } from "react";
import { Alert02Icon, Archive02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
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

export type CatalogImpactAction = "archive" | "delete";

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  action: CatalogImpactAction;
  /** "job" / "job family" — used in the sentences. */
  entityLabel: string;
  entityName: string;
  /** How many people currently hold this position (or any position in this family). */
  affectedPeople: number;
  /** Positions that go with a family. Omitted for a single job. */
  affectedJobs?: number;
  errorMessage?: string | null;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
};

const people = (count: number) => `${count} ${count === 1 ? "person" : "people"}`;

/**
 * Archiving and deleting are different in permanence but identical in blast radius: both take the
 * position away from everyone holding it. The dialog leads with that number rather than burying it,
 * because it is the part that cannot be undone by re-creating the row afterwards.
 */
export const CatalogImpactModal: FC<Props> = ({
  isOpen,
  isLoading,
  action,
  entityLabel,
  entityName,
  affectedPeople,
  affectedJobs,
  errorMessage,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const isDelete = action === "delete";
  const actionIcon = isDelete ? Delete02Icon : Archive02Icon;

  const title = `${isDelete ? "Delete" : "Archive"} ${entityLabel}`;
  const confirmLabel = title;

  const lead: ReactNode = isDelete ? (
    <>
      This action cannot be undone. {entityLabel} <strong>{entityName}</strong> will be permanently
      deleted.
    </>
  ) : (
    <>
      {entityLabel} <strong>{entityName}</strong> will be moved to archive. It stays in the
      catalogue, marked archived, and can no longer be assigned.
    </>
  );

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
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-popover ${
                "bg-mist text-secondary"
              }`}
            >
              <Icon icon={actionIcon} />
            </span>
            <div className="space-y-1">
              <AlertDialogTitle className="capitalize">{title}</AlertDialogTitle>
              <AlertDialogDescription>{lead}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 shrink-0 text-secondary" />

            <div>
              <h4 className="mb-1 font-medium text-primary">Warning</h4>

              <div className="space-y-1 text-body text-secondary">
                {affectedJobs !== undefined && affectedJobs > 0 && (
                  <p>
                    <strong>{affectedJobs}</strong> position
                    {affectedJobs === 1 ? "" : "s"} in this family will be{" "}
                    {isDelete ? "deleted" : "archived"} too.
                  </p>
                )}

                {affectedPeople > 0 ? (
                  <p>
                    <strong>{people(affectedPeople)}</strong> will lose their position. Their profile
                    will show no job until you assign a new one.
                  </p>
                ) : (
                  <p>Nobody currently holds this position.</p>
                )}

                <p>The change is recorded in each person&apos;s job history.</p>
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
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              // Confirming keeps the dialog open until the mutation settles, so a server-side
              // failure has somewhere to render.
              e.preventDefault();
              onConfirmAction();
            }}
            destructive={isDelete}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
