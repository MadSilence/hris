"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Office } from "@/models/office";
import { useCreateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useCreateOfficeAction";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { CreateOfficeModal } from "@/components/modules/settings/modules/office/components/modals/CreateOfficeModal";
import { CreateOfficeFormValues } from "../modals/CreateOfficeModal/CreateOfficeForm";
import { OfficeSettingsSkeleton } from "./OfficeSettingsSkeleton";

type Props = {
  initialOffices: Office[];
  isLoading: boolean;
};

export const OfficeComponent: FC<Props> = ({
  initialOffices,
  isLoading,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

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

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const rows = q
      ? initialOffices.filter((o) =>
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
      : initialOffices;

    return rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [initialOffices, query]);

  return (
    <>
      <div className="py-6">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search offices"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            className="w-[260px]"
            inputMode="search"
          />

          <Button onClick={() => setIsCreateOpen(true)}>Add</Button>
        </div>
      </div>

      {isLoading ? (
        <OfficeSettingsSkeleton/>
      ) : (
        <Table>
          <TableHeader className="[&_tr]:border-brown-200 [&_tr]:border-t-0">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredSorted.map((o) => (
              <TableRow
                key={o.id}
                className="group cursor-pointer border-brown-200 hover:bg-brown-50 [&_td]:py-2"
                onClick={() => handleRowClick(o)}
              >
                <TableCell className="py-3">{o.name}</TableCell>

                <TableCell className="text-muted-foreground">
                  {o.country}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {[o.street, o.building, o.postCode, o.city, o.country]
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {o.email ?? "—"}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {o.phone ?? "—"}
                </TableCell>
              </TableRow>
            ))}

            {filteredSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="text-sm text-muted-foreground py-3">
                    No offices
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <CreateOfficeModal
        isOpen={isCreateOpen}
        isLoading={createOfficeAction.isPending}
        onConfirmAction={handleCreate}
        onRequestCloseAction={() => setIsCreateOpen(false)}
      />
    </>
  );
};
