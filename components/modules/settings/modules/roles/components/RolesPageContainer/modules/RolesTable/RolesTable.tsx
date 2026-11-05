"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Role } from "@/models/role/Role";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/desact/table";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import { Badge } from "@/components/desact/badge";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import RolesTableSkeleton from "./RolesTableSkeleton";
import { useRoleDeleteImpact } from "@/components/modules/settings/modules/roles/hooks/useRoleDeleteImpact";
import RolesTableRowActions from "./RolesTableRowActions";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import {
  DeleteRoleModal
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/modals/DeleteRoleModal";
import {
  UpsertRoleNameModal
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/modals/UpsertRoleNameModal";

type RoleActionMode = "rename" | "duplicate";

export interface RolesTableProps {
  roleRows: Role[] | undefined;
  rolesLoading: boolean;
  /** The search text, so the empty screen can tell a miss from an empty list. */
  query?: string;
  showArchived?: boolean;
  buildRoleHref?: (roleId: string) => string;
  /** `version` is the role's version when the dialog opened — a stale one is refused (E00409). */
  onRenameRole?: (roleId: string, values: { name: string; description?: string; version?: number }) => void | Promise<void>;
  onDuplicateRole?: (roleId: string, values: { name: string }) => void | Promise<void>;
  onDeleteRole?: (roleId: string) => void | Promise<void>;
  onArchiveRole?: (roleId: string, archived: boolean) => void | Promise<void>;
  isSavingRoleName?: boolean;
  isDeletingRole?: boolean;
  saveRoleNameErrorMessage?: string;
  deleteRoleErrorMessage?: string;
  // Clears any stale rename/duplicate/delete error before a new modal opens.
  onClearErrors?: () => void;
}

export default function RolesTable({
  roleRows,
  rolesLoading,
  query,
  showArchived = false,
  buildRoleHref = (id) => `/settings/people/roles/${id}`,
  onRenameRole,
  onDuplicateRole,
  onDeleteRole,
  onArchiveRole,
  isSavingRoleName = false,
  isDeletingRole = false,
  saveRoleNameErrorMessage,
  deleteRoleErrorMessage,
  onClearErrors,
}: RolesTableProps) {
  const router = useRouter();

  const t = useTranslations("settings");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalMode, setNameModalMode] = useState<RoleActionMode>("rename");
  const [nameModalRole, setNameModalRole] =
    useState<{ id: string; name: string; description?: string; version?: number } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<{ id: string; name: string } | null>(null);

  /*
    Archiving takes the role from everybody who holds it (owner, 2026-11-01, WALK_QUESTIONS § 22),
    and unarchiving does not hand it back — so it confirms, naming how many people lose it.
  */
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; name: string; userCount: number } | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await onArchiveRole?.(archiveTarget.id, true);
      setArchiveTarget(null);
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : "Failed to archive role");
    } finally {
      setArchivePending(false);
    }
  };

  // Only fetched while the dialog is open (the hook is disabled without an id).
  const deleteImpact = useRoleDeleteImpact(deleteOpen ? deleteRole?.id : null);

  const hasRoles = (roleRows?.length ?? 0) > 0;

  const openRename = (role: Role) => {
    onClearErrors?.();
    // A snapshot: the version is the one this dialog was opened on, not whatever the list holds later.
    setNameModalRole({ id: role.id, name: role.name, description: role.description, version: role.version });
    setNameModalMode("rename");
    setNameModalOpen(true);
  };

  const openDuplicate = (role: Role) => {
    onClearErrors?.();
    setNameModalRole({ id: role.id, name: role.name });
    setNameModalMode("duplicate");
    setNameModalOpen(true);
  };

  const openDelete = (role: Role) => {
    onClearErrors?.();
    setDeleteRole({ id: role.id, name: role.name });
    setDeleteOpen(true);
  };

  const closeNameModal = () => {
    setNameModalOpen(false);
    setNameModalRole(null);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setDeleteRole(null);
  };

  const initialNameForModal = useMemo(() => {
    if (!nameModalRole?.name) return "";
    if (nameModalMode === "duplicate") return t("roles.table.copyName", { name: nameModalRole.name });
    return nameModalRole.name;
  }, [nameModalMode, nameModalRole?.name, t]);

  return (
    <>
      <Table className="table-fixed" stickyHeader>
        <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-1/4">{t("roles.table.columnName")}</TableHead>
            <TableHead className="w-1/4">{t("roles.table.columnUsers")}</TableHead>
            <TableHead className="w-1/4">{tCommon("fields.status")}</TableHead>
            <TableHead className="w-1/4">{t("roles.table.columnUpdated")}</TableHead>
            <TableHead className="w-12"/>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rolesLoading && <RolesTableSkeleton rows={5}/>}

          {!rolesLoading &&
            hasRoles &&
            roleRows!.map((r) => (
              <TableRow
                key={r.id}
                className="group border-divider cursor-pointer hover:bg-subtle [&_td]:py-2"
                onClick={() => router.push(buildRoleHref(r.id))}
              >
                <TableCell className="py-3">
                  <Link
                    href={buildRoleHref(r.id)}
                    className="text-primary font-medium no-underline hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {r.name}
                  </Link>

                  {r.systemOwner && (
                    <Badge variant="neutral" className="ml-2">
                      {t("roles.table.system")}
                    </Badge>
                  )}

                  {r.isDefault && (
                    <Badge variant="neutral" className="ml-2">
                      {t("roles.table.default")}
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-tertiary">
                  {r.userCount}
                </TableCell>

                <TableCell>
                  <StatusBadge status={r.archived ? "archived" : "active"}/>
                </TableCell>

                <TableCell className="text-tertiary">{formatDate(r.updatedAt, formatDisplayDate)}</TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <RolesTableRowActions
                      onRename={() => openRename(r)}
                      onDuplicate={() => openDuplicate(r)}
                      onDelete={() => openDelete(r)}
                      onArchive={() => {
                        setArchiveError(null);
                        setArchiveTarget({ id: r.id, name: r.name, userCount: r.userCount ?? 0 });
                      }}
                      onRestore={() => void onArchiveRole?.(r.id, false)}
                      locked={r.systemOwner || r.isDefault}
                      archived={r.archived}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {!rolesLoading && !hasRoles && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5}>
                <ListEmptyState
                  query={query}
                  archivedView={showArchived}
                  scene="policies"
                  title={t("roles.table.emptyTitle")}
                  description={t("roles.table.emptyDescription")}
                  noResultsHint={t("roles.table.noResultsHint")}
                  archivedDescription={t("roles.table.archivedDescription")}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <UpsertRoleNameModal
        isOpen={nameModalOpen}
        isLoading={isSavingRoleName}
        errorMessage={saveRoleNameErrorMessage}
        mode={nameModalMode}
        initialName={initialNameForModal}
        initialDescription={nameModalRole?.description ?? ""}
        // The role being edited keeps its own name, so it must not collide with itself.
        takenNames={(roleRows ?? [])
          .filter((role) => role.id !== nameModalRole?.id)
          .map((role) => role.name)}
        onCancelAction={closeNameModal}
        onConfirmAction={async (values) => {
          if (!nameModalRole) return;

          try {
            if (nameModalMode === "rename") {
              await onRenameRole?.(nameModalRole.id, { ...values, version: nameModalRole.version });
            } else {
              await onDuplicateRole?.(nameModalRole.id, values);
            }

            closeNameModal();
          } catch {
            // The error is surfaced inside the modal via errorMessage.
          }
        }}
      />

      <DeleteRoleModal
        isOpen={deleteOpen}
        isLoading={isDeletingRole}
        errorMessage={deleteRoleErrorMessage}
        roleName={deleteRole?.name}
        impact={deleteImpact.data}
        isImpactLoading={deleteImpact.isLoading}
        impactError={deleteImpact.error}
        onRequestCloseAction={closeDeleteModal}
        onConfirmAction={async () => {
          if (!deleteRole) return;

          try {
            await onDeleteRole?.(deleteRole.id);
            closeDeleteModal();
          } catch {
            // The error is surfaced inside the modal via errorMessage.
          }
        }}
      />

      <ConfirmActionModal
        isOpen={archiveTarget !== null}
        title={archiveTarget?.name ? t("roles.table.archiveTitle", { name: archiveTarget.name }) : t("roles.table.archiveTitleUnnamed")}
        description={
          archiveTarget && archiveTarget.userCount > 0
            ? t("roles.table.archiveHeld", { count: archiveTarget.userCount })
            : t("roles.table.archiveNobody")
        }
        confirmLabel={tCommon("actions.archive")}
        isLoading={archivePending}
        errorMessage={archiveError}
        onConfirmAction={confirmArchive}
        onCancelAction={() => setArchiveTarget(null)}
      />
    </>
  );
}

function formatDate(iso: string | null | undefined, formatDisplayDate: DateFormatter) {
  return iso ? formatDisplayDate(iso, { style: "medium" }) : "";
}
