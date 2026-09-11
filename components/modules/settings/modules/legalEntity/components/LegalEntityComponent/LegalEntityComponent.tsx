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
import { Building2, Download, Plus } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
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

  // Success closes the dialog; a refusal keeps it open with the reason in it. Closing on ERROR too
  // is what made a rejected create look like a create that worked — the action answers 200 either
  // way, so the envelope was the only thing that ever said no, and nothing read it.
  useEffect(() => {
    if (createLegalEntityAction.data?.status === ActionStatus.SUCCESS) {
      setIsCreateLegalEntityModalOpen(false);
    }
  }, [createLegalEntityAction.data?.status]);

  const openCreate = () => {
    createLegalEntityAction.reset();
    setIsCreateLegalEntityModalOpen(true);
  };

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

    /*
       A switch between two views, not a widening of one: on shows **only** archived, off shows
       everything else. It used to be additive, so "show archived" meant "show everything" and there
       was no way to look at just the archive. Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
    */
    const base = initialEntities.filter((e) => (showArchived ? e.archived : !e.archived));

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
        <ListToolbar
          search={{ value: query, onChange: setQuery }}
          archived={{ count: archivedCount, showing: showArchived, onChange: setShowArchived }}
          secondary={
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
          }
          primary={
            <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
              <Button onClick={openCreate} className="gap-1.5">
                <Plus className="h-4 w-4"/>
                Add Legal Entity
              </Button>
            </PermissionGate>
          }
        />
      </div>

      <div>
        {isLoading ? (
          <LegalEntitySettingsSkeleton/>
        ) : filteredSorted.length === 0 ? (
          <ListEmptyState
            query={query}
            archivedView={showArchived}
            icon={<Building2 className="h-7 w-7"/>}
            title="No legal entities yet"
            description="A legal entity is the company people are employed by. Add the first one to start assigning people to it."
            noResultsHint="Try a different name, country or registration number."
            archivedDescription="Archived legal entities will appear here."
            onCreate={openCreate}
            createLabel="Add Legal Entity"
            createAccess={{ resource: "ORG.LEGAL_ENTITY" }}
          />
        ) : (
          <Table className="table-fixed">
            <TableHeader className="[&_tr]:border-brown-200 [&_tr]:border-t-0">
              <TableRow>
                <TableHead className="w-[22%]">Name</TableHead>
                <TableHead className="w-[13%]">Country</TableHead>
                <TableHead className="w-[13%]">Assigned Users</TableHead>
                <TableHead className="w-[27%]">Address</TableHead>
                <TableHead className="w-[12.5%]">Registration Number</TableHead>
                <TableHead className="w-[12.5%]">Tax ID</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSorted.map((e) => (
                <TableRow
                  key={e.id}
                  className={`group cursor-pointer border-brown-200 hover:bg-brown-50 [&_td]:py-2 ${
                    ""
                  }`}
                  onClick={() => handleRowClick(e)}
                >
                  <TableCell className="truncate py-3">
                    <span className="inline-flex items-center gap-2">
                      {e.name}
                      {e.archived && <StatusBadge status="archived"/>}
                    </span>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {e.country}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {e.assignedUsersCount}
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
        errorMessage={
          createLegalEntityAction.data?.status === ActionStatus.ERROR
            ? createLegalEntityAction.data.errorMessage
            : null
        }
        fieldErrors={
          createLegalEntityAction.data?.status === ActionStatus.ERROR
            ? createLegalEntityAction.data.fieldErrors
            : null
        }
        onConfirmAction={handleCreate}
        onCancelAction={() => {
          setIsCreateLegalEntityModalOpen(false);
          createLegalEntityAction.reset();
        }}
      />

      <ExportDataModal
        isOpen={isExportModalOpen}
        title="Export legal entities"
        rowCount={initialEntities.length}
        rowNoun="legal entities"
        description="Export all legal entities with their address, assigned people, and creation details."
        includedText="Included: name, description, registration number, tax ID, address, assigned people, created by, created at."
        onCancelAction={() => setIsExportModalOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
};
