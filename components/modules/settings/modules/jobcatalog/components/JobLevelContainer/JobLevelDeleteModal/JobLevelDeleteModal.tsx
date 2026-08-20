"use client";

import { FC } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";

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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <Trash2 className="h-5 w-5"/>
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

      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600"/>

          <div>
            <h4 className="mb-1 font-medium text-red-800">Warning</h4>

            <div className="space-y-1 text-sm text-red-700">
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
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
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
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Delete {entityLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
