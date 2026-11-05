"use client";

import { FC } from "react";
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
import { LegalEntity } from "@/models/legalEntity";
import type { DetachedPeopleImpact } from "@/models/user/DetachedPeopleImpact";
import { DetachedPeopleNotice } from "@/components/modules/settings/shared/DetachedPeopleNotice";

type DeleteLegalEntityModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  entity: LegalEntity;
  /** Who deleting detaches. Without it the dialog falls back to the count the entity row carries. */
  impact?: DetachedPeopleImpact;
  impactLoading?: boolean;
  impactError?: boolean;
};

/**
 * The same shape as the office's delete (`DeleteOfficeModal`): one flow, one dialog. The two had a
 * question title on one side and an icon, a heading and a "Warning" block on the other (SWEEP S6).
 */
export const DeleteLegalEntityModal: FC<DeleteLegalEntityModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  entity,
  impact,
  impactLoading,
  impactError,
}) => {
  const t = useTranslations("structure.legalEntities");
  const tCommon = useTranslations("common");
  const asked = impact !== undefined || impactLoading || impactError;
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("delete.title", { name: entity?.name ?? "" })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {asked
              ? t("delete.body")
              : entity?.assignedUsersCount
                ? t("delete.bodyWithCount", { count: entity.assignedUsersCount })
                : t("delete.bodyAnyone")}
          </AlertDialogDescription>
          {asked ? (
            <DetachedPeopleNotice
              impact={impact}
              isLoading={impactLoading}
              isError={impactError}
              kind="legalEntity"
            />
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* No onClick on Cancel: AlertDialogCancel already closes the dialog, which fires onOpenChange. */}
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || impactLoading}
            destructive
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
          >
            {tCommon("actions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
