"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CreateOfficeModal } from "@/components/modules/settings/modules/office/components/CreateOfficeModal";
import type { CreateOfficeFormValues } from "@/components/modules/settings/modules/office/components/CreateOfficeForm";
import { OfficeDetailsModal } from "@/components/modules/settings/modules/office/components/OfficeDetailsModal";
import { Office } from "@/models/office";
import { useCreateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useCreateOfficeAction";
import { useUpdateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useUpdateOfficeAction";
import { useDeleteOfficeAction } from "@/components/modules/settings/modules/office/hooks/useDeleteOfficeAction";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import type { UpdateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import type { DeleteOfficeActionInput } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { UpdateOfficeFormValues } from "@/components/modules/settings/modules/office/components/UpdateOfficeForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

type Props = {
  initialOffices: Office[];
  isLoading: boolean;
};

export const OfficeComponent: React.FC<Props> = ({ initialOffices, isLoading }) => {
  const [isCreateOfficeModalOpen, setIsCreateOfficeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const createOfficeAction = useCreateOfficeAction();
  const updateOfficeAction = useUpdateOfficeAction();
  const deleteOfficeAction = useDeleteOfficeAction();

  const selectedOffice = useMemo(
    () => initialOffices.find((o) => o.id === selectedOfficeId) ?? null,
    [initialOffices, selectedOfficeId],
  );


  useEffect(() => {
    const status = createOfficeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateOfficeModalOpen(false);
    }
  }, [createOfficeAction.data?.status]);

  useEffect(() => {
    const status = updateOfficeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDetailsModalOpen(false);
    }
  }, [updateOfficeAction.data?.status]);

  useEffect(() => {
    const status = deleteOfficeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDetailsModalOpen(false);
      setSelectedOfficeId(null);
    }
  }, [deleteOfficeAction.data?.status]);

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

  const handleUpdate = (values: UpdateOfficeFormValues) => {
    if (!selectedOffice) return;

    const payload: UpdateOfficeActionInput = {
      id: selectedOffice.id,
      isSystem: selectedOffice.isSystem,
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

    updateOfficeAction.mutate(payload);
  };

  const handleDelete = () => {
    if (!selectedOffice) return;

    const payload: DeleteOfficeActionInput = { id: selectedOffice.id };
    deleteOfficeAction.mutate(payload);
  };

  const handleRowClick = (row: Office) => {
    setSelectedOfficeId(row.id);
    setIsDetailsModalOpen(true);
  };

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? initialOffices.filter((o) =>
        [o.name, o.country, o.city, o.street, o.email ?? "", o.phone ?? ""]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
      : initialOffices;
    return rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [initialOffices, query]);

  const SkeletonRows = ({ rows = 5 }: { rows?: number }) => (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`off-skel-${i}`} className="border-brown-200">
          <TableCell className="py-3"><Skeleton className="h-4 w-40"/></TableCell>
          <TableCell><Skeleton className="h-4 w-24"/></TableCell>
          <TableCell><Skeleton className="h-4 w-64"/></TableCell>
          <TableCell><Skeleton className="h-4 w-40"/></TableCell>
          <TableCell><Skeleton className="h-4 w-28"/></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <>
      <div className="p-6 border-b border-brown-200">
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <Input
              placeholder="Search offices"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="w-[260px]"
              inputMode="search"
            />
          </div>
          <Button onClick={() => setIsCreateOfficeModalOpen(true)}>Add</Button>
        </div>
      </div>

      <div>
        <Table>
          <TableHeader className="[&_tr]:border-brown-200">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <SkeletonRows rows={6}/>}

            {!isLoading &&
              filteredSorted.map((o) => (
                <TableRow
                  key={o.id}
                  className="group border-brown-200 cursor-pointer hover:bg-brown-50 [&_td]:py-2"
                  onClick={() => handleRowClick(o)}
                >
                  <TableCell className="py-3 font-medium">{o.name}</TableCell>
                  <TableCell className="text-muted-foreground">{o.country}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[o.street, o.building, o.postCode, o.city, o.country].filter(Boolean).join(", ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{o.phone ?? "—"}</TableCell>
                </TableRow>
              ))}

            {!isLoading && filteredSorted.length === 0 && (
              <TableRow className="[&_td]:py-3">
                <TableCell colSpan={5}>
                  <div className="text-sm text-muted-foreground">No offices</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateOfficeModal
        isOpen={isCreateOfficeModalOpen}
        isLoading={createOfficeAction.isPending}
        onConfirmAction={handleCreate}
        onRequestCloseAction={() => setIsCreateOfficeModalOpen(false)}
      />

      {selectedOffice && (
        <OfficeDetailsModal
          isOpen={isDetailsModalOpen}
          isLoading={updateOfficeAction.isPending}
          isDeleteLoading={deleteOfficeAction.isPending}
          office={selectedOffice}
          onCancelAction={() => setIsDetailsModalOpen(false)}
          onSaveAction={handleUpdate}
          onDeleteAction={handleDelete}
        />
      )}
    </>
  );
};
