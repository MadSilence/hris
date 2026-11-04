"use client";

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
  const count = entity?.assignedUsersCount ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon={Archive02Icon} />
            Archive &quot;{entity?.name ?? ""}&quot;?
          </DialogTitle>
          <DialogDescription>
            Archived legal entities are hidden from the active list and can&apos;t be edited or assigned to, but you can
            unarchive them at any time.
          </DialogDescription>
        </DialogHeader>

        {count > 0 && (
          <p className="text-body text-tertiary">
            {count} {count === 1 ? "person is" : "people are"} assigned to this legal entity.
            {" "}Archiving keeps them assigned; unarchiving brings everything back as it was.
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => !isLoading && onRequestCloseAction()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={() => !isLoading && onConfirmAction("KEEP")} disabled={isLoading}>
            {isLoading ? "Archiving…" : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
