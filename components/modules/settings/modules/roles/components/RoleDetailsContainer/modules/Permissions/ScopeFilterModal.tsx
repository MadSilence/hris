"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import type { Segment } from "@/models/segment/Segment";
import type { FilterDTO } from "@/models/user/fields";

export interface ScopeFilterModalProps {
  isOpen: boolean;
  /** e.g. "People · View" — which grant this filter belongs to. */
  grantLabel: string;
  value: Segment | undefined;
  onCancelAction: () => void;
  onConfirmAction: (segment: Segment) => void;
}

/**
 * Defines who a CUSTOM-scoped grant reaches, using the same builder as the audience picker — the
 * conditions mean the same thing here, so they should look and behave the same.
 */
export const ScopeFilterModal: React.FC<ScopeFilterModalProps> = ({
  isOpen,
  grantLabel,
  value,
  onCancelAction,
  onConfirmAction,
}) => {
  const { data: fields } = useUserFields();
  const [filters, setFilters] = React.useState<FilterDTO[]>(value?.filters ?? []);
  const [includeInactive, setIncludeInactive] = React.useState(value?.includeInactive ?? false);

  // Reseed whenever a different cell is opened.
  React.useEffect(() => {
    setFilters(value?.filters ?? []);
    setIncludeInactive(value?.includeInactive ?? false);
  }, [value, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancelAction()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Custom access scope</DialogTitle>
          <DialogDescription>
            {grantLabel} — this grant will reach everyone matching all of the conditions below.
          </DialogDescription>
        </DialogHeader>

        <AudienceBuilder
          key={grantLabel}
          fields={fields}
          value={filters}
          onChange={setFilters}
          includeInactive={includeInactive}
          onIncludeInactiveChange={setIncludeInactive}
        />

        {filters.length === 0 && (
          <p className="text-sm text-amber-700">
            A custom scope with no conditions is rejected on save — it would claim a reach it never
            defines.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancelAction}>
            Cancel
          </Button>
          <Button
            disabled={filters.length === 0}
            onClick={() => onConfirmAction({ filters, excludeUserIds: [], includeInactive })}
            className="bg-brown-600 text-white hover:bg-brown-700"
          >
            Save conditions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
