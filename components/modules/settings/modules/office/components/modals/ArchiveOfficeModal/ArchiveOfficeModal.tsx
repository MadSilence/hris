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
import { Office } from "@/models/office";
import type { AssignedUsersStrategy } from "@/components/modules/settings/modules/office/actions/archiveOfficeAction";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  office: Office;
  onConfirmAction: (strategy: AssignedUsersStrategy) => void;
  onRequestCloseAction: () => void;
};

export const ArchiveOfficeModal: React.FC<Props> = ({
  isOpen,
  isLoading = false,
  office,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const count = office?.assignedUsersCount ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon={Archive02Icon} />
            Archive &quot;{office?.name ?? ""}&quot;?
          </DialogTitle>
          <DialogDescription>
            Archived offices are hidden from the active list and can&apos;t be edited or assigned to, but you can
            unarchive them at any time.
          </DialogDescription>
        </DialogHeader>

        {count > 0 && (
          <p className="text-body text-tertiary">
            {count} {count === 1 ? "person is" : "people are"} assigned to this office.
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
