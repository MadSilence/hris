"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { Archive02Icon } from "@hugeicons/core-free-icons";
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
import { LegalEntity } from "@/models/legalEntity";
import type { AssignedUsersStrategy } from "@/components/modules/settings/modules/legalEntity/actions/archiveLegalEntityAction";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  entity: LegalEntity;
  onConfirmAction: (strategy: AssignedUsersStrategy) => void;
  onRequestCloseAction: () => void;
};

export const ArchiveLegalEntityModal: React.FC<Props> = ({
  isOpen,
  isLoading = false,
  entity,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const t = useTranslations("structure.legalEntities");
  const tPlaces = useTranslations("structure.places");
  const tCommon = useTranslations("common");
  const count = entity?.assignedUsersCount ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon={Archive02Icon} />
            {tPlaces("archiveTitle", { name: entity?.name ?? "" })}
          </DialogTitle>
          <DialogDescription>
            {t("archive.description")}
          </DialogDescription>
        </DialogHeader>

        {count > 0 && (
          <p className="text-body text-tertiary">
            {t("archive.assignedNote", { count })}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => !isLoading && onRequestCloseAction()} disabled={isLoading}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={() => !isLoading && onConfirmAction("KEEP")} disabled={isLoading}>
            {isLoading ? tPlaces("archiving") : tCommon("actions.archive")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
