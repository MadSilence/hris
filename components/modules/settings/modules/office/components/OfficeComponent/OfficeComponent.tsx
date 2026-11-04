"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Office } from "@/models/office";
import { useCreateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useCreateOfficeAction";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/desact/table";
import { Button } from "@/components/desact/button";
import { Add01Icon, Archive02Icon, ArchiveArrowUpIcon, Download01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { showActionError } from "@/lib/errors/errorToast";
import {
  useArchiveOfficeAction,
  useRestoreOfficeAction,
} from "@/components/modules/settings/modules/office/hooks/useArchiveOfficeAction";
import type { AssignedUsersStrategy } from "@/components/modules/settings/modules/office/actions/archiveOfficeAction";
import { ArchiveOfficeModal } from "@/components/modules/settings/modules/office/components/modals/ArchiveOfficeModal";
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
  const archiveAction = useArchiveOfficeAction();
  const restoreAction = useRestoreOfficeAction();
  // Archive is reached from the row as well as from the detail page, like every other list that
  // has it (`technical_documentation/ui/ACTIONS_AND_MENUS.md` §§ 1–2). The dialog is the detail
  // page's own: it asks what happens to the people assigned here.
  const [archiving, setArchiving] = useState<Office | null>(null);

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
      isRemote: values.isRemote,
      country: values.country,
      city: values.city,
      street: values.street,
      building: values.building,
      postCode: values.postCode,
    };

    createOfficeAction.mutate(payload);
  };

  const handleArchive = (strategy: AssignedUsersStrategy) => {
    if (!archiving) return;
    archiveAction.mutate(
      { id: archiving.id, assignedUsersStrategy: strategy },
      {
        onSuccess: (result) => {
          setArchiving(null);
          if (result.status === ActionStatus.ERROR) showActionError(result);
        },
      },
    );
  };

  const handleRestore = (office: Office) => {
    restoreAction.mutate(office.id, {
      onSuccess: (result) => {
        if (result.status === ActionStatus.ERROR) showActionError(result);
      },
    });
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
              <Button type="button"
                size="icon"
                variant="secondary"
                aria-label="Export offices"
                onClick={() => setIsExportOpen(true)}
              >
                <Icon icon={Download01Icon} size="sm" />
              </Button>
            </PermissionGate>
          }
          primary={
            <PermissionGate resource="ORG.OFFICE" action="EDIT">
              <Button type="button" onClick={openCreate} className="gap-1.5">
                <Icon icon={Add01Icon} size="sm" />
                Add office
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
          scene="company-hub"
          title="No offices yet"
          description="An office is a place people work from. Add the first one to start assigning people to it."
          noResultsHint="Try a different name, country or address."
          archivedDescription="Archived offices will appear here."
          onCreate={openCreate}
          createLabel="Add office"
          createAccess={{ resource: "ORG.OFFICE" }}
        />
      ) : (
        <Table className="table-fixed">
          <TableHeader className="[&_tr]:border-divider [&_tr]:border-t-0">
            <TableRow>
              <TableHead className="w-[22%]">Name</TableHead>
              <TableHead className="w-[13%]">Country</TableHead>
              <TableHead className="w-[13%]">Assigned users</TableHead>
              <TableHead className="w-[27%]">Address</TableHead>
              <TableHead className="w-[12.5%]">Email</TableHead>
              <TableHead className="w-[12.5%]">Phone</TableHead>
              <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredSorted.map((o) => (
              <TableRow
                key={o.id}
                className={`group cursor-pointer border-divider hover:bg-subtle [&_td]:py-2 ${
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

                <TableCell className="text-tertiary">
                  {o.country}
                </TableCell>

                <TableCell className="text-tertiary">
                  {o.assignedUsersCount}
                </TableCell>

                <TableCell className="truncate text-tertiary">
                  {[o.street, o.building, o.postCode, o.city, o.country]
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>

                <TableCell className="truncate text-tertiary">
                  {o.email}
                </TableCell>

                <TableCell className="truncate text-tertiary">
                  {o.phone}
                </TableCell>

                <TableCell className="text-right">
                  <PermissionGate resource="ORG.OFFICE" action="EDIT">
                    <RowActionsMenu label="Office actions" stopPropagation>
                      {o.archived ? (
                        <RowAction
                          icon={<Icon icon={ArchiveArrowUpIcon} size="sm" />}
                          onClick={() => handleRestore(o)}
                          disabled={restoreAction.isPending}
                        >
                          Unarchive
                        </RowAction>
                      ) : (
                        <RowAction icon={<Icon icon={Archive02Icon} size="sm" />} onClick={() => setArchiving(o)}>
                          Archive
                        </RowAction>
                      )}
                    </RowActionsMenu>
                  </PermissionGate>
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

      {archiving && (
        <ArchiveOfficeModal
          isOpen
          isLoading={archiveAction.isPending}
          office={archiving}
          onConfirmAction={handleArchive}
          onRequestCloseAction={() => setArchiving(null)}
        />
      )}

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
