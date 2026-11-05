"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { Alert02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
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
import type { TimeOffPolicy } from "@/models/timeOff";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  policy: TimeOffPolicy | null;
  /**
   * Why the deletion was refused, shown inside the dialog.
   *
   * <p>Without it TIME_OFF_POLICY_IN_USE was invisible: the modal did not accept a message, so a
   * policy that could not be deleted simply did not get deleted and said nothing about why.
   */
  errorMessage?: string | null;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
};

export const DeleteTimeOffPolicyModal: FC<Props> = ({
  isOpen,
  isLoading = false,
  errorMessage,
  policy,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
  if (!policy) return null;

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
            <Icon icon={Clock01Icon} />
            {t("policies.delete.title")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {t.rich("policies.delete.description", {
              name: policy.name,
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />
            <div>
              <h4 className="mb-1 font-medium text-primary">{t("policies.delete.warning")}</h4>
              <p className="text-body text-secondary">
                {t("policies.delete.warningBody")}
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <FormError message={errorMessage} />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            destructive
          >
            {t("policies.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
