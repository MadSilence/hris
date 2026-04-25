"use client";

import React, { useMemo, useState } from "react";
import { useRoleModulePermissions } from "@/components/modules/settings/modules/roles/hooks/useRoleModulePermissions";
import { orderModules } from "@/components/modules/settings/modules/roles/config/moduleOrder";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Button } from "@/public/desact/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { usePermissions } from "@/components/auth/PermissionsContext";
import { Toast } from "@/components/ui/Toast";

type Level = "NONE" | "VIEW" | "EDIT" | "MANAGE";

export const RoleEditor: React.FC<{ roleId: string }> = ({ roleId }) => {
  const { data, isLoading } = useRoleModulePermissions(roleId);
  const { can } = usePermissions();
  const canEdit = can("PERM_ROLES_EDIT");
  const [pending, setPending] = useState<Record<string, Level> | null>(null);
  const modules = useMemo(() => (data?.modules ? orderModules(data.modules) : []), [data?.modules]);

  const current = pending || data?.modules || {};

  const { save, saving } = useRoleModulePermissions(roleId);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Module Permissions</h2>
        <PermissionGate anyOf={["PERM_ROLES_EDIT"]}>
          <Button
            disabled={saving || !pending}
            onClick={async () => {
              if (!pending) return;
              try {
                await save({ modules: pending });
                setPending(null);
                setToastMsg("Permissions saved");
              } catch {
                setToastMsg("Failed to save permissions");
              }
            }}
          >
            Save Changes
          </Button>
        </PermissionGate>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module</TableHead>
            <TableHead className="text-center">None</TableHead>
            <TableHead className="text-center">View</TableHead>
            <TableHead className="text-center">Edit</TableHead>
            <TableHead className="text-center">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={`s-${i}`}>
                <TableCell className="opacity-50">Loading…</TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            ))}
          {!isLoading &&
            modules.map((m) => {
              const value = current[m] || "NONE";
              return (
                <TableRow key={m}>
                  <TableCell className="font-medium">{m}</TableCell>
                  <RadioGroup
                    className="contents"
                    value={value}
                    onValueChange={(v) => {
                      if (!v) return;
                      setPending((prev) => ({ ...(prev || current), [m]: v as Level }));
                    }}
                    disabled={!canEdit}
                  >
                    <TableCell className="text-center">
                      <RadioGroupItem value="NONE" />
                    </TableCell>
                    <TableCell className="text-center">
                      <RadioGroupItem value="VIEW" />
                    </TableCell>
                    <TableCell className="text-center">
                      <RadioGroupItem value="EDIT" />
                    </TableCell>
                    <TableCell className="text-center">
                      <RadioGroupItem value="MANAGE" />
                    </TableCell>
                  </RadioGroup>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
};

export default RoleEditor;
