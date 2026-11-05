"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { Button } from "@/components/desact/button";
import { Add01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { AddRoleModal } from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modals/AddRoleModal";
import { ExportRolesModal } from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modals/ExportRolesModal";
import { PermissionGate } from "@/components/auth/PermissionGate";

export interface RolesPageHeaderProps {
  existingRoleNames?: string[];
  onCreateRole?: (values: { name: string; description?: string }) => void | Promise<void>;
  onCreateRoleFromTemplate?: (values: { templateId: string; name?: string }) => void;
  onExportRoles?: (values: { format: "csv" | "xlsx" }) => void;
  isCreatingRole?: boolean;
  isExporting?: boolean;
  createRoleErrorMessage?: string;
  templates?: { id: string; name: string; description?: string }[];
}

export default function RolesPageHeader({
  existingRoleNames = [],
  onCreateRole,
  onCreateRoleFromTemplate,
  onExportRoles,
  isCreatingRole = false,
  isExporting = false,
  createRoleErrorMessage,
  templates = [],
}: RolesPageHeaderProps) {
  const t = useTranslations("settings");
  const [addOpen, setAddOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <PermissionGate resource="ROLES.ROLE" action="EDIT">
          <Button type="button" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Icon icon={Add01Icon} size="sm" />
            {t("roles.page.addRole")}
          </Button>
        </PermissionGate>

        <Button type="button"
          size="icon"
          variant="secondary"
          onClick={() => setExportOpen(true)}
          aria-label={t("roles.page.exportRoles")}
        >
          <Icon icon={Download01Icon} size="sm" />
        </Button>
      </div>

      <AddRoleModal
        isOpen={addOpen}
        isLoading={isCreatingRole}
        errorMessage={createRoleErrorMessage}
        templates={templates}
        existingNames={existingRoleNames}
        onCancelAction={() => setAddOpen(false)}
        onCreateBlankAction={async (values) => {
          try {
            await onCreateRole?.(values);
            setAddOpen(false);
          } catch {
            // The error is surfaced inside the modal via errorMessage.
          }
        }}
        onCreateFromTemplateAction={(values) => {
          onCreateRoleFromTemplate?.(values);
          setAddOpen(false);
        }}
      />

      <ExportRolesModal
        isOpen={exportOpen}
        isLoading={isExporting}
        onCancelAction={() => setExportOpen(false)}
        onConfirmAction={(values) => {
          onExportRoles?.(values);
          setExportOpen(false);
        }}
      />
    </>
  );
}
