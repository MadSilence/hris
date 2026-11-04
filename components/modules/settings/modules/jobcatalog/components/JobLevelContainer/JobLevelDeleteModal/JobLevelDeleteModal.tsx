"use client";

import { FC } from "react";
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
  /** "level" or "group" — used in the sentences. */
  entityLabel: string;
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

const positions = (count: number) => `${count} ${count === 1 ? "position" : "positions"}`;

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
}) => (
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
            <AlertDialogTitle className="capitalize">Delete {entityLabel}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. {entityLabel} <strong>{entityName}</strong> will be
              permanently deleted.
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>

      <div className="rounded-card border border-divider bg-mist p-4">
        <div className="flex items-start gap-3">
          <Icon icon={Alert02Icon} className="mt-0.5 shrink-0 text-secondary" />

          <div>
            <h4 className="mb-1 font-medium text-primary">Warning</h4>

            <div className="space-y-1 text-body text-secondary">
              {affectedLevels !== undefined && affectedLevels > 0 && (
                <p>
                  <strong>{affectedLevels}</strong> level{affectedLevels === 1 ? "" : "s"} in this
                  group will be deleted too.
                </p>
              )}

              {affectedJobs > 0 ? (
                <p>
                  <strong>{positions(affectedJobs)}</strong> will lose their level and keep
                  everything else.{" "}
                  {affectedPeople > 0 && (
                    <>
                      <strong>{affectedPeople}</strong>{" "}
                      {affectedPeople === 1 ? "person holds" : "people hold"} one of them — nobody
                      loses their job.
                    </>
                  )}
                </p>
              ) : (
                <p>No positions use this level.</p>
              )}

              <p>
                Two positions that differ only by level cannot both survive losing it — the delete
                is refused if that would happen.
              </p>
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
            // Stay open until the mutation settles — a refused delete has something to say.
            e.preventDefault();
            onConfirmAction();
          }}
          destructive
        >
          Delete {entityLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
