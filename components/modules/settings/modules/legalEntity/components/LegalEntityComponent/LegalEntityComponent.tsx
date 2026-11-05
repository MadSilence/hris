"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateLegalEntityModal } from "../modals/CreateLegalEntityModal";
import type { CreateLegalEntityFormValues } from "../modals/CreateLegalEntityModal/CreateLegalEntityForm";
import { LegalEntity } from "@/models/legalEntity";
import { useCreateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useCreateLegalEntityAction";
import type { CreateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
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
  useArchiveLegalEntityAction,
  useRestoreLegalEntityAction,
} from "@/components/modules/settings/modules/legalEntity/hooks/useArchiveLegalEntityAction";
import type { AssignedUsersStrategy } from "@/components/modules/settings/modules/legalEntity/actions/archiveLegalEntityAction";
import { ArchiveLegalEntityModal } from "@/components/modules/settings/modules/legalEntity/components/modals/ArchiveLegalEntityModal";
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
  const t = useTranslations("structure.legalEntities");
  const tPlaces = useTranslations("structure.places");
  const tCommon = useTranslations("common");
  const [isCreateLegalEntityModalOpen, setIsCreateLegalEntityModalOpen] =
    useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const createLegalEntityAction = useCreateLegalEntityAction();
  const archiveAction = useArchiveLegalEntityAction();
  const restoreAction = useRestoreLegalEntityAction();
  // Archive is reached from the row as well as from the detail page, like every other list that
  // has it (`technical_documentation/ui/ACTIONS_AND_MENUS.md` §§ 1–2). The dialog is the detail
  // page's own: it asks what happens to the people assigned here.
  const [archiving, setArchiving] = useState<LegalEntity | null>(null);
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

  const handleRestore = (entity: LegalEntity) => {
    restoreAction.mutate(entity.id, {
      onSuccess: (result) => {
        if (result.status === ActionStatus.ERROR) showActionError(result);
      },
    });
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
              <Button type="button"
                size="icon"
                variant="secondary"
                aria-label={t("list.export")}
                onClick={() => setIsExportModalOpen(true)}
              >
                <Icon icon={Download01Icon} size="sm" />
              </Button>
            </PermissionGate>
          }
          primary={
            <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
              <Button type="button" onClick={openCreate} className="gap-1.5">
                <Icon icon={Add01Icon} size="sm" />
                {t("list.add")}
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
            scene="company-hub"
            title={t("list.emptyTitle")}
            description={t("list.emptyDescription")}
            noResultsHint={t("list.noResultsHint")}
            archivedDescription={t("list.archivedDescription")}
            onCreate={openCreate}
            createLabel={t("list.add")}
            createAccess={{ resource: "ORG.LEGAL_ENTITY" }}
          />
        ) : (
          <Table className="table-fixed">
            <TableHeader className="[&_tr]:border-divider [&_tr]:border-t-0">
              <TableRow>
                <TableHead className="w-[22%]">{tCommon("fields.name")}</TableHead>
                <TableHead className="w-[13%]">{tPlaces("country")}</TableHead>
                <TableHead className="w-[13%]">{tPlaces("assignedUsers")}</TableHead>
                <TableHead className="w-[27%]">{tPlaces("address")}</TableHead>
                <TableHead className="w-[12.5%]">{t("registrationNumber")}</TableHead>
                <TableHead className="w-[12.5%]">{t("taxId")}</TableHead>
                <TableHead className="w-12"><span className="sr-only">{tCommon("fields.actions")}</span></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSorted.map((e) => (
                <TableRow
                  key={e.id}
                  className={`group cursor-pointer border-divider hover:bg-subtle [&_td]:py-2 ${
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

                  <TableCell className="text-tertiary">
                    {e.country}
                  </TableCell>

                  <TableCell className="text-tertiary">
                    {e.assignedUsersCount}
                  </TableCell>

                  <TableCell className="truncate text-tertiary">
                    {[e.street, e.postCode, e.city, e.country]
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>

                  <TableCell className="truncate text-tertiary">
                    {e.registrationNumber}
                  </TableCell>

                  <TableCell className="truncate text-tertiary">
                    {e.taxId}
                  </TableCell>

                  <TableCell className="text-right">
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
                      <RowActionsMenu label={t("list.rowActions")} stopPropagation>
                        {e.archived ? (
                          <RowAction
                            icon={<Icon icon={ArchiveArrowUpIcon} size="sm" />}
                            onClick={() => handleRestore(e)}
                            disabled={restoreAction.isPending}
                          >
                            {tPlaces("unarchive")}
                          </RowAction>
                        ) : (
                          <RowAction icon={<Icon icon={Archive02Icon} size="sm" />} onClick={() => setArchiving(e)}>
                            {tCommon("actions.archive")}
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

      {archiving && (
        <ArchiveLegalEntityModal
          isOpen
          isLoading={archiveAction.isPending}
          entity={archiving}
          onConfirmAction={handleArchive}
          onRequestCloseAction={() => setArchiving(null)}
        />
      )}

      <ExportDataModal
        isOpen={isExportModalOpen}
        title={t("list.export")}
        rowCount={initialEntities.length}
        rowKind="legalEntities"
        description={t("list.exportDescription")}
        includedText={t("list.exportIncluded")}
        onCancelAction={() => setIsExportModalOpen(false)}
        onConfirmAction={handleExport}
      />
    </>
  );
};
