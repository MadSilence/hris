"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
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
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { RoleDeleteImpactDTO } from "@/api/modules/roles/dto/RoleDeleteImpactDTO";
import { messageForError } from "@/lib/errors/errorMessages";

export interface DeleteRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  roleName?: string;
  /** Null while the impact is still loading. */
  impact?: RoleDeleteImpactDTO | null;
  isImpactLoading?: boolean;
  /** Set when the impact could not be read at all — see the note where it is rendered. */
  impactError?: unknown;
  onConfirmAction: () => void | Promise<void>;
  onRequestCloseAction: () => void;
}

export const DeleteRoleModal: FC<DeleteRoleModalProps> = ({
  isOpen,
  isLoading = false,
  errorMessage,
  roleName,
  impact,
  isImpactLoading = false,
  impactError,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const b = (c: React.ReactNode) => <strong>{c}</strong>;
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon icon={Alert02Icon} />
            {t("roles.delete.title")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {roleName
              ? t.rich("roles.delete.body", { name: roleName, b })
              : t.rich("roles.delete.bodyUnnamed", { b })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 font-medium text-primary">{t("roles.delete.affects")}</h4>

              {isImpactLoading && (
                <p className="text-body text-secondary">{t("roles.delete.checking")}</p>
              )}

              {/*
                "We could not ask" is not the same as "there is nothing to say". When the impact
                request fails the counts are unknown, and the smoke run of 2026-08-28 found the
                dialog quietly showing the generic sentence below instead — the reader had no way
                to tell an empty role from an unreachable API before pressing Delete.
              */}
              {!isImpactLoading && !impact && !!impactError && (
                <p className="text-body text-secondary">
                  {t("roles.delete.impactUnknown", { error: messageForError(impactError) })}
                </p>
              )}

              {!isImpactLoading && !impact && !impactError && (
                <p className="text-body text-secondary">
                  {t("roles.delete.generic")}
                </p>
              )}

              {!isImpactLoading && impact && (
                <ul className="space-y-1 text-body text-secondary">
                  <li>{t.rich("roles.delete.holders", { count: impact.peopleCount, b })}</li>
                  {/* The number that actually matters: these people cannot work tomorrow. */}
                  <li>{t.rich("roles.delete.lastRole", { count: impact.peopleLosingLastRole, b })}</li>
                  {/* History, not pending work: these applications already happened. */}
                  {impact.bulkAssignmentCount > 0 && (
                    <li>{t.rich("roles.delete.bulk", { count: impact.bulkAssignmentCount, b })}</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        <p className="text-body text-tertiary">
          {t("roles.delete.archiveInstead")}
        </p>

        {errorMessage && (
          <FormError message={errorMessage} />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>

          {/*
            Disabled only while the impact question is still open. Once we know \u2014 or know we cannot
            find out \u2014 the decision belongs to the admin. This is what "presses Delete blind" in the
            2026-08-28 run actually was: not a missing branch, but a live button in front of one.
          */}
          <AlertDialogAction
            disabled={isLoading || isImpactLoading}
            onClick={(event) => {
              // Keep the dialog mounted while the mutation runs; the caller closes it on success.
              event.preventDefault();
              void onConfirmAction();
            }}
            destructive
          >
            <Icon icon={Delete02Icon} size="sm" />
            {t("roles.delete.title")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
