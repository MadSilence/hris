"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { FieldError } from "@/components/desact/field-error";
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
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { data: fields, isLoading: fieldsLoading } = useUserFields();
  const [filters, setFilters] = React.useState<FilterDTO[]>(value?.filters ?? []);
  const [includeInactive, setIncludeInactive] = React.useState(value?.includeInactive ?? false);
  const [tried, setTried] = React.useState(false);

  // Reseed whenever a different cell is opened.
  React.useEffect(() => {
    setFilters(value?.filters ?? []);
    setIncludeInactive(value?.includeInactive ?? false);
    setTried(false);
  }, [value, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancelAction()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("roles.permissions.customScope.title")}</DialogTitle>
          <DialogDescription>
            {t("roles.permissions.customScope.description", { grant: grantLabel })}
          </DialogDescription>
        </DialogHeader>

        <AudienceBuilder
          key={grantLabel}
          fields={fields}
          isLoadingFields={fieldsLoading}
          value={filters}
          onChange={setFilters}
          includeInactive={includeInactive}
          onIncludeInactiveChange={setIncludeInactive}
          includeInactiveLabel={t("roles.permissions.customScope.includeInactive")}
        />

        {filters.length === 0 && (tried ? (
          <FieldError>{t("roles.permissions.customScope.empty")}</FieldError>
        ) : (
          <p className="text-body text-status-pending-text">
            {t("roles.permissions.customScope.empty")}
          </p>
        ))}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancelAction}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button"
            onClick={() => {
              setTried(true);
              if (filters.length === 0) return;
              onConfirmAction({ filters, excludeUserIds: [], includeInactive });
            }}
 >
            {t("roles.permissions.customScope.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
