"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Office } from "@/models/office";
import { useCreateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useCreateOfficeAction";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Building2, Download, Plus } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { CreateOfficeModal } from "@/components/modules/settings/modules/office/components/modals/CreateOfficeModal";
import { CreateOfficeFormValues } from "../modals/CreateOfficeModal/CreateOfficeForm";
import { OfficeSettingsSkeleton } from "./OfficeSettingsSkeleton";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";

type Props = {
  initialOffices: Office[];
  isLoading: boolean;
};

export const OfficeComponent: FC<Props> = ({
  initialOffices,
  isLoading,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const createOfficeAction = useCreateOfficeAction();

  const openCreate = () => {
    createOfficeAction.reset();
    setIsCreateOpen(true);
  };

  const router = useRouter();

  // Success closes the dialog; a refusal keeps it open with the reason in it. Closing on ERROR too
  // is what made a rejected create look like a create that worked — the action answers 200 either
  // way, so the envelope was the only thing that ever said no, and nothing read it.
  useEffect(() => {
    if (createOfficeAction.data?.status === ActionStatus.SUCCESS) {
      setIsCreateOpen(false);
    }
  }, [createOfficeAction.data?.status]);

  const handleRowClick = (row: Office) => {
    router.push(`/settings/general/offices/${row.id}`);
  };

  const handleCreate = (values: CreateOfficeFormValues) => {
    const payload: CreateOfficeActionInput = {
      name: values.name,
      description: values.description,
      email: values.email,
      phone: values.phone,
      country: values.country,
      city: values.city,
      street: values.street,
      building: values.building,
      postCode: values.postCode,
    };

    createOfficeAction.mutate(payload);
  };

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload("/api/offices/export", format);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export offices:", error);
    }
  };

  const archivedCount = useMemo(
    () => initialOffices.filter((o) => o.archived).length,
    [initialOffices],
  );

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    /*
       A switch between two views, not a widening of one: on shows **only** archived, off shows
       everything else. It used to be additive, so "show archived" meant "show everything" and there
       was no way to look at just the archive. Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
    */
    const base = initialOffices.filter((o) => (showArchived ? o.archived : !o.archived));

    const rows = q
      ? base.filter((o) =>
        [
          o.name,
          o.country,
          o.city,
          o.street,
          o.email ?? "",
          o.phone ?? "",
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
      : base;

    return rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [initialOffices, query, showArchived]);

  return (
    <>
      <div className="py-6">
        <ListToolbar
          search={{ value: query, onChange: setQuery }}
          archived={{ count: archivedCount, showing: showArchived, onChange: setShowArchived }}
          secondary={
            <PermissionGate resource="ORG.OFFICE" action="EDIT">
              <Button
                size="icon"
                variant="outline"
                aria-label="Export offices"
                onClick={() => setIsExportOpen(true)}
              >
                <Download className="h-4 w-4"/>
              </Button>
            </PermissionGate>
          }
          primary={
            <PermissionGate resource="ORG.OFFICE" action="EDIT">
              <Button onClick={openCreate} className="gap-1.5">
                <Plus className="h-4 w-4"/>
                Add Office
              </Button>
            </PermissionGate>
          }
        />
      </div>

      {isLoading ? (
        <OfficeSettingsSkeleton/>
      ) : filteredSorted.length === 0 ? (
        <ListEmptyState
          query={query}
          archivedView={showArchived}
          icon={<Building2 className="h-7 w-7"/>}
          title="No offices yet"
          description="An office is a place people work from. Add the first one to start assigning people to it."
          noResultsHint="Try a different name, country or address."
          archivedDescription="Archived offices will appear here."
          onCreate={openCreate}
          createLabel="Add Office"
          createAccess={{ resource: "ORG.OFFICE" }}
        />
      ) : (
        <Table className="table-fixed">
          <TableHeader className="[&_tr]:border-brown-200 [&_tr]:border-t-0">
            <TableRow>
              <TableHead className="w-[22%]">Name</TableHead>
              <TableHead className="w-[13%]">Country</TableHead>
              <TableHead className="w-[13%]">Assigned Users</TableHead>
              <TableHead className="w-[27%]">Address</TableHead>
              <TableHead className="w-[12.5%]">Email</TableHead>
              <TableHead className="w-[12.5%]">Phone</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredSorted.map((o) => (
              <TableRow
                key={o.id}
                className={`group cursor-pointer border-brown-200 hover:bg-brown-50 [&_td]:py-2 ${
                  ""
                }`}
                onClick={() => handleRowClick(o)}
              >
                <TableCell className="truncate py-3">
                  <span className="inline-flex items-center gap-2">
                    {o.name}
                    {o.archived && <StatusBadge status="archived"/>}
                  </span>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {o.country}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {o.assignedUsersCount}
                </TableCell>

                <TableCell className="truncate text-muted-foreground">
                  {[o.street, o.building, o.postCode, o.city, o.country]
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>

                <TableCell className="truncate text-muted-foreground">
                  {o.email}
                </TableCell>

                <TableCell className="truncate text-muted-foreground">
                  {o.phone}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateOfficeModal
        isOpen={isCreateOpen}
        isLoading={createOfficeAction.isPending}
        errorMessage={
          createOfficeAction.data?.status === ActionStatus.ERROR
            ? createOfficeAction.data.errorMessage
            : null
        }
        fieldErrors={
          createOfficeAction.data?.status === ActionStatus.ERROR
            ? createOfficeAction.data.fieldErrors
            : null
        }
        onConfirmAction={handleCreate}
        onRequestCloseAction={() => {
          setIsCreateOpen(false);
          createOfficeAction.reset();
        }}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title="Export offices"
        rowCount={initialOffices.length}
        rowNoun="offices"
        description="Export all offices with their address, assigned people, and creation details."
        includedText="Included: name, description, email, phone, address, assigned people, created by, created at."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
};
