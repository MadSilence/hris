"use client";

import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import { Button } from "@/public/desact/src/components/ui/button";
import { ChevronDown, Download, Plus } from "lucide-react";

import AddRoleModal from "./modals/AddRoleModal";
import ExportRolesModal from "./modals/ExportRolesModal";

export interface RolesPageHeaderProps {
  onCreateRole?: (values: { name: string }) => void;
  onCreateRoleFromTemplate?: (values: { templateId: string; name?: string }) => void;
  onExportRoles?: (values: { format: "csv" | "xlsx" }) => void;
  isCreatingRole?: boolean;
  isExporting?: boolean;
  templates?: { id: string; name: string; description?: string }[];
}

export default function RolesPageHeader({
  onCreateRole,
  onCreateRoleFromTemplate,
  onExportRoles,
  isCreatingRole = false,
  isExporting = false,
  templates = [],
}: RolesPageHeaderProps) {
  const [addOpen, setAddOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Actions
            <ChevronDown className="h-4 w-4 ml-2"/>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2"/>
            Add new Role
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4 mr-2"/>
            Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddRoleModal
        isOpen={addOpen}
        isLoading={isCreatingRole}
        templates={templates}
        onRequestClose={() => setAddOpen(false)}
        onCreateBlank={(values) => {
          onCreateRole?.(values);
          setAddOpen(false);
        }}
        onCreateFromTemplate={(values) => {
          onCreateRoleFromTemplate?.(values);
          setAddOpen(false);
        }}
      />

      <ExportRolesModal
        isOpen={exportOpen}
        isLoading={isExporting}
        onRequestClose={() => setExportOpen(false)}
        onExport={(values) => {
          onExportRoles?.(values);
          setExportOpen(false);
        }}
      />
    </>
  );
}
