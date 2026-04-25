"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Role } from "@/models/role/Role";
import { UsersSearchItemDTO } from "../UsersRolesTable";

export interface AssignRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  user: UsersSearchItemDTO | null;
  allRoles: Role[];

  onRequestClose: () => void;
  onApply: (userId: string, roleIds: string[]) => void;
}

function setKey(ids: string[]) {
  return [...new Set(ids)].sort().join("|");
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const a = (firstName ?? "").trim();
  const b = (lastName ?? "").trim();
  const initials = (a ? a[0] : "") + (b ? b[0] : "");
  if (initials) return initials.toUpperCase();
  const e = (email ?? "").trim();
  return (e[0] ?? "—").toUpperCase();
}

export default function AssignRolesModal({
  isOpen,
  isLoading = false,
  user,
  allRoles,
  onRequestClose,
  onApply,
}: AssignRolesModalProps) {
  const userId = user?.id ?? null;

  const initialRoleIds = React.useMemo(() => {
    if (!user) return [];
    return (user.roles ?? []).map((r) => r.id);
  }, [user]);

  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>(initialRoleIds);

  React.useEffect(() => {
    if (!isOpen) return;
    setSelectedRoleIds(initialRoleIds);
  }, [isOpen, userId, initialRoleIds]);

  const hasChanges = React.useMemo(() => {
    return setKey(selectedRoleIds) !== setKey(initialRoleIds);
  }, [selectedRoleIds, initialRoleIds]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      const has = prev.includes(roleId);
      return has ? prev.filter((id) => id !== roleId) : [...prev, roleId];
    });
  };

  const reset = () => setSelectedRoleIds(initialRoleIds);

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "User";
  const initials = getInitials(user?.firstName, user?.lastName, user?.email);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto p-8" hideClose>
        <DialogHeader>
          <DialogTitle>
            <div className="mb-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center">
                <span className="text-brown-700 font-semibold">{initials}</span>
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold truncate">{fullName}</h3>

                {/* если реально НЕ нужно показывать email — просто удали строку ниже */}
                {user?.email && <p className="text-sm text-muted-foreground truncate">{user.email}</p>}

                {user?.status && (
                  <Badge variant="secondary" className="mt-1">
                    {user.status}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogHeader>Manage assigned roles</DialogHeader>
        </DialogHeader>

        <div className="space-y-2">
          {allRoles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No roles available</div>
          ) : (
            allRoles.map((role) => {
              const checked = selectedRoleIds.includes(role.id);

              return (
                <label
                  key={role.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-brown-50 cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleRole(role.id)}
                    disabled={isLoading}
                  />

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-sm font-medium truncate">{role.name}</div>
                    {role.systemOwner && (
                      <Badge variant="secondary" className="shrink-0">
                        System
                      </Badge>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter className="mt-8">
          {hasChanges ? (
            <Button variant="outline" disabled={isLoading} onClick={reset}>
              Reset
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
          )}

          <Button
            disabled={isLoading || !hasChanges || !user}
            className="bg-brown-600 text-white hover:bg-brown-700"
            onClick={() => {
              if (!user) return;
              onApply(user.id, selectedRoleIds);
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
