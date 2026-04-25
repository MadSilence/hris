"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { usePermissions } from "@/components/auth/PermissionsContext";
import { orderModules } from "@/components/modules/settings/modules/roles/config/moduleOrder";

export type ModuleLevel = "NONE" | "VIEW" | "EDIT" | "MANAGE";

export default function ModulesAccessTable({
  loading,
  value,
  onChange,
}: {
  loading: boolean;
  value: Record<string, ModuleLevel>;
  onChange: (moduleKey: string, level: ModuleLevel) => void;
}) {
  const { can } = usePermissions();
  const canEdit = can("PERM_ROLES_EDIT");

  const modules = React.useMemo(() => orderModules(Object.keys(value ?? {})), [value]);

  return (
    <Table>
      <TableHeader className="[&_tr]:border-brown-200">
        <TableRow>
          <TableHead>Module</TableHead>
          <TableHead className="text-center">None</TableHead>
          <TableHead className="text-center">View</TableHead>
          <TableHead className="text-center">Edit</TableHead>
          <TableHead className="text-center">Manage</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={`m-skel-${i}`} className="border-brown-200">
              <TableCell className="py-3"><Skeleton className="h-4 w-48"/></TableCell>
              <TableCell className="text-center"><Skeleton className="h-4 w-4 rounded-full mx-auto"/></TableCell>
              <TableCell className="text-center"><Skeleton className="h-4 w-4 rounded-full mx-auto"/></TableCell>
              <TableCell className="text-center"><Skeleton className="h-4 w-4 rounded-full mx-auto"/></TableCell>
              <TableCell className="text-center"><Skeleton className="h-4 w-4 rounded-full mx-auto"/></TableCell>
            </TableRow>
          ))}

        {!loading && modules.length === 0 && (
          <TableRow className="border-brown-200">
            <TableCell colSpan={5} className="text-sm text-muted-foreground py-3">
              No modules
            </TableCell>
          </TableRow>
        )}

        {!loading &&
          modules.map((m) => {
            const v = value[m] ?? "NONE";
            return (
              <TableRow key={m} className="border-brown-200 [&_td]:py-2">
                <TableCell className="font-medium">{m}</TableCell>

                <RadioGroup
                  className="contents"
                  value={v}
                  onValueChange={(next) => onChange(m, next as ModuleLevel)}
                  disabled={!canEdit}
                >
                  <TableCell className="text-center"><RadioGroupItem value="NONE"/></TableCell>
                  <TableCell className="text-center"><RadioGroupItem value="VIEW"/></TableCell>
                  <TableCell className="text-center"><RadioGroupItem value="EDIT"/></TableCell>
                  <TableCell className="text-center"><RadioGroupItem value="MANAGE"/></TableCell>
                </RadioGroup>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
