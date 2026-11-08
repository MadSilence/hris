"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

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
import { cn } from "@/lib/cn";

/**
 * The list's confirmations (ACTIONS_AND_MENUS § 7): Duplicate, Archive, Delete, Make me the owner. Like
 * `ConfirmActionModal` it stays open while the action runs and while it fails; the refusal is a declined
 * `InlineAlert` inside it (`automations-list` → Words, "Errors in dialogs").
 *
 * The confirm button has three looks: the accent, the red fill of a delete, and **the grey fill of an archive** —
 * `--text-tertiary` fill, white text, `--text-secondary` on hover (`automations-list` → Changes to SPEC, 2).
 */
export const ListConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  busyLabel: string;
  tone?: "primary" | "destructive" | "archive";
  busy?: boolean;
  error?: string | null;
  /** Anything under the sentences — a checkbox. */
  extra?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, children, confirmLabel, busyLabel, tone = "primary", busy = false, error, extra, onConfirm, onCancel }) => {
  const t = useTranslations("common");
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel();
      }}
    >
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2">{children}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {extra}
        {error ? <InlineAlert tone="declined">{error}</InlineAlert> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{t("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            destructive={tone === "destructive"}
            className={cn(tone === "archive" && "bg-tertiary text-on-accent hover:bg-secondary active:bg-secondary")}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {busy ? busyLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
