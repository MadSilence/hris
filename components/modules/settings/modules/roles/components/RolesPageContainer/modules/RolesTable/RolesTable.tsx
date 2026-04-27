"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Role } from "@/models/role/Role";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Badge } from "@/public/desact/src/components/ui/badge";
import RolesTableSkeleton from "./RolesTableSkeleton";
import RolesTableRowActions from "./RolesTableRowActions";
import UpsertRoleModal from "./modals/UpsertRoleModal";
import {
  DeleteRoleModal
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/modals/DeleteRoleModal";

type RoleActionMode = "rename" | "duplicate";

export interface RolesTableProps {
  roleRows: Role[] | undefined;
  rolesLoading: boolean;
  buildRoleHref?: (roleId: string) => string;
  getRoleUpdatedByName?: (roleId: string) => string | undefined;
  onRenameRole?: (roleId: string, values: { name: string }) => void;
  onDuplicateRole?: (roleId: string, values: { name: string }) => void;
  onDeleteRole?: (roleId: string) => void;
}

export default function RolesTable({
  roleRows,
  rolesLoading,
  buildRoleHref = (id) => `/settings/people/roles/${id}`,
  getRoleUpdatedByName,
  onRenameRole,
  onDuplicateRole,
  onDeleteRole,
}: RolesTableProps) {
  const router = useRouter();

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalMode, setNameModalMode] = useState<RoleActionMode>("rename");
  const [nameModalRole, setNameModalRole] = useState<{ id: string; name: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<{ id: string; name: string } | null>(null);

  const hasRoles = (roleRows?.length ?? 0) > 0;

  const openRename = (role: Role) => {
    setNameModalRole({ id: role.id, name: role.name });
    setNameModalMode("rename");
    setNameModalOpen(true);
  };

  const openDuplicate = (role: Role) => {
    setNameModalRole({ id: role.id, name: role.name });
    setNameModalMode("duplicate");
    setNameModalOpen(true);
  };

  const openDelete = (role: Role) => {
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
      <Table>
        <TableHeader className="[&_tr]:border-brown-200">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Updated By</TableHead>
            <TableHead className="w-10"/>
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
                    className="text-primary hover:no-underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sanitizeRoleName(r.name)}
                  </Link>

                  {r.systemOwner && (
                    <Badge variant="secondary" className="ml-2">
                      System
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {r.active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>

                <TableCell className="text-muted-foreground">{formatDate(r.updatedAt)}</TableCell>

                <TableCell className="text-muted-foreground">
                  {getRoleUpdatedByName?.(r.id) ?? "—"}
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <RolesTableRowActions
                      onRename={() => openRename(r)}
                      onDuplicate={() => openDuplicate(r)}
                      onDelete={() => openDelete(r)}
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

      <UpsertRoleModal
        isOpen={nameModalOpen}
        isLoading={false}
        mode={nameModalMode}
        initialName={initialNameForModal}
        onRequestClose={closeNameModal}
        onConfirm={(values) => {
          if (!nameModalRole) return;

          if (nameModalMode === "rename") onRenameRole?.(nameModalRole.id, values);
          else onDuplicateRole?.(nameModalRole.id, values);

          closeNameModal();
        }}
      />

      <DeleteRoleModal
        isOpen={deleteOpen}
        isLoading={false}
        roleName={deleteRole?.name}
        onRequestCloseAction={closeDeleteModal}
        onConfirmAction={() => {
          if (!deleteRole) return;
          onDeleteRole?.(deleteRole.id);
          closeDeleteModal();
        }}
      />
    </>
  );
}

function sanitizeRoleName(name?: string | null) {
  if (!name) return "—";
  return name.replaceAll("_", " ").replace(/\s+/g, " ").trim();
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
