"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import {
  RolePermissionChange,
  ACCESS_ACTION_LABEL_KEYS,
  SCOPE_CHOICE_LABEL_KEYS,
} from "@/components/modules/settings/modules/roles/utils/rolePermissionsPayload";

export interface RolePermissionsSummaryModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  errorMessage?: string;
  changes: RolePermissionChange[];
  onCancelAction: () => void;
  onConfirmAction: () => void;
}

export const RolePermissionsSummaryModal: FC<RolePermissionsSummaryModalProps> = ({
  isOpen,
  isSaving = false,
  errorMessage,
  changes,
  onCancelAction,
  onConfirmAction,
}) => {
  const tAccess = useTranslations("access");
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSaving) onCancelAction(); }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("roles.permissions.reviewTitle")}</DialogTitle>
          <DialogDescription>
            {t("roles.review.changes", { count: changes.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-control border border-divider divide-y divide-divider">
          {changes.map((change) => (
            <div
              key={`${change.resourceCode}:${change.action}`}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-body font-medium">{tAccess(`resources.${change.resourceMessageKey}.label`)}</p>
                <p className="text-hint text-tertiary">{t(ACCESS_ACTION_LABEL_KEYS[change.action])}</p>
              </div>

              <div className="flex flex-none items-center gap-2 text-body">
                <span className="text-tertiary">{t(SCOPE_CHOICE_LABEL_KEYS[change.from])}</span>
                <Icon icon={ArrowRight02Icon} size="sm" className="text-tertiary" />
                <span className="font-medium">{t(SCOPE_CHOICE_LABEL_KEYS[change.to])}</span>
              </div>
            </div>
          ))}
        </div>

        <FormError message={errorMessage} />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancelAction} disabled={isSaving}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={onConfirmAction} disabled={isSaving}>
            {isSaving ? tCommon("actions.saving") : tCommon("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
