"use client";

import { useEffect, useRef, useState } from "react";
import { showError } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import type { RestoreChild } from "./restoreSelection";

type ImpactState = {
  /** What could come back; undefined until the answer arrives. */
  items: RestoreChild[] | undefined;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
};

type Params = {
  /** The record whose Unarchive was pressed; null while nothing is being restored. */
  targetId: string | null;
  impact: ImpactState;
  /**
   * Restores the record — alone when `restoreIds` is undefined. Rejects on a refusal; the hooks of
   * the three callers already turn an ERROR envelope into a rejection.
   */
  restore: (id: string, restoreIds: string[] | undefined) => Promise<unknown>;
  /** Clears the target: called once the restore is over, whichever way it went. */
  onFinished: () => void;
};

/**
 * The decision in front of the dialog: ask what the archive took along, and only if it took anything
 * open the choice. With nothing archived underneath, Unarchive restores at once, exactly as it did
 * before the dialog existed.
 *
 * Where a failure goes follows `hris/CLAUDE.md` § "Showing a failure": while the dialog is open, a
 * refusal is written inside it; when there never was a dialog — the immediate restore, or a failed
 * question — it is the sliding card.
 */
export const useRestoreWithChildren = ({ targetId, impact, restore, onFinished }: Params) => {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /**
   * The list as it was when the dialog opened. Frozen on purpose: a refetch behind the open dialog
   * (a window focus, an invalidation) must not reset what the reader has ticked.
   */
  const [choice, setChoice] = useState<{ targetId: string; items: RestoreChild[] } | null>(null);
  /** The target already decided on, so a re-render cannot restore it twice. */
  const handled = useRef<string | null>(null);

  const isAnswered = targetId !== null && !impact.isFetching;

  useEffect(() => {
    if (targetId === null) {
      handled.current = null;
      setChoice(null);
      return;
    }
    if (!isAnswered || handled.current === targetId) return;
    handled.current = targetId;

    if (impact.isError || !impact.items) {
      showError(impact.error);
      onFinished();
      return;
    }

    if (impact.items.length > 0) {
      setChoice({ targetId, items: impact.items });
      return;
    }

    restore(targetId, undefined)
      .catch((error: unknown) => showError(error))
      .finally(onFinished);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per target, on the answer
  }, [targetId, isAnswered]);

  const isDialogOpen = choice !== null && choice.targetId === targetId;

  const finish = () => {
    setIsPending(false);
    setErrorMessage(null);
    setChoice(null);
    onFinished();
  };

  const confirm = async (restoreIds: string[]) => {
    if (targetId === null) return;
    setIsPending(true);
    setErrorMessage(null);
    try {
      await restore(targetId, restoreIds);
      finish();
    } catch (error) {
      setIsPending(false);
      setErrorMessage(messageForError(error));
    }
  };

  return {
    /** True while the choice is on screen. */
    isDialogOpen,
    items: isDialogOpen ? choice.items : [],
    isPending,
    errorMessage,
    confirm,
    cancel: () => {
      if (!isPending) finish();
    },
  };
};
