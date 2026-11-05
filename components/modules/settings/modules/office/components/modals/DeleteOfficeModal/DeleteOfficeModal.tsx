"use client";

import { useTranslations } from "next-intl";
import React from "react";
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
import { Office } from "@/models/office";
import type { DetachedPeopleImpact } from "@/models/user/DetachedPeopleImpact";
import { DetachedPeopleNotice } from "@/components/modules/settings/shared/DetachedPeopleNotice";

type DeleteOfficeModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  office: Office;
  /** Who deleting detaches. Without it the dialog falls back to the count the office row carries. */
  impact?: DetachedPeopleImpact;
  impactLoading?: boolean;
  impactError?: boolean;
};

export const DeleteOfficeModal: React.FC<DeleteOfficeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  office,
  impact,
  impactLoading,
  impactError,
}) => {
  const t = useTranslations("structure.offices");
  const tCommon = useTranslations("common");
  const asked = impact !== undefined || impactLoading || impactError;
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("delete.title", { name: office?.name ?? "" })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {asked
              ? t("delete.body")
              : office?.assignedUsersCount
                ? t("delete.bodyWithCount", { count: office.assignedUsersCount })
                : t("delete.bodyAnyone")}
          </AlertDialogDescription>
          {asked ? (
            <DetachedPeopleNotice impact={impact} isLoading={impactLoading} isError={impactError} kind="office" />
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* No onClick on Cancel: AlertDialogCancel already closes the dialog, which fires
              onOpenChange — adding a handler here called onRequestCloseAction twice per click. */}
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading || impactLoading} destructive onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}>
            {tCommon("actions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
