"use client";

import React, { useEffect, useState } from "react";
import { Archive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
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
  const [strategy, setStrategy] = useState<AssignedUsersStrategy>("KEEP");
  const count = entity?.assignedUsersCount ?? 0;

  useEffect(() => {
    if (isOpen) setStrategy("KEEP");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5"/>
            Archive &quot;{entity?.name ?? ""}&quot;?
          </DialogTitle>
          <DialogDescription>
            Archived legal entities are hidden from the active list and can&apos;t be edited or assigned
            to, but you can restore them at any time.
          </DialogDescription>
        </DialogHeader>

        {count > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? "person is" : "people are"} assigned to this legal entity.
            </p>
            <StrategyOption
              selected={strategy === "KEEP"}
              onSelect={() => setStrategy("KEEP")}
              title="Keep assignments"
              description="People stay assigned; restoring brings everything back as it was."
            />
            <StrategyOption
              selected={strategy === "UNASSIGN"}
              onSelect={() => setStrategy("UNASSIGN")}
              title="Unassign everyone"
              description="Remove this legal entity from all assigned people. This can't be undone by restoring."
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => !isLoading && onRequestCloseAction()} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={() => !isLoading && onConfirmAction(strategy)} disabled={isLoading}>
            {isLoading ? "Archiving…" : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function StrategyOption({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
        selected ? "border-brown-400 bg-brown-50" : "border-brown-200 hover:bg-brown-50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full border ${
          selected ? "border-brown-500" : "border-brown-300"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-brown-500"/>}
      </span>
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
