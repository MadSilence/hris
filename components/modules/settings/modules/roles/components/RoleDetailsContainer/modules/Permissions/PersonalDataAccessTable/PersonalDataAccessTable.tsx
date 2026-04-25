"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { usePermissions } from "@/components/auth/PermissionsContext";

export type DataLevel = "NONE" | "READ" | "UPDATE" | "ADMIN";

const COLUMNS: { label: string; value: DataLevel }[] = [
  { label: "No access", value: "NONE" },
  { label: "Read", value: "READ" },
  { label: "Update", value: "UPDATE" },
  { label: "Admin", value: "ADMIN" },
];

export default function PersonalDataAccessTable({
  loading,
  value,
  onChange,
}: {
  loading: boolean;
  value: Record<string, DataLevel>;
  onChange: (fieldKey: string, level: DataLevel) => void;
}) {
  const { can } = usePermissions();
  const canEdit = can("PERM_ROLES_EDIT");

  const fields = React.useMemo(() => Object.keys(value ?? {}), [value]);

  return (
    <Table>
      <TableHeader className="[&_tr]:border-brown-200">
        <TableRow>
          <TableHead>Personal data</TableHead>
          {COLUMNS.map((c) => (
            <TableHead key={c.value} className="text-center">{c.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={`p-skel-${i}`} className="border-brown-200">
              <TableCell className="py-3"><Skeleton className="h-4 w-56"/></TableCell>
              {COLUMNS.map((c) => (
                <TableCell key={c.value} className="text-center">
                  <Skeleton className="h-4 w-4 rounded-full mx-auto"/>
                </TableCell>
              ))}
            </TableRow>
          ))}

        {!loading && fields.length === 0 && (
          <TableRow className="border-brown-200">
            <TableCell colSpan={1 + COLUMNS.length} className="text-sm text-muted-foreground py-3">
              No personal data fields
            </TableCell>
          </TableRow>
        )}

        {!loading &&
          fields.map((f) => {
            const v = value[f] ?? "NONE";
            return (
              <TableRow key={f} className="border-brown-200 [&_td]:py-2">
                <TableCell className="font-medium">{f}</TableCell>

                <RadioGroup
                  className="contents"
                  value={v}
                  onValueChange={(next) => onChange(f, next as DataLevel)}
                  disabled={!canEdit}
                >
                  {COLUMNS.map((c) => (
                    <TableCell key={c.value} className="text-center">
                      <RadioGroupItem value={c.value}/>
                    </TableCell>
                  ))}
                </RadioGroup>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
