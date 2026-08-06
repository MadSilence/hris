"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Office } from "@/models/office";
import { useCreateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useCreateOfficeAction";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import { Archive, Building2, Download, Plus, Search } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
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
  const router = useRouter();

  useEffect(() => {
    const status = createOfficeAction.data?.status;

    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
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

    const base = showArchived
      ? initialOffices
      : initialOffices.filter((o) => !o.archived);

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
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400"/>
            <Input
              placeholder="Search offices"
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

            <PermissionGate resource="ORG.OFFICE" action="EDIT">
              <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4"/>
                Add Office
              </Button>
            </PermissionGate>

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
          </div>
        </div>
      </div>

      {isLoading ? (
        <OfficeSettingsSkeleton/>
      ) : filteredSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brown-50 text-brown-500">
            <Building2 className="h-7 w-7"/>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {query.trim() ? "No offices match your search" : "No offices yet"}
            </p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              {query.trim()
                ? "Try a different name, country, or address."
                : "Add an office to get started."}
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
              <TableHead className="w-[12.5%]">Email</TableHead>
              <TableHead className="w-[12.5%]">Phone</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredSorted.map((o) => (
              <TableRow
                key={o.id}
                className={`group cursor-pointer border-brown-200 hover:bg-brown-50 [&_td]:py-2 ${
                  o.archived ? "opacity-60" : ""
                }`}
                onClick={() => handleRowClick(o)}
              >
                <TableCell className="truncate py-3">
                  <span className="inline-flex items-center gap-2">
                    {o.name}
                    {o.archived && (
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <Archive className="h-3 w-3"/>
                        Archived
                      </Badge>
                    )}
                  </span>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {o.country}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {o.assignedUsersCount ?? "—"}
                </TableCell>

                <TableCell className="truncate text-muted-foreground">
                  {[o.street, o.building, o.postCode, o.city, o.country]
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>

                <TableCell className="truncate text-muted-foreground">
                  {o.email ?? "—"}
                </TableCell>

                <TableCell className="truncate text-muted-foreground">
                  {o.phone ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateOfficeModal
        isOpen={isCreateOpen}
        isLoading={createOfficeAction.isPending}
        onConfirmAction={handleCreate}
        onRequestCloseAction={() => setIsCreateOpen(false)}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title="Export offices"
        description="Export all offices with their address, assigned people, and creation details."
        includedText="Included: name, description, email, phone, address, assigned people, created by, created at."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
};
