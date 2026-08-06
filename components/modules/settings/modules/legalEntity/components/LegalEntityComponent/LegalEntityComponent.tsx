"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateLegalEntityModal } from "../modals/CreateLegalEntityModal";
import type { CreateLegalEntityFormValues } from "../modals/CreateLegalEntityModal/CreateLegalEntityForm";
import { LegalEntity } from "@/models/legalEntity";
import { useCreateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useCreateLegalEntityAction";
import type { CreateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import { Archive, Building2, Download, Plus, Search } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  LegalEntitySettingsSkeleton
} from "@/components/modules/settings/modules/legalEntity/components/LegalEntityComponent/LegalEntitySettingsSkeleton";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";

type Props = {
  initialEntities: LegalEntity[];
  isLoading: boolean;
};

export const LegalEntityComponent: React.FC<Props> = ({
  initialEntities,
  isLoading,
}) => {
  const [isCreateLegalEntityModalOpen, setIsCreateLegalEntityModalOpen] =
    useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const createLegalEntityAction = useCreateLegalEntityAction();
  const router = useRouter();

  useEffect(() => {
    const status = createLegalEntityAction.data?.status;

    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateLegalEntityModalOpen(false);
    }
  }, [createLegalEntityAction.data?.status]);

  const handleRowClick = (row: LegalEntity) => {
    router.push(`/settings/general/legal-entities/${row.id}`);
  };

  const handleCreate = (values: CreateLegalEntityFormValues) => {
    const payload: CreateLegalEntityActionInput = {
      name: values.name,
      description: values.description,
      registrationNumber: values.registrationNumber,
      taxId: values.taxId,
      country: values.country,
      city: values.city,
      street: values.street,
      building: values.building,
      postCode: values.postCode,
    };

    createLegalEntityAction.mutate(payload);
  };

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload("/api/legal-entities/export", format);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Failed to export legal entities:", error);
    }
  };

  const archivedCount = useMemo(
    () => initialEntities.filter((e) => e.archived).length,
    [initialEntities],
  );

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = showArchived
      ? initialEntities
      : initialEntities.filter((e) => !e.archived);

    const rows = q
      ? base.filter((e) =>
        [
          e.name,
          e.country,
          e.city,
          e.street,
          e.registrationNumber,
          e.taxId,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
      : base;

    return rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [initialEntities, query, showArchived]);

  return (
    <>
      <div className="py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400"/>
            <Input
              placeholder="Search legal entities"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="pl-9 w-[260px] h-9"
              inputMode="search"
            />
          </div>

          <div className="flex items-center gap-3">
            {archivedCount > 0 && (
              <Button
                variant={showArchived ? "secondary" : "outline"}
                className="gap-1.5"
                onClick={() => setShowArchived((v) => !v)}
              >
                <Archive className="h-4 w-4"/>
                {showArchived ? "Hide archived" : `Show archived (${archivedCount})`}
              </Button>
            )}

            <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
              <Button onClick={() => setIsCreateLegalEntityModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4"/>
                Add Legal Entity
              </Button>
            </PermissionGate>

            <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
              <Button
                size="icon"
                variant="outline"
                aria-label="Export legal entities"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="h-4 w-4"/>
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>

      <div>
        {isLoading ? (
          <LegalEntitySettingsSkeleton/>
        ) : filteredSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brown-50 text-brown-500">
              <Building2 className="h-7 w-7"/>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {query.trim() ? "No legal entities match your search" : "No legal entities yet"}
              </p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                {query.trim()
                  ? "Try a different name, country, or registration number."
                  : "Add a legal entity to get started."}
              </p>
            </div>
          </div>
        ) : (
          <Table className="table-fixed">
            <TableHeader className="[&_tr]:border-brown-200 [&_tr]:border-t-0">
              <TableRow>
                <TableHead className="w-[22%]">Name</TableHead>
                <TableHead className="w-[13%]">Country</TableHead>
                <TableHead className="w-[13%]">Assigned Users</TableHead>
                <TableHead className="w-[27%]">Address</TableHead>
                <TableHead className="w-[12.5%]">Registration number</TableHead>
                <TableHead className="w-[12.5%]">Tax ID</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSorted.map((e) => (
                <TableRow
                  key={e.id}
                  className={`group cursor-pointer border-brown-200 hover:bg-brown-50 [&_td]:py-2 ${
                    e.archived ? "opacity-60" : ""
                  }`}
                  onClick={() => handleRowClick(e)}
                >
                  <TableCell className="truncate py-3">
                    <span className="inline-flex items-center gap-2">
                      {e.name}
                      {e.archived && (
                        <Badge variant="secondary" className="gap-1 font-normal">
                          <Archive className="h-3 w-3"/>
                          Archived
                        </Badge>
                      )}
                    </span>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {e.country}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {e.assignedUsersCount ?? "—"}
                  </TableCell>

                  <TableCell className="truncate text-muted-foreground">
                    {[e.street, e.postCode, e.city, e.country]
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>

                  <TableCell className="truncate text-muted-foreground">
                    {e.registrationNumber}
                  </TableCell>

                  <TableCell className="truncate text-muted-foreground">
                    {e.taxId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateLegalEntityModal
        isOpen={isCreateLegalEntityModalOpen}
        isLoading={createLegalEntityAction.isPending}
        onConfirmAction={handleCreate}
        onCancelAction={() => setIsCreateLegalEntityModalOpen(false)}
      />

      <ExportDataModal
        isOpen={isExportModalOpen}
        title="Export legal entities"
        description="Export all legal entities with their address, assigned people, and creation details."
        includedText="Included: name, description, registration number, tax ID, address, assigned people, created by, created at."
        onCancelAction={() => setIsExportModalOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
};
