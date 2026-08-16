"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Role } from "@/models/role/Role";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Badge } from "@/public/desact/src/components/ui/badge";
import RolesTableSkeleton from "./RolesTableSkeleton";
import { useRoleDeleteImpact } from "@/components/modules/settings/modules/roles/hooks/useRoleDeleteImpact";
import RolesTableRowActions from "./RolesTableRowActions";
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
  buildRoleHref?: (roleId: string) => string;
  onRenameRole?: (roleId: string, values: { name: string; description?: string }) => void | Promise<void>;
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

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalMode, setNameModalMode] = useState<RoleActionMode>("rename");
  const [nameModalRole, setNameModalRole] =
    useState<{ id: string; name: string; description?: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<{ id: string; name: string } | null>(null);

  // Only fetched while the dialog is open (the hook is disabled without an id).
  const deleteImpact = useRoleDeleteImpact(deleteOpen ? deleteRole?.id : null);

  const hasRoles = (roleRows?.length ?? 0) > 0;

  const openRename = (role: Role) => {
    onClearErrors?.();
    setNameModalRole({ id: role.id, name: role.name, description: role.description });
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
    if (nameModalMode === "duplicate") return `${nameModalRole.name} copy`;
    return nameModalRole.name;
  }, [nameModalMode, nameModalRole?.name]);

  return (
    <>
      <Table className="table-fixed">
        <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead className="w-1/4">Name</TableHead>
            <TableHead className="w-1/4">Users</TableHead>
            <TableHead className="w-1/4">Status</TableHead>
            <TableHead className="w-1/4">Last Updated</TableHead>
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
                className="group border-brown-200 cursor-pointer hover:bg-brown-50 [&_td]:py-2"
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
                    <Badge variant="secondary" className="ml-2">
                      System
                    </Badge>
                  )}

                  {r.isDefault && (
                    <Badge variant="secondary" className="ml-2">
                      Default
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {r.userCount ?? "—"}
                </TableCell>

                <TableCell>
                  {r.archived ? (
                    <Badge variant="outline" className="border-brown-200 bg-brown-50 text-brown-700">
                      Archived
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                      Active
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-muted-foreground">{formatDate(r.updatedAt)}</TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <RolesTableRowActions
                      onRename={() => openRename(r)}
                      onDuplicate={() => openDuplicate(r)}
                      onDelete={() => openDelete(r)}
                      onArchive={() => void onArchiveRole?.(r.id, true)}
                      onRestore={() => void onArchiveRole?.(r.id, false)}
                      locked={r.systemOwner || r.isDefault}
                      archived={r.archived}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {!rolesLoading && !hasRoles && (
            <TableRow className="[&_td]:py-2">
              <TableCell colSpan={5}>
                <div className="text-sm text-muted-foreground">No roles yet</div>
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
            if (nameModalMode === "rename") await onRenameRole?.(nameModalRole.id, values);
            else await onDuplicateRole?.(nameModalRole.id, values);

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
    </>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}
